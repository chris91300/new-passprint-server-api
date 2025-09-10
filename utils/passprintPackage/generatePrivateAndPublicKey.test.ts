import crypto from 'crypto';
import { generatePrivateAndPublicKey } from './generatePrivateAndPublicKey';

describe('generatePrivateAndPublicKey', () => {
  const secret = 'my-super-secret-passphrase-for-testing';

  it('should generate a valid RSA public and private key pair', async () => {
    const keyPair = await generatePrivateAndPublicKey(secret);

    // 1. Vérifie que l'objet retourné a la bonne structure
    expect(keyPair).toHaveProperty('publicKey');
    expect(keyPair).toHaveProperty('privateKey');
    expect(typeof keyPair.publicKey).toBe('string');
    expect(typeof keyPair.privateKey).toBe('string');

    // 2. Vérifie que les clés sont au format PEM
    expect(keyPair.publicKey).toMatch(/^-----BEGIN PUBLIC KEY-----/);
    expect(keyPair.publicKey).toMatch(/-----END PUBLIC KEY-----\s*$/);

    expect(keyPair.privateKey).toMatch(/^-----BEGIN RSA PRIVATE KEY-----/);
    expect(keyPair.privateKey).toMatch(/-----END RSA PRIVATE KEY-----\s*$/);

    // 3. Vérifie que la clé privée est bien chiffrée
    expect(keyPair.privateKey).toContain('Proc-Type: 4,ENCRYPTED');
  });

  it('should generate a private key that is usable with the correct secret', async () => {
    const { publicKey, privateKey } = await generatePrivateAndPublicKey(secret);

    // Pour vérifier, nous chiffrons des données avec la clé publique
    // et nous les déchiffrons avec la clé privée en utilisant le secret.
    const originalData = 'données de test à chiffrer';
    const dataBuffer = Buffer.from(originalData, 'utf8');

    const encryptedBuffer = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      dataBuffer,
    );

    // Tentative de déchiffrement avec la clé privée et la bonne passphrase
    const decryptedBuffer = crypto.privateDecrypt(
      {
        key: privateKey,
        passphrase: secret,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      encryptedBuffer,
    );

    expect(decryptedBuffer.toString('utf8')).toBe(originalData);
  });

  it('should fail to use the private key with an incorrect secret', async () => {
    const { publicKey, privateKey } = await generatePrivateAndPublicKey(secret);
    const wrongSecret = 'ceci-est-le-mauvais-secret';

    const originalData = 'quelques autres données';
    const dataBuffer = Buffer.from(originalData, 'utf8');

    const encryptedBuffer = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      dataBuffer,
    );

    // Le déchiffrement doit échouer avec la mauvaise passphrase
    expect(() => {
      crypto.privateDecrypt(
        {
          key: privateKey,
          passphrase: wrongSecret,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        encryptedBuffer,
      );
    }).toThrow();
  });
});
