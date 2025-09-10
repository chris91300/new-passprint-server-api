import { readFile } from 'node:fs/promises';
import { config } from './configurations';

export async function getPublicKey() {
  const pathToFile = config.publicKeyFile.path + config.publicKeyFile.name;
  const publicKey = await readFile(pathToFile, 'utf8');

  return publicKey;
}
