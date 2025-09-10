import crypto, { privateDecrypt } from 'crypto';

/**
 * Déchiffre des données avec une clé privée.
 *
 * Cette fonction prend une chaîne de caractères chiffrée (encodée en base64),
 * la déchiffre en utilisant la clé privée fournie et l'algorithme RSA avec le padding PKCS1.
 * Le résultat est ensuite désérialisé depuis une chaîne JSON vers un objet du type spécifié.
 *
 * @template T - Le type de l'objet attendu après le déchiffrement et la désérialisation.
 * @param {string} contentToDecrypt - La chaîne de caractères chiffrée, encodée en base64.
 * @param {string} privateKey - La clé privée au format PEM à utiliser pour le déchiffrement.
 * @returns {Promise<T>} Une promesse qui se résout avec l'objet déchiffré et désérialisé.
 * @throws {Error} Lance une erreur si le déchiffrement ou l'analyse JSON échoue.
 *                 L'erreur originale est également journalisée dans la console.
 */
export async function decryptDataWithPrivateKey<T>(
  contentToDecrypt: string,
  privateKey: string,
) {
  try {
    const decryptedBuffer = privateDecrypt(
      { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
      Buffer.from(contentToDecrypt, 'base64'),
    );

    const decryptedString = decryptedBuffer.toString('utf8');

    const decryptedObject = JSON.parse(decryptedString) as T;

    return decryptedObject;
  } catch (err) {
    //console.error('Erreur lors du déchiffrement des données :', err);
    throw err;
  }
}
