import { Inject, Injectable } from '@nestjs/common';
import { ownPublicKey } from 'configurations/ownPublicKey';
import { DATABASE_PROVIDER } from 'src/database/database.provider';
import { type databaseInterface } from 'src/database/interfaces/database.interface';
import { WebSiteDataType, webSiteRequestSchema } from 'types/webSite';
import { generateAuthKey } from 'utils/generateAuthKey';
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

  async requestFromWebSiteToUser(request: string) {
    try {
      //  récupération de la clé privé
      const passprintPrivateKey = await getPrivateKey();
      // déchiffrement de la request
      const requestDecrypted = await decryptDataWithPrivateKey(
        request,
        passprintPrivateKey,
      );
      //  vérification des données du payload déchiffré
      webSiteRequestSchema.parse(requestDecrypted);

      //  vérification du nonce et timestamp

      //  récupérer clé public du site avec hostname et authKey

      // vérifier la signature avec la clé public et les données récupérer

      //  vérifier que l'utilisateur n'a pas bloqué le site

      // enregistrer request dans event database

      //  si tout est ok alors on averti user avec notification. sinon on attend qu'il ouvre son appli
    } catch (err) {
      console.log(err);
      throw new Error("erreur lors du passage de la request à l'utilisateur");
    }
  }
}
