import { readFile } from 'node:fs/promises';
import { config } from '../config/configurations';

export async function getPrivateKey() {
  const pathToFile = config.privateKeyFile.path + config.privateKeyFile.name;
  const privateKey = await readFile(pathToFile, { encoding: 'utf8' });

  return privateKey;
}
