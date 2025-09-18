import path, { join } from 'node:path';
import {
  defaultGlobalConfig,
  GlobalConfig,
  PassprintDefaultPrivateConfig,
  type PassprintDefaultPrivateConfigType,
  PassprintDefaultPublicConfig,
  type PassprintDefaultPublicConfigType,
  PassprintPublicConfigType,
} from './configurations/passprint.config';
import { existsSync } from 'node:fs';
import { promisify } from 'util';
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import {
  createCipheriv,
  createDecipheriv,
  generateKeyPair,
  privateDecrypt,
  publicEncrypt,
  randomBytes,
  RsaPrivateKey,
  sign,
} from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  dataForRequestSchema,
  DataForRequestType,
  DataFromMessengerType,
  HybridEncryptedPayload,
  HybridEncryptedPayloadWithKeyString,
  PayloadDecryptedFromWebSiteType,
  ResponseFromPassprintType,
  UserDataFromMessengerType,
} from './types';
import { constants as nodeConstants, createVerify } from 'crypto';
import NRP from 'node-redis-pubsub';

const generateKeyPairPromise = promisify(generateKeyPair);
const signPromise = promisify(sign);

export default class Passprint {
  private publicKey: string;
  private privateKey: string;
  private secret: string;
  private readonly PASSPRINT_PRIVATE_DEFAULT_CONFIG: PassprintDefaultPrivateConfigType;
  private readonly PASSPRINT_PUBLIC_DEFAULT_CONFIG: PassprintDefaultPublicConfigType;
  private configs: GlobalConfig;
  private readonly rootConfigName: string;

  constructor() {
    this.publicKey = '';
    this.privateKey = '';
    this.secret = '';
    this.PASSPRINT_PRIVATE_DEFAULT_CONFIG = {
      ...PassprintDefaultPrivateConfig,
    };
    this.PASSPRINT_PUBLIC_DEFAULT_CONFIG = { ...PassprintDefaultPublicConfig };
    this.configs = { ...defaultGlobalConfig };
    this.rootConfigName = 'passprint.config.ts';
    this.#setUpKeys();
  }

  async #buildConfigurations() {
    try {
      const currentWorkingDirectory = process.cwd();
      const configurationsPath = path.resolve(
        currentWorkingDirectory,
        this.rootConfigName,
      );
      const rootConfigFileExists = existsSync(configurationsPath);

      if (rootConfigFileExists) {
        const configsModuleStringify = await readFile(
          configurationsPath,
          'utf8',
        );
        const configsModule: PassprintPublicConfigType = JSON.parse(
          configsModuleStringify,
        );
        //  importedConfigs = configsModule.default || configsModule;
        const globalConfigs: GlobalConfig = {
          keys: {
            ...this.PASSPRINT_PUBLIC_DEFAULT_CONFIG.keys,
            ...configsModule.keys,
          },
          messenger: {
            ...this.PASSPRINT_PUBLIC_DEFAULT_CONFIG.messenger,
            ...configsModule.messenger,
          },
          ...this.PASSPRINT_PRIVATE_DEFAULT_CONFIG,
        };
        this.#setConfigs(globalConfigs);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async #setUpKeys() {
    try {
      await this.#buildConfigurations();
      // on vérifie si les fichiers des public key , private key et passphrase existent déjà
      const keysAlreadyExists = this.#areKeysAlreadyExisting();
      // si oui on les récupère
      if (keysAlreadyExists) {
        console.log(
          'Les fichiers de clés existent déjà. Récupération des clés.',
        );
        await this.#getPrivateKey();
        await this.#getPublicKey();
        await this.#getSecret();
      } else {
        console.log(
          "Les fichiers de clés n'existent pas. Génération et sauvegarde des nouvelles clés.",
        );
        const { privateKey, publicKey, secret } =
          await this.#generateKeysAndSecret();
        await mkdir(this.configs.keys.path, { recursive: true });
        await this.#savePrivateKey(privateKey);
        await this.#savePublicKey(publicKey);
        await this.#saveScret(secret);
        this.#setPrivateKey(privateKey);
        this.#setPublicKey(publicKey);
        this.#setSecret(secret);
        console.log('Nouvelles clés générées et sauvegardées.');
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  #setConfigs(configs: GlobalConfig) {
    this.configs = configs;
  }

  #setPrivateKey(privateKey: string) {
    this.privateKey = privateKey;
  }

  #setPublicKey(publicKey: string) {
    this.publicKey = publicKey;
  }

  #setSecret(secret: string) {
    this.secret = secret;
  }

  #areKeysAlreadyExisting(): boolean {
    try {
      const privateKeyPath = this.#getPrivateKeyPath();
      const publicKeyPath = this.#getPublicKeyPath();

      const privateKeyAlreadyExists = existsSync(privateKeyPath);
      const publicKeyAlreadyExists = existsSync(publicKeyPath);

      if (privateKeyAlreadyExists && !publicKeyAlreadyExists) {
        throw new Error(
          `Le fichier de clé privée existe (${privateKeyPath}) mais pas le fichier de clé publique (${publicKeyPath}). Veuillez vérifier l'intégrité des fichiers de clés. Les deux doivent exister ou aucun.`,
        );
      }

      if (!privateKeyAlreadyExists && publicKeyAlreadyExists) {
        throw new Error(
          `Le fichier de clé publique existe (${publicKeyPath}) mais pas le fichier de clé privée (${privateKeyPath}). Veuillez vérifier l'intégrité des fichiers de clés. Les deux doivent exister ou aucun.`,
        );
      }
      return privateKeyAlreadyExists && publicKeyAlreadyExists;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  #getPrivateKeyPath(): string {
    return join(this.configs.keys.path, this.configs.keys.privateKeyFileName);
  }

  #getPublicKeyPath(): string {
    return join(this.configs.keys.path, this.configs.keys.publicKeyFileName);
  }

  #getSecretPath(): string {
    return join(this.configs.keys.path, this.configs.keys.secretFileName);
  }

  async #getPrivateKey(): Promise<void> {
    try {
      const privateKeyPath = this.#getPrivateKeyPath();
      const privateKey = await readFile(privateKeyPath, { encoding: 'utf8' });
      this.#setPrivateKey(privateKey);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async #getPublicKey(): Promise<void> {
    try {
      const publicKeyPath = this.#getPublicKeyPath();
      const publicKey = await readFile(publicKeyPath, { encoding: 'utf8' });
      this.#setPublicKey(publicKey);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async #getSecret(): Promise<void> {
    try {
      const secretPath = this.#getSecretPath();
      const secret = await readFile(secretPath, { encoding: 'utf8' });
      this.#setSecret(secret);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async #generateKeysAndSecret() {
    try {
      const keyPair = this.configs.generateKeyPair;
      const secret = uuidv4();
      const { publicKey, privateKey } = await generateKeyPairPromise('rsa', {
        modulusLength: keyPair.modulusLength,
        publicKeyEncoding: keyPair.publicKeyEncoding,
        privateKeyEncoding: {
          ...keyPair.privateKeyEncoding,
          passphrase: secret,
        },
      });

      return { publicKey, privateKey, secret };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async #savePrivateKey(privateKey: string) {
    try {
      const privateKeyPath = this.#getPrivateKeyPath();
      console.log('privateKeyPath : ', privateKeyPath);

      await writeFile(privateKeyPath, privateKey, 'utf8');
      await chmod(privateKeyPath, 0o600);
      console.log(
        `Clé privée sauvegardée et permissions définies sur 600 : ${privateKeyPath}`,
      );
    } catch (err) {
      console.log('erreur lors de la save private key');
      console.log(err);
      throw err;
    }
  }

  async #savePublicKey(publicKey: string) {
    try {
      const publicKeyPath = this.#getPublicKeyPath();
      await writeFile(publicKeyPath, publicKey, 'utf8');
      await chmod(publicKeyPath, 0o600);
      console.log(
        `Clé privée sauvegardée et permissions définies sur 600 : ${publicKeyPath}`,
      );
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async #saveScret(secret: string) {
    try {
      const secretPath = this.#getSecretPath();
      await writeFile(secretPath, secret, 'utf8');
      await chmod(secretPath, 0o600);
      console.log(
        `Secret sauvegardée et permissions définies sur 600 : ${secretPath}`,
      );
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  #getNonce() {
    return uuidv4();
  }

  #getCurrentTimestamp() {
    return Date.now();
  }

  #buildOriginalPayloadForPassprintApi(data: DataForRequestType) {
    const timestamp = this.#getCurrentTimestamp();
    const nonce = this.#getNonce();

    const dataToSign = {
      ...data,
      timestamp,
      nonce,
    };

    return dataToSign;
  }

  async #signDataWithPrivateKey(data: string): Promise<string> {
    try {
      // La clé privée est chiffrée, il faut fournir la passphrase pour l'utiliser.
      const signature = await signPromise('sha256', Buffer.from(data), {
        key: this.privateKey,
        passphrase: this.secret,
      });

      return signature.toString('base64');
    } catch (err) {
      console.error('Error during data signing:', err);
      throw new Error(
        `Failed to sign data: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  checkSignature(signature: string, publicKey: string, data: string) {
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

  #encryptDataWithSymetricKey(contentToEncrypt: string) {
    // 1. Générer une clé symétrique et un IV pour AES-256-GCM.
    const symmetricKey = randomBytes(32); // 256 bits
    const iv = randomBytes(12); // 96 bits, recommandé pour GCM.

    // 2. Chiffrer les données avec la clé symétrique.
    const cipher = createCipheriv('aes-256-gcm', symmetricKey, iv);
    const encryptedData = Buffer.concat([
      cipher.update(contentToEncrypt, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('base64'),
      symmetricKey,
      authTag: authTag.toString('base64'),
      encryptedData: encryptedData.toString('base64'),
    };
  }

  #decryptDataWithSymetricKey(
    contentToDecrypt: HybridEncryptedPayloadWithKeyString,
  ) {
    try {
      const iv = Buffer.from(contentToDecrypt.iv, 'base64');
      const authTag = Buffer.from(contentToDecrypt.authTag, 'base64');
      const symmetricKey = contentToDecrypt.symmetricKey;
      const encryptedData = Buffer.from(
        contentToDecrypt.encryptedData,
        'base64',
      );

      const decipher = createDecipheriv('aes-256-gcm', symmetricKey, iv);
      decipher.setAuthTag(authTag);

      const decryptedData = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final(),
      ]);

      return decryptedData.toString('utf8');
    } catch (err) {
      console.log('Erreur lors du déchiffrement symétrique :', err);
      throw err;
    }
  }

  #encryptedDataWithPublicKey(
    contentToEncrypt: Buffer<ArrayBufferLike>,
    publicKey: string,
  ): string {
    const encryptedKey = publicEncrypt(
      {
        key: publicKey,
        padding: nodeConstants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256', // Utiliser SHA-256 pour le padding OAEP est une bonne pratique.
      },
      contentToEncrypt,
    );

    return encryptedKey.toString('base64');
  }

  #decryptDataWithPrivateKey(contentToDecrypt: string) {
    try {
      console.log('Déchiffrement avec la clé privée en cours...');
      const contentToDecryptBuffer = Buffer.from(contentToDecrypt, 'base64');
      const decryptOptions: RsaPrivateKey = {
        key: this.privateKey,
        padding: nodeConstants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
        passphrase: this.secret,
      };

      const symmetricKey = privateDecrypt(
        decryptOptions,
        contentToDecryptBuffer,
      );
      return symmetricKey;
    } catch (err) {
      console.log('Erreur lors du déchiffrement avec la clé privée :', err);
      throw err;
    }
  }

  async #connexionPostPassprintAndSendPayload(payload: string) {
    console.log(typeof payload);
    try {
      const response = await fetch(this.configs.requestToPassprintUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload, // je n'arrive pas à lancer le payload.
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json(); // Parse JSON response
      console.log('Response data:', responseData);
      if (!responseData.success) {
        throw new Error(responseData.message);
      }
      return responseData;
    } catch (error) {
      console.error('Error sending POST request:', error);
      throw error;
    }
  }

  async sendRequestToPassprint(data: DataForRequestType) {
    //  Vérifications des données fournis par le site
    dataForRequestSchema.parse(data);

    const dataToSign = this.#buildOriginalPayloadForPassprintApi(data);
    const dataToSignString = JSON.stringify(dataToSign);

    const signature = await this.#signDataWithPrivateKey(dataToSignString);

    const payload = {
      ...dataToSign,
      signature,
    };

    const payloadString = JSON.stringify(payload);

    const symetricEncryptedPayload =
      this.#encryptDataWithSymetricKey(payloadString);

    const symetricKeyEncruptedWithPublicKey = this.#encryptedDataWithPublicKey(
      symetricEncryptedPayload.symmetricKey,
      this.configs.passprintPublicKey,
    );

    const finalPayload = {
      iv: symetricEncryptedPayload.iv,
      authTag: symetricEncryptedPayload.authTag,
      encryptedKey: symetricKeyEncruptedWithPublicKey,
      encryptedData: symetricEncryptedPayload.encryptedData,
    };
    const finalPayloadStringifyed = JSON.stringify(finalPayload);

    // maintenant il faut ouvrir une connexion avec sww et envoyer le payloadEncrypted
    // pourquoi pas vérifier le timestamp et nonce lors de la réponse de passprint?
    const responseFromPassprintAPI: ResponseFromPassprintType =
      await this.#connexionPostPassprintAndSendPayload(finalPayloadStringifyed);

    return responseFromPassprintAPI;
    //  ATTENTION, IL FAUT BIEN GÉRER LE RETOUR DES ERREURS
  }

  async #userDataFromMessenger(eventID: string) {
    const timeoutMs = this.configs.messenger.timeoutMs;
    const messengerConfig = {
      port: this.configs.messenger.port,
      scope: this.configs.messenger.scope,
    };
    const client = NRP(messengerConfig);

    return new Promise<string>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        client.quit();
        reject(
          new Error(
            `Timeout: Aucun message reçu pour l'eventID "${eventID}" en ${timeoutMs}ms.`,
          ),
        );
      }, timeoutMs);

      client.on(eventID, (data) => {
        clearTimeout(timeoutId);
        client.quit();
        resolve(data);
      });

      // Gérer les erreurs de connexion Redis
      client.on('error', (err) => {
        clearTimeout(timeoutId);
        client.quit();
        reject(new Error(`Erreur du client Redis Pub/Sub: ${err}`));
      });
    });
  }

  async getUserData(eventID: string) {
    try {
      const messageFromMessenger = await this.#userDataFromMessenger(eventID);
      const messageFromMessengerParsed: DataFromMessengerType =
        JSON.parse(messageFromMessenger);
      const message = messageFromMessengerParsed.message;
      const payloadEncrypted: HybridEncryptedPayload = JSON.parse(message);
      // les data ressemble à {iv, authTag, encryptedKey, encryptedData}
      const symmetricKey = this.#decryptDataWithPrivateKey(
        payloadEncrypted.encryptedKey,
      );
      //  maintenant j'ai la clé symetric
      const payloadEncryptedWithKey: HybridEncryptedPayloadWithKeyString = {
        iv: payloadEncrypted.iv,
        authTag: payloadEncrypted.authTag,
        encryptedData: payloadEncrypted.encryptedData,
        symmetricKey,
      };
      //  je peux déchiffrer le payload
      const payloadDecryptedString = this.#decryptDataWithSymetricKey(
        payloadEncryptedWithKey,
      );
      const payloadWithSignature: UserDataFromMessengerType = JSON.parse(
        payloadDecryptedString,
      );

      // voir ici comment faire pour vérifier d'abord la signature aveant de décrypter les données

      const { signature, ...data } = payloadWithSignature;
      const messageComeFromPassprint = this.checkSignature(
        signature,
        this.configs.passprintPublicKey,
        JSON.stringify(data),
      );
      if (messageComeFromPassprint) {
        return data;
      } else {
        throw new Error(
          'Le message ne provient pas de Passprint ou a été altéré.',
        );
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async decryptRequestFromWebSite(encryptedRequest: HybridEncryptedPayload) {
    try {
      const symmetricKey = this.#decryptDataWithPrivateKey(
        encryptedRequest.encryptedKey,
      );
      //  maintenant j'ai la clé symetric
      const payloadEncryptedWithKey: HybridEncryptedPayloadWithKeyString = {
        iv: encryptedRequest.iv,
        authTag: encryptedRequest.authTag,
        encryptedData: encryptedRequest.encryptedData,
        symmetricKey,
      };
      //  je peux déchiffrer le payload
      const payloadDecryptedString = this.#decryptDataWithSymetricKey(
        payloadEncryptedWithKey,
      );
      const payloadDecrypted: PayloadDecryptedFromWebSiteType = JSON.parse(
        payloadDecryptedString,
      );
      return payloadDecrypted;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

export const PassprintService = new Passprint();
