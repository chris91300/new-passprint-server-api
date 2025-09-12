import { getCurrentTimestamp } from './getCurrentTimestamp';
import { getNonce } from './getNonce';
import {
  dataForRequestSchema,
  DataForRequestType,
  ResponseFromPassprintType,
} from './types';
import { signDataWithPrivateKey } from './signDataWithPrivateKey';
import { encryptDataWithPublicKey } from './encryptDataWithPublicKey';
import { passprintPublicKey } from './passprintPublicKey';
import { connexionPostPassprintAndSendPayload } from './connexionPostPassprintAndSendPayload';

export async function sendRequestToPassprint(data: DataForRequestType) {
  //  Vérifications des données fournis par le site
  dataForRequestSchema.parse(data);

  const timestamp = getCurrentTimestamp();
  const nonce = getNonce();

  const dataToSign = {
    ...data,
    timestamp,
    nonce,
  };
  const dataToSignString = JSON.stringify(dataToSign);

  const signature = await signDataWithPrivateKey(dataToSignString);

  const payload = {
    ...dataToSign,
    signature,
  };

  const payloadString = JSON.stringify(payload);

  const payloadEncrypted = await encryptDataWithPublicKey(
    payloadString,
    passprintPublicKey,
  );

  // maintenant il faut ouvrir une connexion avec sww et envoyer le payloadEncrypted
  // pourquoi pas vérifier le timestamp et nonce lors de la réponse de passprint?
  const responseFromPassprintAPI: ResponseFromPassprintType =
    await connexionPostPassprintAndSendPayload(payloadEncrypted);

  return responseFromPassprintAPI;
  //  ATTENTION, IL FAUT BIEN GÉRER LE RETOUR DES ERREURS
}
