import { Inject, Injectable } from '@nestjs/common';
import { ownPublicKey } from 'configurations/ownPublicKey';
import { DATABASE_PROVIDER } from 'src/database/database.provider';
import { type databaseInterface } from 'src/database/interfaces/database.interface';
import {
  WebSiteDataType,
  webSiteRequestSchema,
  WebSiteRequestType,
} from 'types/webSite';
import { generateAuthKey } from 'utils/generateAuthKey';
import { nonceIsOverwhelmed } from 'utils/nonceIsStillValid';
import { checkSignature } from 'utils/passprintPackage/checkSignature';
import { decryptDataWithPrivateKey } from 'utils/passprintPackage/decryptDataWithPrivateKey';
import { getPrivateKey } from 'utils/passprintPackage/getPrivateKey';

@Injectable()
export class WebSiteService {
  constructor(
    @Inject(DATABASE_PROVIDER)
    private readonly database: databaseInterface,
    private readonly passprintPublicKey: string,
  ) {
    this.passprintPublicKey = ownPublicKey;
  }

  async create(data: WebSiteDataType) {
    const authKey = generateAuthKey();
    await this.database.createWebSite(data, authKey);
    return {
      success: true,
      authKey,
      publickey: this.passprintPublicKey,
    };
  }

  async checkRequestFromWebSite(request: string) {
    try {
      //  récupération de la clé privé
      const passprintPrivateKey = await getPrivateKey();
      // déchiffrement de la request
      const requestDecrypted =
        await decryptDataWithPrivateKey<WebSiteRequestType>(
          request,
          passprintPrivateKey,
        );
      //  vérification des données du payload déchiffré
      webSiteRequestSchema.parse(requestDecrypted);

      //  vérification du nonce et timestamp
      const nonceDocument = await this.database.checkIfNonceAlreadyExist(
        requestDecrypted.nonce,
        requestDecrypted.timestamp,
      );
      if (!nonceDocument) {
        throw new Error('nonce already use');
      }

      if (nonceIsOverwhelmed(nonceDocument)) {
        await this.database.removeNonce(
          requestDecrypted.nonce,
          requestDecrypted.timestamp,
        );
        throw new Error('nonce is overwhelmed');
      }

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
      const isSignatureValid = checkSignature(
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
