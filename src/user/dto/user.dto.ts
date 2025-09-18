import { z } from 'zod';

// Define the schema for UserInformations
const UserInformationsSchema = z.object({
  gender: z.enum(['Male', 'Female', 'Other']),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string(),
  dateOfBirthday: z.date(),
});

// Define the schema for Device
const DeviceSchema = z.object({
  pushToken: z.string(),
  platform: z.string(),
  systemVersion: z.string(),
  name: z.string(),
  passprintVersion: z.string(),
  bundleID: z.string(),
  screenSize: z.string(),
});

// Define the keys for UserInformations
const UserInformationsKeys = z.enum([
  'gender',
  'firstName',
  'lastName',
  'email',
  'phone',
  'address',
  'city',
  'postalCode',
  'country',
  'dateOfBirthday',
]);

// Define the schema for WebSite
const WebSiteSchema = z.object({
  hostname: z.string(),
  publicKey: z.string(),
  userPseudo: z.string(),
  passwordCrypted: z.string(),
  inscriptionDate: z.date().default(() => new Date()),
  lastRequestDate: z.date().optional(),
  isSiteBlocked: z.boolean().default(false),
  passwordModifiedAt: z.date().optional(),
  dataAskedBySite: z.array(UserInformationsKeys),
});

// Define the main User schema
export const UserSchema = z.object({
  pseudo: z.string(),
  userID: z.string(),
  publickKey: z.string(),
  devices: z.record(z.string(), DeviceSchema),
  informations: UserInformationsSchema,
  webSites: z.record(z.string(), WebSiteSchema),
  accountBlocked: z.boolean().default(false),
  useTemporaryPseudo: z.boolean().default(false),
  temporaryPseudoExpireAt: z.number().optional(),
  temporaryPseudo: z.string(),
  temporarySwitchKey: z.string().optional(),
});

export const userInscriptionSchema = UserSchema.pick({
  pseudo: true,
  publickKey: true,
  devices: true,
  informations: true,
});

export type UserCompletedType = z.infer<typeof UserSchema>;
export type UserInformationsType = z.infer<typeof UserInformationsSchema>;
export type DeviceType = z.infer<typeof DeviceSchema>;
export type WebSiteType = z.infer<typeof WebSiteSchema>;
export type UserInformationsKeysType = z.infer<typeof UserInformationsKeys>;
export type UserInscriptionType = z.infer<typeof userInscriptionSchema>;
