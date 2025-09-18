import z from 'zod';

export const requestWebSiteDtoSchema = z.string(
  'Invalid request. Must be a string',
);

export type RequestWebSiteDtoType = z.infer<typeof requestWebSiteDtoSchema>;

export const bodyFromWebSiteSchema = z.object({
  iv: z.string(),
  authTag: z.string(),
  encryptedKey: z.string(),
  encryptedData: z.string(),
});

export type BodyFromWebSiteType = z.infer<typeof bodyFromWebSiteSchema>;
