import z from 'zod';

export const requestWebSiteDtoSchema = z.string(
  'Invalid request. Must be a string',
);

export type RequestWebSiteDtoType = z.infer<typeof requestWebSiteDtoSchema>;
