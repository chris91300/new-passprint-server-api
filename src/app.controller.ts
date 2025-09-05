/*import { Body, Controller, Ip, Post } from '@nestjs/common';
import { AppService } from './app.service';
import type { WebSiteDataType } from 'types/webSite';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('new-web-site')
  async create(@Ip() ip: string, @Body() body: WebSiteDataType) {
    try {
      // vérifier ip car la requete doit uniquement provenir du site passprint
      const {
        hostname,
        contactLastName,
        contactFirstName,
        contactEmail,
        publicKey,
      } = body;

      if (
        hostname &&
        contactLastName &&
        contactFirstName &&
        contactEmail &&
        publicKey
      ) {
        //  vérifier que le site n question n'existe pas déjà dans la bdd
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }
}*/
