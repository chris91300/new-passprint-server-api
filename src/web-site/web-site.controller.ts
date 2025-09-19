import { Body, Controller, Ip, Post } from '@nestjs/common';
import { WebSiteService } from './web-site.service';
import { validationWebSitedataPipe } from './pipes/validationWebSiteDataPipe';
import {
  webSiteDataSchema,
  type WebSiteDataType,
} from './dto/create-web-site.dto';
import { validationHybridEncryptedPayloadPipe } from 'src/pipes/validationHybridEncryptedPayloadPipe';
import {
  type HybridEncryptedPayload,
  hybridEncryptedPayloadSchema,
} from 'utils/passprint/types';

@Controller('web-site')
export class WebSiteController {
  constructor(private readonly webSiteService: WebSiteService) {}

  @Post('create')
  async create(
    @Ip() ip: string, // ::ffff:127.0.0.1 adresse IPv4 mappée à IPv6
    @Body(new validationWebSitedataPipe(webSiteDataSchema))
    body: WebSiteDataType,
  ) {
    try {
      // vérifier ip car la requete doit uniquement provenir du site passprint
      /**
       * par la suite il faudra récupérer l'ip vie le header 'x-forwarded-for'
       * car on utilisera un proxy. donc si on demande juste @Ip il donnera l'ip
       * du proxy
       * const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
       */
      console.log("la request vient de l'adresse ip : ", ip);

      const response = await this.webSiteService.create(body);

      return response;
    } catch (err) {
      if (err instanceof Error) {
        return { success: false, message: err.message };
      } else {
        return { success: false, message: 'Une erreur est survenue.' };
      }
    }
  }

  @Post('server')
  async request(
    @Ip() ip: string,
    @Body(
      new validationHybridEncryptedPayloadPipe(hybridEncryptedPayloadSchema),
    )
    body: HybridEncryptedPayload,
  ) {
    console.log('ip : ', ip);

    try {
      const response = await this.webSiteService.checkRequestFromWebSite(body);
      console.log('response : ', response);
      return response;
    } catch (err) {
      const error = {
        success: false,
        message: 'An error occurred',
      };
      if (err instanceof Error) {
        error.message = err.message;
      }
      return error;
    }
  }
}
