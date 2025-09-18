import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError, ZodType } from 'zod';
import { getZodErrorMessages } from 'utils/getZodErrorMesages';
import { HybridEncryptedPayload } from 'utils/passprint/types';

@Injectable()
export class validationHybridEncryptedPayloadPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: HybridEncryptedPayload) {
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
      if (error instanceof Error) {
        throw new BadRequestException(
          'Validation payload failed',
          error.message,
        );
      }
      throw new BadRequestException(
        'Validation payload failed',
        'Erreur inconnue',
      );
    }
  }
}
