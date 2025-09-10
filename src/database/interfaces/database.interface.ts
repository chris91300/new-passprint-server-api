import { WebSiteDataType } from 'types/webSite';
import { NonceDocument } from '../schemas/Nonce.schema';

export interface databaseInterface {
  createWebSite: (
    webSiteData: WebSiteDataType,
    authKey: string,
  ) => Promise<void>;

  checkIfNonceAlreadyExist: (
    nonce: string,
    timestamp: number,
  ) => Promise<NonceDocument | null>;
}
