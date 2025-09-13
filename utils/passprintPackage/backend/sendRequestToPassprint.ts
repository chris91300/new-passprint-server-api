import { getCurrentTimestamp } from './utils/getCurrentTimestamp';
import { getNonce } from './utils/getNonce';
import {
  dataForRequestSchema,
  DataForRequestType,
  ResponseFromPassprintType,
} from './types';
import { encryptDataWithPublicKey } from './utils/encryptDataWithPublicKey';
import { passprintPublicKey } from './utils/passprintPublicKey';
import { connexionPostPassprintAndSendPayload } from './utils/connexionPostPassprintAndSendPayload';
import { signDataWithPrivateKey } from './utils/signDataWithPrivateKey';

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
