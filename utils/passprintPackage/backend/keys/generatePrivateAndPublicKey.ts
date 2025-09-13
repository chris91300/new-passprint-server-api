import { generateKeyPair } from 'crypto';
import { promisify } from 'util';
import { config } from '../config/configurations';

// Promisification de la fonction crypto.generateKeyPair pour une utilisation avec async/await.
const generateKeyPairPromise = promisify(generateKeyPair);
const { generateKeyPair: keyPair } = config;

export type KeyPair = {
  publicKey: string;
  privateKey: string;
};

/**
 * Génère une paire de clés RSA (publique et privée).
 *
 * Cette fonction asynchrone génère une nouvelle paire de clés RSA en utilisant les
 * paramètres de configuration globaux. La clé privée générée est protégée par
 * une passphrase.
 *
 * @param {string} secret - La passphrase à utiliser pour chiffrer la clé privée.
 *                          Ceci est essentiel pour sécuriser la clé privée au repos.
 * @returns {Promise<KeyPair>} Une promesse qui se résout avec un objet contenant
 *                             la clé publique (`publicKey`) et la clé privée chiffrée (`privateKey`),
 *                             toutes deux au format PEM.
 * @throws {Error} La promesse sera rejetée si la génération des clés échoue.
 */
export async function generatePrivateAndPublicKey(
  secret: string,
): Promise<KeyPair> {
  const { publicKey, privateKey } = await generateKeyPairPromise('rsa', {
    modulusLength: keyPair.modulusLength,
    publicKeyEncoding: keyPair.publicKeyEncoding,
    privateKeyEncoding: {
      ...keyPair.privateKeyEncoding,
      passphrase: secret,
    },
  });

  return { publicKey, privateKey };
}
