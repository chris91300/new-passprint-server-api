import z from 'zod';

const hostnameRegex =
  /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/;

const hostname = z
  .hostname('Invalid host')
  .regex(hostnameRegex, { error: 'Invalid hostname' });

const pseudo = z.string('Invalid pseudo');

const authKey = z.string('Invalid authKey');

const requestType = z.enum(['signUp', 'signIn', 'update'], {
  error: "Invalid requestType. Must be 'signUp' ou 'signIn' ou 'update'",
});

const userDataAsked = z
  .array(z.string(), { error: 'Invalid userDataAsked' })
  .optional();

export const dataForRequestSchema = z.object({
  hostname,
  pseudo,
  authKey,
  requestType,
  userDataAsked,
});

export type DataForRequestType = z.infer<typeof dataForRequestSchema>;

export type PayloadDecryptedFromWebSiteType = DataForRequestType & {
  timestamp: number;
  nonce: string;
  signature: string;
};

type ResponseFromPassprintSuccedType = {
  success: true;
  data: string;
};

type ResponseFromPassprintFailedType = {
  success: false;
  message: string;
};

export type ResponseFromPassprintType =
  | ResponseFromPassprintSuccedType
  | ResponseFromPassprintFailedType;

export type ResponseFromPassprintDecryptedType = {
  pseudo: string;
  password: string;
  userData?: string[];
  timestamp: number;
  nonce: string;
  signature: string;
};

export type UserDataFromMessengerType = {
  pseudo: string;
  userData?: string[];
  password: string;
  requestType: 'signUp' | 'signIn' | 'update';
  signature: string;
};

export const hybridEncryptedPayloadSchema = z.object({
  iv: z.string(),
  authTag: z.string(),
  encryptedKey: z.string(),
  encryptedData: z.string(),
});
// Structure attendue du payload chiffré
export type HybridEncryptedPayload = z.infer<
  typeof hybridEncryptedPayloadSchema
>;

export interface DataFromMessengerType {
  type: string;
  pattern: string | null;
  channel: string;
  message: string;
}

export type HybridEncryptedPayloadWithKeyString = Omit<
  HybridEncryptedPayload,
  'encryptedKey'
> & { symmetricKey: Buffer<ArrayBufferLike> };
