import { getCurrentTimestamp } from './getCurrentTimestamp';
import { getNonce } from './getNonce';
import {
  dataForRequestSchema,
  DataForRequestType,
  ResponseFromPassprintDecryptedType,
  ResponseFromPassprintType,
} from './types';
import { signDataWithPrivateKey } from './signDataWithPrivateKey';
import { encryptDataWithPublicKey } from './encryptDataWithPublicKey';
import { passprintPublicKey } from './passprintPublicKey';
import { connexionWithPassprintAndSendPayload } from './connexionWithPassprintAndSendPayload';
import { getPrivateKey } from './getPrivateKey';
import { decryptDataWithPrivateKey } from './decryptDataWithPrivateKey';
import { checkPassprintSignature } from './checkPassprintSignature';

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
  const payloadCryptedFromPassprint =
    await connexionWithPassprintAndSendPayload(payloadEncrypted);

  const responseParsed: ResponseFromPassprintType = JSON.parse(
    payloadCryptedFromPassprint,
  );
  if (!responseParsed.success) {
    throw new Error(responseParsed.message);
  }

  const privateKey = await getPrivateKey();
  const dataDecrypted =
    await decryptDataWithPrivateKey<ResponseFromPassprintDecryptedType>(
      responseParsed.data,
      privateKey,
    );

  const { signature: passprintSignature, ...payloadWithoutSignature } =
    dataDecrypted;
  const signatureIsValid = checkPassprintSignature(
    passprintSignature,
    JSON.stringify(payloadWithoutSignature),
  );

  if (!signatureIsValid) {
    throw new Error('the response signature is not valid');
  }

  const {
    pseudo,
    userData,
    password,
    nonce: responseNonce,
    timestamp: responseTimestamp,
  } = payloadWithoutSignature;

  if (responseNonce !== nonce) {
    throw new Error('the nonce sended not correspond to the one received');
  }
  if (responseTimestamp !== timestamp) {
    throw new Error('the timestamp sended not correspond to the one received');
  }

  const passwordDecrypted = await decryptDataWithPrivateKey(
    password,
    privateKey,
  );

  return { pseudo, userData, password: passwordDecrypted };
}
