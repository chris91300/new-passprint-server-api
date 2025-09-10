import crypto, { publicEncrypt } from 'crypto';

/**
 * Chiffre une chaîne de caractères avec une clé publique RSA.
 *
 * Cette fonction prend une chaîne de caractères à chiffrer (qui devrait déjà être sérialisée, par exemple en JSON)
 * et une clé publique au format PEM. Elle utilise l'algorithme RSA avec le padding OAEP pour le chiffrement.
 * Le résultat est retourné sous forme de chaîne encodée en base64, prête à être transmise.
 *
 * @param {string} contentToEncrypt - La chaîne de caractères à chiffrer.
 * @param {string} publicKey - La clé publique au format PEM à utiliser pour le chiffrement.
 * @returns {Promise<string>} Une promesse qui se résout avec les données chiffrées et encodées en base64.
 * @throws {Error} Lance une erreur si le chiffrement échoue. L'erreur originale est également journalisée.
 */
export async function encryptDataWithPublicKey(
  contentToEncrypt: string,
  publicKey: string,
) {
  try {
    // Le chiffrement avec `publicEncrypt` attend des données binaires (un Buffer).
    // On convertit donc la chaîne d'entrée en Buffer.
    const encryptedBuffer = publicEncrypt(
      { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
      Buffer.from(contentToEncrypt),
    );

    // Le buffer chiffré est ensuite converti en une chaîne encodée en base64 pour faciliter son transport (ex: dans un payload JSON).
    const encryptedData = encryptedBuffer.toString('base64');

    return encryptedData;
  } catch (err) {
    //console.error('Erreur lors du chiffrement des données :', err);
    throw err;
  }
}
