import { WebSiteDataType } from 'types/webSite';
import { NonceDocument } from '../schemas/Nonce.schema';
import { WebSiteDocument } from '../schemas/WebSite.schema';
import { UserDocument } from '../schemas/User.schema';
import { EventType } from 'types/event';
import { Types } from 'mongoose';

export interface databaseInterface {
  createWebSite: (
    webSiteData: WebSiteDataType,
    authKey: string,
  ) => Promise<void>;

  getWebSite: (hostname: string, authKey: string) => Promise<WebSiteDocument>;

  saveNonce: (nonce: string, timestamp: number) => Promise<void>;

  removeNonce: (nonce: string, timestamp: number) => Promise<void>;

  checkIfNonceAlreadyExist: (
    nonce: string,
    timestamp: number,
  ) => Promise<NonceDocument | null>;

  getUser: (pseudo: string) => Promise<UserDocument>;

  createEvent: (event: EventType) => Promise<Types.ObjectId>;
}
