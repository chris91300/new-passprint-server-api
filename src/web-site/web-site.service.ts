import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_PROVIDER } from 'src/database/database.provider';
import { type databaseInterface } from 'src/database/interfaces/database.interface';
import { type WebSiteDataType, webSiteRequestSchema } from 'types/webSite';
import { generateAuthKey } from 'utils/generateAuthKey';
import { ConfigService } from '@nestjs/config';
import { BodyFromWebSiteType } from './dto/request-web-site.dto';
import { PassprintService } from 'utils/passprint/Passprint';

@Injectable()
export class WebSiteService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(DATABASE_PROVIDER)
    private readonly database: databaseInterface,
  ) {}

  getPublicKey(): string {
    const PASSPRINT_PUBLIC_KEY =
      this.configService.get<string>('passprintPublicKey');
    if (!PASSPRINT_PUBLIC_KEY) {
      throw new Error('PASSPRINT_PUBLIC_KEY is not defined');
    }

    return PASSPRINT_PUBLIC_KEY;
  }

  async create(data: WebSiteDataType) {
    const authKey = generateAuthKey();
    await this.database.createWebSite(data, authKey);
    return {
      success: true,
      authKey,
      publickey: this.getPublicKey(),
    };
  }

  async checkRequestFromWebSite(request: BodyFromWebSiteType) {
    try {
      /*//  récupération de la clé privé
      const passprintPrivateKey = await getPrivateKey();
      // déchiffrement de la request
      /*const requestDecrypted =
        await decryptDataWithPrivateKey<WebSiteRequestType>(
          request,
          passprintPrivateKey,
        );*/
      /*const decryptedHybridEncryptedData = await decryptHybridEncryptedData(
        request,
        passprintPrivateKey,
        'secret',
      );

      const requestDecrypted =
        await decryptDataWithPrivateKey<WebSiteRequestType>(
          decryptedHybridEncryptedData,
          passprintPrivateKey,
        );*/

      const requestDecrypted =
        await PassprintService.decryptRequestFromWebSite(request);

      //  vérification des données du payload déchiffré
      webSiteRequestSchema.parse(requestDecrypted);

      //  on vérifie que la requete n'est pas ancienne
      const currentTimestamp = Date.now();
      const toleranceInMilliseconds = 5000; // Par exemple, 5 secondes de tolérance
      // Vérification si le timestamp est trop vieux (plus ancien que le serveur actuel - tolérance)
      if (
        requestDecrypted.timestamp <
        currentTimestamp - toleranceInMilliseconds
      ) {
        console.error('Requête refusée : Timestamp trop ancien.');
        throw new Error('Requête refusée car trop ancienne.');
      }

      // Vérification si le timestamp est trop jeune (plus récent que le serveur actuel + tolérance)
      if (
        requestDecrypted.timestamp >
        currentTimestamp + toleranceInMilliseconds
      ) {
        console.error('Requête refusée : Timestamp trop jeune.');
        throw new Error('Requête refusée car le timestamp est trop jeune.');
      }
      //  vérification du nonce et timestamp
      const nonceDocument = await this.database.checkIfNonceAlreadyExist(
        requestDecrypted.nonce,
        requestDecrypted.timestamp,
      );
      if (nonceDocument) {
        throw new Error('nonce already use');
      }

      /*if (nonceIsOverwhelmed(nonceDocument)) {
        await this.database.removeNonce(
          requestDecrypted.nonce,
          requestDecrypted.timestamp,
        );
        throw new Error('nonce is overwhelmed');
      }*/

      await this.database.saveNonce(
        requestDecrypted.nonce,
        requestDecrypted.timestamp,
      );

      //  récupérer clé public du site avec hostname et authKey
      const webSite = await this.database.getWebSite(
        requestDecrypted.hostname,
        requestDecrypted.authKey,
      );

      const { signature, ...payloadWithoutSignature } = requestDecrypted;

      // vérifier la signature avec la clé public et les données récupérer
      const isSignatureValid = PassprintService.checkSignature(
        signature,
        webSite.publicKey,
        JSON.stringify(payloadWithoutSignature),
      );

      if (!isSignatureValid) {
        throw new Error('signature is not valid');
      }

      //  vérifier que l'utilisateur n'a pas bloqué le site
      const user = await this.database.getUser(requestDecrypted.pseudo);

      if (user.accountBlocked) {
        throw new Error('user is blocked');
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

      const eventID = await this.database.createEvent(payloadWithoutSignature);

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
