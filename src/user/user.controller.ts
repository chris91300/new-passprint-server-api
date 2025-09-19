import { Body, Controller, Patch, Post } from '@nestjs/common';
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

  @Patch()
  update(
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

  @Post('add-device')
  setDevice(
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

  @Post('add-web-site')
  setWebSite(
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

  /*    A METTRE DANS UN CONTROLLER EVENT
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
  }*/
}
