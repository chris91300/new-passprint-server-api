import crypto from 'crypto';
import { encryptDataWithPublicKey } from './encryptDataWithPublicKey';

describe('encryptDataWithPublicKey', () => {
  let privateKey: string;
  let publicKey: string;

  // Génère une paire de clés RSA avant l'exécution des tests.
  beforeAll(() => {
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048, // Taille de clé standard pour les tests (plus rapide).
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
  });

  /**
   * Fonction utilitaire pour déchiffrer les données afin de les vérifier.
   * Elle utilise la clé privée correspondante pour s'assurer que le chiffrement était correct.
   * @param encryptedContent - Le contenu chiffré en base64.
   * @param privKey - La clé privée PEM.
   * @returns La chaîne de caractères déchiffrée.
   */
  const decryptDataForVerification = (
    encryptedContent: string,
    privKey: string,
  ): string => {
    const decryptedBuffer = crypto.privateDecrypt(
      {
        key: privKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(encryptedContent, 'base64'),
    );
    return decryptedBuffer.toString('utf8');
  };

  it('should correctly encrypt a string and return it as base64', async () => {
    const originalContent = 'This is a secret message.';
    const encryptedData = await encryptDataWithPublicKey(
      originalContent,
      publicKey,
    );

    // Vérifie que la sortie est bien en base64
    const base64Regex =
      /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    expect(base64Regex.test(encryptedData)).toBe(true);

    // Pour vérifier, nous déchiffrons avec la clé privée correspondante.
    const decryptedContent = decryptDataForVerification(
      encryptedData,
      privateKey,
    );

    expect(decryptedContent).toBe(originalContent);
  });

  it('should correctly encrypt a JSON string', async () => {
    const originalObject = { user: 'test', id: 123, data: 'some informations' };
    const jsonString = JSON.stringify(originalObject);

    const encryptedData = await encryptDataWithPublicKey(jsonString, publicKey);

    const decryptedContent = decryptDataForVerification(
      encryptedData,
      privateKey,
    );
    const decryptedObject = JSON.parse(decryptedContent);

    expect(decryptedObject).toEqual(originalObject);
  });

  it('should throw an error if the public key is invalid', async () => {
    const content = 'this will fail';
    const invalidPublicKey =
      '-----BEGIN PUBLIC KEY-----\ninvalidKey\n-----END PUBLIC KEY-----';

    await expect(
      encryptDataWithPublicKey(content, invalidPublicKey),
    ).rejects.toThrow();
  });

  it('should throw an error if the content to be encrypted is too long for the RSA key', async () => {
    // La taille maximale pour une clé de 2048 bits avec padding OAEP (SHA-1 par défaut) est de 214 octets.
    // On génère une chaîne plus longue que ça pour tester la gestion d'erreur.
    const longContent = crypto.randomBytes(256).toString('hex');

    await expect(
      encryptDataWithPublicKey(longContent, publicKey),
    ).rejects.toThrow();
  });
});
