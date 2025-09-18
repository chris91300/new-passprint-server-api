import { RSAKeyPairOptions } from 'crypto';

const getCurrentFolder = (path: string) => {
  return path.split('/').pop();
};

const currentFolder = getCurrentFolder(process.cwd());

type GenerateKeyPairType = RSAKeyPairOptions<'pem', 'pem'>;
type KeysType = {
  path?: string;
  privateKeyFileName?: string;
  publicKeyFileName?: string;
  secretFileName?: string;
};

type MessengerConfigType = {
  port?: number;
  scope?: string;
  timeoutMs?: number;
};

export type PassprintPublicConfigType = {
  keys?: KeysType;
  messenger?: MessengerConfigType;
};

export type PassprintDefaultPublicConfigType = {
  keys: Required<KeysType>;
  messenger: Required<MessengerConfigType>;
};

export type PassprintDefaultPrivateConfigType = {
  generateKeyPair: GenerateKeyPairType;
  requestToPassprintUrl: string;
  passprintPublicKey: string;
};

export const PassprintDefaultPublicConfig: PassprintDefaultPublicConfigType = {
  keys: {
    path: `/home/${process.env.USER}/.passprint/${currentFolder}/`,
    privateKeyFileName: 'passprint_private_key.pem',
    publicKeyFileName: 'passprint_public_key.pem',
    secretFileName: 'passprint_passphrase.txt',
  },
  messenger: {
    port: 6379,
    scope: 'demo',
    timeoutMs: 30000,
  },
};

export const PassprintDefaultPrivateConfig: PassprintDefaultPrivateConfigType =
  {
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
    requestToPassprintUrl: 'http://localhost:5100/web-site/server',
    passprintPublicKey: `
-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAviFceaujcj/xZoRHIrGY
ctVyKjQ7d6Td3LpzLshbzHLR5tWokuvk6JyZmeAArfYNTJMG2knuM8FJYCiWqvnC
6RIX5RTjhG28mO1z3XBTAEYkbwT4W3LFTy9JKbfbceEtvKsLzkKnaANZG/b1TcyW
rKdQXvi2DszOGlRCsQ0X89EbCNSsqW1OV57eU2CUh3H+rkG7QpYsPoNKQNFqkop8
eAkfRg5a1W0UZuLlcYk2BWc2849qsc1MJVSpj5TJMXPwdx9MVukPeFMoacDvGot1
huxpJSdwi+dSyuXuJvib3KgsaUd4v5Mj5xiDhl9yniQ/RhOZJuNz3V1zaYcMEOLj
hFxRMZO9N1mFsiMJAP3Y7Sm+0dRdO/FYBXjcEb/7q3Gro8lalrFspEINllJPKx2H
J4H8y4Ino4ycZifJB7rQHen62zJjwmj/ey4fY9snUs1LgsP17EFK4PJWx4YVcbU1
jATp+r9d5qenmUiii+2dvqyn3jmK5Aa3qO7t1kH+wOJ2Bp0zCgH1xYfup2NuxxcH
vMZbm++WYgF/EnqFt4tV6bhq2Hcrln6DTLsIps6PmNBtPMH0+KIwWXxLCVdcF9yB
PFKvNygJLdJM/UCIg920RWhJAIl0TwcVcUBKJYnJsGTTGpzZgIXGxYqe48InrFJD
hvUdqhoDegn3az5SD/eK/TECAwEAAQ==
-----END PUBLIC KEY-----
`,
  };

export type GlobalConfig = PassprintDefaultPublicConfigType &
  PassprintDefaultPrivateConfigType;

export const defaultGlobalConfig: GlobalConfig = {
  ...PassprintDefaultPublicConfig,
  ...PassprintDefaultPrivateConfig,
};
