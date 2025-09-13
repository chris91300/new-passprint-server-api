import { createVerify } from 'crypto';

export function checkSignature(
  signature: string,
  publicKey: string,
  data: string,
) {
  try {
    // Créer un objet de vérification
    const verifier = createVerify('sha256');

    // Mettre à jour le vérificateur avec les données originales
    verifier.update(data);

    // Vérifier la signature avec la clé publique
    const isVerified = verifier.verify(publicKey, signature, 'base64');

    return isVerified;
  } catch (err) {
    console.error('Erreur lors de la vérification de la signature :', err);
    return false;
  }
}
