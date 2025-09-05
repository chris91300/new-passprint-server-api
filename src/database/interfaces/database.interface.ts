import { WebSiteDataType } from 'types/webSite';

export interface databaseInterface {
  createWebSite: (
    webSiteData: WebSiteDataType,
    authKey: string,
  ) => Promise<void>;
}
