import crypto from 'crypto';
import { decryptDataWithPrivateKey } from './decryptDataWithPrivateKey';

// Helper function to encrypt data for testing purposes.
// This function correctly stringifies an object and encrypts it.
const encryptDataWithPublicKey = (
  contentToEncrypt: string,
  publicKey: string,
): string => {
  const encryptedBuffer = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    Buffer.from(contentToEncrypt, 'utf8'),
  );
  return encryptedBuffer.toString('base64');
};

describe('decryptDataWithPrivateKey', () => {
  let privateKey: string;
  let publicKey: string;
  let wrongPrivateKey: string;

  beforeAll(() => {
    // Generate a valid key pair for the tests
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048, // Smaller key size for faster tests
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
    });
    privateKey = keyPair.privateKey;
    publicKey = keyPair.publicKey;

    // Generate another key pair to have an invalid private key
    const wrongKeyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
    });
    wrongPrivateKey = wrongKeyPair.privateKey;
  });

  it('should correctly decrypt and parse a valid encrypted JSON object', async () => {
    const originalObject = { user: 'test', data: 'some secret info', id: 123 };
    const jsonString = JSON.stringify(originalObject);

    const encryptedContent = encryptDataWithPublicKey(jsonString, publicKey);

    const decryptedObject = await decryptDataWithPrivateKey<
      typeof originalObject
    >(encryptedContent, privateKey);

    expect(decryptedObject).toEqual(originalObject);
  });

  it('should throw an error if the private key is incorrect', async () => {
    const originalObject = { message: 'this will fail' };
    const jsonString = JSON.stringify(originalObject);
    const encryptedContent = encryptDataWithPublicKey(jsonString, publicKey);

    await expect(
      decryptDataWithPrivateKey(encryptedContent, wrongPrivateKey),
    ).rejects.toThrow();
  });

  it('should throw an error if the content to decrypt is not valid base64', async () => {
    const invalidContent = 'this is not valid base64 data';

    await expect(
      decryptDataWithPrivateKey(invalidContent, privateKey),
    ).rejects.toThrow();
  });

  it('should throw an error if the content is corrupted and cannot be decrypted', async () => {
    // This is valid base64, but not valid encrypted data for the given key
    const corruptedContent = Buffer.from('some random data').toString('base64');

    await expect(
      decryptDataWithPrivateKey(corruptedContent, privateKey),
    ).rejects.toThrow();
  });

  it('should throw a JSON parsing error if the decrypted content is not a valid JSON string', async () => {
    const nonJsonString = 'this is just a plain string, not JSON';
    const encryptedContent = encryptDataWithPublicKey(nonJsonString, publicKey);

    // The decryption will succeed, but JSON.parse will fail.
    await expect(
      decryptDataWithPrivateKey(encryptedContent, privateKey),
    ).rejects.toThrow(SyntaxError);
  });
});
