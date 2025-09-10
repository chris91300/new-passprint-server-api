import { Inject, Injectable } from '@nestjs/common';
import { ownPublicKey } from 'configurations/ownPublicKey';
import { DATABASE_PROVIDER } from 'src/database/database.provider';
import { type databaseInterface } from 'src/database/interfaces/database.interface';
import { WebSiteDataType } from 'types/webSite';
import { generateAuthKey } from 'utils/generateAuthKey';

@Injectable()
export class WebSiteService {
  constructor(
    @Inject(DATABASE_PROVIDER)
    private readonly database: databaseInterface,
    private readonly passprintPublicKey: string,
  ) {
    this.passprintPublicKey = ownPublicKey;
  }

  async create(data: WebSiteDataType) {
    const authKey = generateAuthKey();
    await this.database.createWebSite(data, authKey);
    return {
      success: true,
      authKey,
      publickey: this.passprintPublicKey,
    };
  }
}
