import { awaitPayloadFromMessage } from './utils/awaitPayloadFromMessage';
import { decryptMessageFromSubscriber } from './utils/decryptMessageFromSubscriber';

export async function awaitPassword(eventID: string) {
  const payloadCrypted = await awaitPayloadFromMessage(eventID);
  const userData = await decryptMessageFromSubscriber(payloadCrypted);
  return userData;
}
