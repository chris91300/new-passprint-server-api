import { ZodError } from 'zod';

export const getZodErrorMessages = (error: ZodError) => {
  //const paramsError: string[] = [];
  return error.issues.map((err) => err.message);
};
