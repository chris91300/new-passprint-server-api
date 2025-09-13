import { writeFile, mkdir, chmod } from 'node:fs/promises';
import { join } from 'node:path';
import { type KeyPair } from './generatePrivateAndPublicKey';
import { config } from '../config/configurations';
import { existsSync } from 'node:fs';

/**
 * Sauvegarde la paire de clés (publique et privée) dans des fichiers.
 *
 * Cette fonction asynchrone prend un objet contenant les clés publique et privée
 * et les écrit dans des fichiers séparés. Les chemins de sauvegarde sont
 * déterminés par la configuration globale de l'application.
 * La fonction modifie les autorisation d'access aux fichiers avec un chmod à 600
 *
 * @param {KeyPair} keys - Un objet contenant la clé publique (`publicKey`) et la
 *                         clé privée (`privateKey`) au format PEM.
 * @returns {Promise<void>} Une promesse qui se résout lorsque les deux clés ont été
 *                          écrites avec succès dans leurs fichiers respectifs.
 * @throws {Error} La promesse sera rejetée si l'écriture de l'un des fichiers échoue.
 *                 L'erreur originale est journalisée dans la console, et une nouvelle
 *                 erreur plus descriptive est lancée.
 */
export async function savePrivateAndPublicKeyInFiles(keys: KeyPair) {
  try {
    const { publicKey, privateKey } = keys;

    const privateKeyPath = join(
      config.privateKeyFile.path,
      config.privateKeyFile.name,
    );

    const keysFilesAlreadyExist =
      existsSync(privateKeyPath) ||
      existsSync(join(config.publicKeyFile.path, config.publicKeyFile.name));
    if (keysFilesAlreadyExist) {
      console.log(
        "Les fichiers de clés existent déjà. Abandon de la sauvegarde pour éviter l'écrasement.",
      );
    } else {
      await mkdir(config.privateKeyFile.path, { recursive: true });
      await writeFile(privateKeyPath, privateKey, 'utf8');
      await chmod(privateKeyPath, 0o600); // Utiliser la notation octale 0o600
      console.log(
        `Clé privée sauvegardée et permissions définies sur 600 : ${privateKeyPath}`,
      );

      const publicKeyPath = join(
        config.publicKeyFile.path,
        config.publicKeyFile.name,
      );
      await writeFile(publicKeyPath, publicKey, 'utf8');
      await chmod(publicKeyPath, 0o644);
      console.log(
        `Clé publique sauvegardée et permissions définies sur 644 : ${publicKeyPath}`,
      );
    }
  } catch (err) {
    console.error('Erreur lors de la sauvegarde des clés :', err);
    throw new Error(
      `Échec de la sauvegarde des clés dans les fichiers : ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
