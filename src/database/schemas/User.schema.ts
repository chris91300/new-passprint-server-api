import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class UserInformations {
  @Prop({ required: true })
  gender: string; //'Male' | 'Female' | 'Other';

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  postalCode: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  dateOfBirthday: Date;
}

export type UserInformationsDocument = HydratedDocument<UserInformations>;
export const UserInformationsSchema =
  SchemaFactory.createForClass(UserInformations);

@Schema({ _id: false })
export class Device {
  @Prop({ required: true })
  pushToken: string;

  @Prop({ required: true })
  platform: string;

  @Prop({ required: true })
  systemVersion: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  passprintVersion: string;

  @Prop({ required: true })
  bundleID: string;

  @Prop({ required: true })
  screenSize: string;
}

export type DeviceDocument = HydratedDocument<Device>;
export const DeviceSchema = SchemaFactory.createForClass(Device);

// Définition de vos clés possibles pour UserInformations
export type UserInformationsKeys = keyof UserInformations;

@Schema({ _id: false }) // Important pour les sous-documents
class WebSite {
  @Prop({ required: true })
  hostname: string;

  @Prop({ required: true })
  publicKey: string;

  @Prop({ required: true })
  userPseudo: string;

  @Prop({ required: true })
  passwordCrypted: string;

  @Prop({ default: Date.now })
  inscriptionDate: Date;

  @Prop()
  lastRequestDate: Date;

  @Prop({ default: false })
  isSiteBlocked: boolean;

  @Prop({ required: false })
  passwordModifiedAt: Date;

  @Prop({ required: true, type: [String] })
  dataAskedBySite: Array<UserInformationsKeys>;
}

export type WebSiteDocument = HydratedDocument<WebSite>;
export const WebSiteSchema = SchemaFactory.createForClass(WebSite);

@Schema()
export class User {
  @Prop({ required: true })
  pseudo: string;

  @Prop({ required: true })
  userID: string; // UUID généré lors de la création du user et hasher

  @Prop({ required: true })
  publicKey: string;

  @Prop({ required: true, type: Map, of: DeviceSchema })
  devices: Map<string, DeviceDocument>;

  @Prop({ required: true, type: UserInformationsSchema })
  informations: UserInformationsDocument;

  @Prop({ required: true, type: Map, of: WebSiteSchema, default: {} })
  webSites: Map<string, WebSiteDocument>;

  @Prop({ required: true, default: false })
  accountBlocked: boolean;

  @Prop({ default: false })
  useTemporaryPseudo: boolean;

  @Prop()
  temporaryPseudoExpireAt: Date;

  @Prop({ required: true }) // mettre lors de la création la valeur pseudo
  temporaryPseudo: string;

  @Prop()
  temporarySwitchKey: string;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
