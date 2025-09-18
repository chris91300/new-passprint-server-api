import { Body, Controller, Post } from '@nestjs/common';
import { validationHybridEncryptedPayloadPipe } from 'src/pipes/validationHybridEncryptedPayloadPipe';
import {
  type HybridEncryptedPayload,
  hybridEncryptedPayloadSchema,
} from 'utils/passprint/types';

@Controller('user')
export class UserController {
  @Post('create')
  create(
    @Body(
      new validationHybridEncryptedPayloadPipe(hybridEncryptedPayloadSchema),
    )
    body: HybridEncryptedPayload,
  ) {
    try {
      hybridEncryptedPayloadSchema.parse(body);
      return { success: true, message: 'Payload is valid' };
    } catch (err) {
      if (err instanceof Error) {
        return { success: false, message: err.message };
      } else {
        return { success: false, message: 'Une erreur est survenue.' };
      }
    }
  }

  @Post('get-events')
  getEvents(
    @Body(
      new validationHybridEncryptedPayloadPipe(hybridEncryptedPayloadSchema),
    )
    body: HybridEncryptedPayload,
  ) {
    try {
      hybridEncryptedPayloadSchema.parse(body);
      return { success: true, message: 'Payload is valid' };
    } catch (err) {
      if (err instanceof Error) {
        return { success: false, message: err.message };
      } else {
        return { success: false, message: 'Une erreur est survenue.' };
      }
    }
  }

  @Post('valid-Events')
  validEvents(
    @Body(
      new validationHybridEncryptedPayloadPipe(hybridEncryptedPayloadSchema),
    )
    body: HybridEncryptedPayload,
  ) {
    try {
      hybridEncryptedPayloadSchema.parse(body);
      return { success: true, message: 'Payload is valid' };
    } catch (err) {
      if (err instanceof Error) {
        return { success: false, message: err.message };
      } else {
        return { success: false, message: 'Une erreur est survenue.' };
      }
    }
  }
}
