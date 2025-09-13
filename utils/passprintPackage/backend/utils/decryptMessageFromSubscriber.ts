import { checkPassprintSignature } from './checkPassprintSignature';
import { decryptDataWithPrivateKey } from './decryptDataWithPrivateKey';
import { getPrivateKey } from './getPrivateKey';
import {
  ResponseFromPassprintDecryptedType,
  ResponseFromPassprintType,
} from '../types';

export async function decryptMessageFromSubscriber(cryptedMessage: string) {
  const responseParsed: ResponseFromPassprintType = JSON.parse(cryptedMessage);
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
    /*nonce: responseNonce,
    timestamp: responseTimestamp,*/
  } = payloadWithoutSignature;
  /*
  if (responseNonce !== nonce) {
    throw new Error('the nonce sended not correspond to the one received');
  }
  if (responseTimestamp !== timestamp) {
    throw new Error('the timestamp sended not correspond to the one received');
  }*/

  const passwordDecrypted = await decryptDataWithPrivateKey<string>(
    password,
    privateKey,
  );

  return { pseudo, userData, password: passwordDecrypted };
}
