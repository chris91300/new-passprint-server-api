import { createSign } from 'crypto';
import { getPrivateKey } from './utils/getPrivateKey';

/**
 * Signs a string of data with the application's private key.
 *
 * This asynchronous function retrieves the application's private key and uses it
 * to create a SHA256 with RSA signature for the provided data. The resulting
 * signature is returned as a base64-encoded string, ready for transmission.
 *
 * @param {string} data - The string data to be signed.
 * @returns {Promise<string>} A promise that resolves with the base64-encoded signature.
 * @throws {Error} Throws an error if retrieving the private key or the signing process fails.
 *                 The original error is logged to the console.
 */
export async function signDataWithPrivateKey(data: string): Promise<string> {
  try {
    const privateKey = await getPrivateKey();

    // Create a signature object using SHA256
    const signer = createSign('sha256');

    // Update the signer with the data to be signed
    signer.update(data);

    // Sign the data with the private key and return it in base64 format
    return signer.sign(privateKey, 'base64');
  } catch (err) {
    console.error('Error during data signing:', err);
    throw new Error(
      `Failed to sign data: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
