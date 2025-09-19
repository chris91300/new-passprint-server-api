import { Injectable } from '@nestjs/common';
import { type WebSiteDataType, webSiteRequestSchema } from 'types/webSite';
import { generateAuthKey } from 'utils/generateAuthKey';
import { BodyFromWebSiteType } from './dto/request-web-site.dto';
import { PassprintService } from 'utils/passprint/Passprint';
import { NonceService } from 'src/nonce/nonce.service';
import { InjectModel } from '@nestjs/mongoose';
import { WebSite, WebSiteDocument } from 'src/database/schemas/WebSite.schema';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { EventService } from 'src/event/event.service';

@Injectable()
export class WebSiteService {
  constructor(
    private readonly NonceService: NonceService,
    private readonly UserService: UserService,
    private readonly EventService: EventService,
    @InjectModel(WebSite.name) private WebSiteModel: Model<WebSiteDocument>,
  ) {}

  async create(data: WebSiteDataType) {
    try {
      const authKey = generateAuthKey();
      const webSite = new this.WebSiteModel({
        ...data,
        authKey,
      });
      await webSite.save();
      return {
        success: true,
        authKey,
      };
    } catch (err) {
      console.log('erreur lors de la création du site web');
      console.log(err);
      return {
        success: false,
        message: 'erreur lors de la création du site web',
      };
    }
  }

  async checkRequestFromWebSite(request: BodyFromWebSiteType) {
    try {
      const requestDecrypted =
        await PassprintService.decryptRequestFromWebSite(request);

      //  vérification des données du payload déchiffré
      webSiteRequestSchema.parse(requestDecrypted);
      this.NonceService.isValid(requestDecrypted.timestamp);

      await this.NonceService.alreadyExist(
        requestDecrypted.nonce,
        requestDecrypted.timestamp,
      );

      await this.NonceService.save(
        requestDecrypted.nonce,
        requestDecrypted.timestamp,
      );

      const webSite = await this.WebSiteModel.findOne({
        hostname: requestDecrypted.hostname,
        authKey: requestDecrypted.authKey,
      });
      if (!webSite) {
        throw new Error('WebSite not found');
      }

      const { signature, ...payloadWithoutSignature } = requestDecrypted;

      // vérifier la signature avec la clé public et les données récupérer
      // passprint est modifié. il faut une methode qui gère le decrypt et la signature
      // ATTENTION: PAS POSSIBLE CAR J'AI BESOIN DE LA CLÉ PUBLIC DU SITE
      /**
       * A VOIR
       * la clé public peut etre envoyer avec la requete. pas besoin de la demander lors de l'inscription
       * surtout qu'elle est générer lorsque le serveur est lancé.
       */
      const isSignatureValid = PassprintService.checkSignatureFromWebSite(
        signature,
        webSite.publicKey,
        JSON.stringify(payloadWithoutSignature),
      );

      if (!isSignatureValid) {
        throw new Error('signature is not valid');
      }

      //  vérifier que l'utilisateur n'a pas bloqué le site
      const user = await this.UserService.getUser(requestDecrypted.pseudo);
      //const user = await this.database.getUser(requestDecrypted.pseudo);

      if (user.accountBlocked) {
        throw new Error('user account has been blocked');
      }

      const currentWebSite = user.webSites.get(requestDecrypted.authKey);

      if (!currentWebSite) {
        throw new Error(
          `Your website is not associated with user ${requestDecrypted.pseudo}`,
        );
      }

      if (currentWebSite.isSiteBlocked) {
        throw new Error('user has blocked this hostname');
      }

      // enregistrer request dans event database

      //const eventID = await this.database.createEvent(payloadWithoutSignature);
      const eventID = await this.EventService.create(payloadWithoutSignature);

      return {
        success: true,
        message: 'awaiting user validation',
        eventID: eventID,
      };

      //  si tout est ok alors on averti user avec notification. sinon on attend qu'il ouvre son appli
    } catch (err) {
      console.log(err);
      throw new Error("erreur lors du passage de la request à l'utilisateur");
    }
  }
}
