/*import { WebSiteDataType } from 'types/webSite';
import type { databaseInterface } from './interfaces/database.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseService implements databaseInterface {
  constructor(private readonly database: databaseInterface) {}

  async createWebSite(webSiteData: WebSiteDataType, authKey: string) {
    try {
      return await this.database.createWebSite(webSiteData, authKey);
    } catch (err) {
      console.log(err);
      throw new Error(
        'Une erreur est survenue lors de la création du site dans la base de données',
      );
    }
  }
}*/
