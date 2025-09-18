import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError, ZodType } from 'zod';
import { getZodErrorMessages } from 'utils/getZodErrorMesages';
import { type BodyFromWebSiteType } from '../dto/request-web-site.dto';

@Injectable()
export class validationWebSitedataPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: BodyFromWebSiteType) {
    try {
      console.log('dans le pipe du body');
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
        throw new BadRequestException('Validation failed', error.message);
      }
      throw new BadRequestException('Validation failed', 'Erreur inconnue');
    }
  }
}
