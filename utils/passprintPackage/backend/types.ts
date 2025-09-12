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

const userDataAsked = z.array(z.string(), { error: 'Invalid userDataAsked' });

export const dataForRequestSchema = z.object({
  hostname,
  pseudo,
  authKey,
  requestType,
  userDataAsked,
});

export type DataForRequestType = z.infer<typeof dataForRequestSchema>;

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
