import { Body, Controller, Post } from '@nestjs/common';
import { validationHybridEncryptedPayloadPipe } from 'src/pipes/validationHybridEncryptedPayloadPipe';
import {
  type HybridEncryptedPayload,
  hybridEncryptedPayloadSchema,
} from 'utils/passprint/types';

@Controller('event')
export class EventController {
  @Post('get-events')
  getEvents(
    @Body(
      new validationHybridEncryptedPayloadPipe(hybridEncryptedPayloadSchema),
    )
    body: HybridEncryptedPayload,
  ) {
    try {
      // apres avoir decrypter le payload on doit verifier si des events exist pour user
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
