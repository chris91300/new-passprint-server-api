import {
  dataForRequestSchema,
  DataForRequestType,
  DataFromMessengerType,
  HybridEncryptedPayload,
  HybridEncryptedPayloadWithKeyString,
  Method,
  PayloadDecryptedFromWebSiteType,
  ResponseFromPassprintType,
  UserDataFromMessengerType,
} from './types';
import NRP from 'node-redis-pubsub';
import { PassprintPrivateMethod } from './PassprintPrivateMethod';

export default class Passprint extends PassprintPrivateMethod {
  constructor() {
    super();
  }
  /*
  //  pas pour server passprint
  async sendPayloadToPassprint<T>(method: Method, payload: string): Promise<T> {
    console.log(typeof payload);
    try {
      const { requestToPassprintUrl } = this.getConfigs();
      const response = await fetch(requestToPassprintUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload, // je n'arrive pas à lancer le payload.
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json(); // Parse JSON response
      console.log('Response data:', responseData);
      if (!responseData.success) {
        throw new Error(responseData.message);
      }
      return responseData as T;
    } catch (error) {
      console.error('Error sending POST request:', error);
      throw error;
    }
  }
  //  pas pour server passprint
  async sendRequestToPassprint(data: DataForRequestType) {
    //  Vérifications des données fournis par le site
    dataForRequestSchema.parse(data);

    const { passprintPublicKey } = this.getConfigs();
    const dataToSign = this.buildOriginalPayloadForPassprintApi(data);
    const finalPayload = await this.signAndEncryptData<DataForRequestType>(
      dataToSign,
      passprintPublicKey,
    );

    const finalPayloadStringifyed = JSON.stringify(finalPayload);

    // maintenant il faut ouvrir une connexion avec sww et envoyer le payloadEncrypted
    // pourquoi pas vérifier le timestamp et nonce lors de la réponse de passprint?
    const responseFromPassprintAPI =
      await this.sendPayloadToPassprint<ResponseFromPassprintType>(
        'POST',
        finalPayloadStringifyed,
      );

    return responseFromPassprintAPI;
    //  ATTENTION, IL FAUT BIEN GÉRER LE RETOUR DES ERREURS
  }
  //  pas pour server passprint
  async userDataFromMessenger(eventID: string) {
    const { messenger } = this.getConfigs();
    const { timeoutMs, port, scope } = messenger;
    const messengerConfig = {
      port,
      scope,
    };
    const client = NRP(messengerConfig);

    return new Promise<string>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        client.quit();
        reject(
          new Error(
            `Timeout: Aucun message reçu pour l'eventID "${eventID}" en ${timeoutMs}ms.`,
          ),
        );
      }, timeoutMs);

      client.on(eventID, (data) => {
        clearTimeout(timeoutId);
        client.quit();
        resolve(data);
      });

      // Gérer les erreurs de connexion Redis
      client.on('error', (err) => {
        clearTimeout(timeoutId);
        client.quit();
        reject(new Error(`Erreur du client Redis Pub/Sub: ${err}`));
      });
    });
  }
  //  pas pour server passprint
  async getUserData(eventID: string) {
    try {
      const { passprintPublicKey } = this.getConfigs();
      const messageFromMessenger = await this.userDataFromMessenger(eventID);
      const messageFromMessengerParsed: DataFromMessengerType =
        JSON.parse(messageFromMessenger);
      const message = messageFromMessengerParsed.message;
      const payloadEncrypted: HybridEncryptedPayload = JSON.parse(message);

      const data = this.decryptDataAndCheckSign<UserDataFromMessengerType>(
        payloadEncrypted,
        passprintPublicKey,
      );
      return data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }*/

  async decryptRequestFromWebSite(encryptedRequest: HybridEncryptedPayload) {
    try {
      const symmetricKey = this.decryptDataWithPrivateKey(
        encryptedRequest.encryptedKey,
      );
      //  maintenant j'ai la clé symetric
      const payloadEncryptedWithKey: HybridEncryptedPayloadWithKeyString = {
        iv: encryptedRequest.iv,
        authTag: encryptedRequest.authTag,
        encryptedData: encryptedRequest.encryptedData,
        symmetricKey,
      };
      //  je peux déchiffrer le payload
      const payloadDecryptedString = this.decryptDataWithSymetricKey(
        payloadEncryptedWithKey,
      );
      const payloadDecrypted: PayloadDecryptedFromWebSiteType = JSON.parse(
        payloadDecryptedString,
      );
      return payloadDecrypted;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  checkSignatureFromWebSite(
    signature: string,
    publicKey: string,
    data: string,
  ) {
    return this.checkSignature(signature, publicKey, data);
  }
}

export const PassprintService = new Passprint();
