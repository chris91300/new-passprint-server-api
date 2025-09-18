export type EventType = {
  pseudo: string;
  authKey: string;
  hostname: string;
  requestType: 'signIn' | 'signUp' | 'update';
  userDataAsked?: string[]; // string[] sérialisé
  nonce: string;
  timestamp: number;
};
