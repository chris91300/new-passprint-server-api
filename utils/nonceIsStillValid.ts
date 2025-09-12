import { NonceDocument } from 'src/database/schemas/Nonce.schema';

/**
 * Checks if a nonce is still valid by comparing its expiration timestamp to the current time.
 *
 * @param {NonceDocument} nonceDocument - The nonce document from the database, containing an expiration timestamp.
 * @returns {boolean} Returns `true` if the nonce has not expired (i.e., the current time is before the nonce's timestamp), `false` otherwise.
 * @throws {Error} Throws an error if any issue occurs during the check.
 */
export function nonceIsOverwhelmed(nonceDocument: NonceDocument): boolean {
  try {
    const { timestamp } = nonceDocument;
    const now = Date.now();
    // A nonce is valid if the current time is before its expiration timestamp.
    return now > timestamp;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(
        'An error occurred while checking nonce validity: ' + err.message,
      );
    }
    throw new Error('An unknown error occurred while checking nonce validity.');
  }
}
