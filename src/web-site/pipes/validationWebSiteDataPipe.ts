import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError, ZodType } from 'zod';

const getZodErrorMessages = (error: ZodError) => {
  //const paramsError: string[] = [];
  return error.issues.map((err) => err.message);
};

@Injectable()
export class validationWebSitedataPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: any) {
    try {
      this.schema.parse(value);
      return value;
    } catch (error) {
      // Zod retourne une erreur détaillée en cas de problème

      if (error instanceof ZodError) {
        const paramsError = getZodErrorMessages(error);
        const errorToReturn = {
          messages: paramsError,
          success: false,
        };

        throw new BadRequestException(errorToReturn);
      }
      throw new BadRequestException('Validation failed', error.errors);
    }
  }
}
