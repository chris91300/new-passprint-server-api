import { checkSignature } from './checkSignature';
import { getPassprintPublicKey } from './getPassprintPublicKey';

export function checkPassprintSignature(signature: string, data: string) {
  const passprintPublicKey = getPassprintPublicKey();
  return checkSignature(signature, passprintPublicKey, data);
}
