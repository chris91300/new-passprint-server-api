import { awaitPayloadFromMessage } from './awaitPayloadFromMessage';
import { decryptMessageFromSubscriber } from './decryptMessageFromSubscriber';

export async function awaitPassword(eventID: string) {
  const payloadCrypted = await awaitPayloadFromMessage(eventID);
  const userData = await decryptMessageFromSubscriber(payloadCrypted);
  return userData;
}
