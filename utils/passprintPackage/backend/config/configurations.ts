import { RSAKeyPairOptions } from 'crypto';

type GenerateKeyPairType = RSAKeyPairOptions<'pem', 'pem'>;

export type ConfigType = {
  generateKeyPair: GenerateKeyPairType;
  privateKeyFile: {
    path: string;
    name: string;
  };
  publicKeyFile: {
    path: string;
    name: string;
  };
};
export const config: ConfigType = {
  generateKeyPair: {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1', // pkcs8 est plus moderne mais moins compatible avec les anciennes applications
      format: 'pem',
      cipher: 'aes-256-cbc',
    },
  },
  privateKeyFile: {
    path: `/home/${process.env.USER}/.passprint/keys/`,
    name: 'passprint_private_key.pem',
  },
  publicKeyFile: {
    path: `/home/${process.env.USER}/.passprint/keys/`,
    name: 'passprint_public_key.pem',
  },
};
