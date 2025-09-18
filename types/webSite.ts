import { dataForRequestSchema } from 'utils/passprint/types';
import { z } from 'zod';

/**
 * 
 * Finalement, on ne laisse pas le choix du type de password
  passwordWithLowercase: z.boolean().default(true),
  passwordWithUppercase: z.boolean().default(true),
  passwordWithNumber: z.boolean().default(true),
  passwordWithSymbol: z.boolean().default(true),
  passwordLengthMin: z.number().min(10, "Password must be at least 10"),
  passwordLengthMax: z.number().max(50, "Password must be at least 50"),
 */

/*
const publickeyRegex = /^-{5}BEGIN PUBLIC KEY-{5}(?:[\s\S](?!\s*-{5}BEGIN PUBLIC KEY-{5}))*[\s\S]-{5}END PUBLIC KEY-{5}$/;*/

const publicKeyRegex =
  /^-----BEGIN RSA PUBLIC KEY-----\s+([a-zA-Z0-9\/\r\n+=]+)\s+-----END RSA PUBLIC KEY-----$/;

const hostnameRegex =
  /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/;

const hostname = z
  .hostname('Invalid host')
  .regex(hostnameRegex, { error: 'Invalid hostname' });

const contactLastName = z.string().nonempty('Last name is required');

const contactFirstName = z.string().nonempty('First name is required');

const contactEmail = z.email('Invalid email address');

const publicKey = z.string().regex(publicKeyRegex, {
  message: 'Format de clé publique invalide (doit être au format PEM)',
});

const ipv4 = z.ipv4('Invalid ipv4 address');

const ipv6 = z.ipv6('Invalid ipv6 address');

const authKey = z.uuid('Invalid authentification key');

const createdAt = z.number();

export const webSiteDataSchema = z.object({
  hostname,
  contactLastName,
  contactFirstName,
  contactEmail,
  publicKey,
});

export const webSiteDataDefaultValues = {
  hostname: '',
  contactLastName: '',
  contactFirstName: '',
  contactEmail: '',
  publicKey: '',
};

export type WebSiteDataType = z.infer<typeof webSiteDataSchema>;

export const webSiteDatabaseSchema = webSiteDataSchema.extend({
  /* ipv4,
  ipv6,*/
  authKey,
  createdAt,
});

export type WebSiteDatabaseType = z.infer<typeof webSiteDatabaseSchema>;

export const webSiteRequestSchema = dataForRequestSchema.extend({
  timestamp: z.number('Invalid timestamp'),
  nonce: z.string('Invalid nonce'),
  signature: z.string('Invalid signature'),
});

export type WebSiteRequestType = z.infer<typeof webSiteRequestSchema>;
