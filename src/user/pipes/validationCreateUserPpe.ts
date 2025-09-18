import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError, ZodType } from 'zod';
import { getZodErrorMessages } from 'utils/getZodErrorMesages';
import { UserInscriptionType } from '../dto/user.dto';

@Injectable()
export class validationCreateUserPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: UserInscriptionType) {
    try {
      console.log('dans le pipe create user');
      console.log(value);
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
          'Validation create user failed',
          error.message,
        );
      }
      throw new BadRequestException(
        'Validation create user failed',
        'Erreur inconnue',
      );
    }
  }
}
