import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * USER DATABASE

pseudo
key smartphone
key authentification smartphone
nom, prénom ...

password {
hostname : {
authKey: string,
publicKey: string,
passwordCrypted with public key of site externe: string,
date d'inscription: Date,
date de dernière demande,
site_bloqué: boolean
passwordModifiedAt; Date (dernière modif),
dataAskedBySite: [nom, prénom ...]
}

accountBloked: boolean  

 */

@Schema({ _id: false })
export class UserInformations {
  @Prop({ require: true })
  firstName: string;

  @Prop({ require: true })
  lastName: string;

  @Prop({ require: true })
  email: string;

  @Prop({ require: true })
  phone: string;

  @Prop({ require: true })
  address: string;

  @Prop({ require: true })
  city: string;

  @Prop({ require: true })
  postalCode: string;

  @Prop({ require: true })
  country: string;

  @Prop({ require: true })
  dateOfBirthday: Date;
}

@Schema({ _id: false }) // Important pour les sous-documents
export class WebSite {
  @Prop({ required: true })
  hostname: string;

  @Prop({ required: true })
  publicKey: string;

  @Prop({ required: true })
  passwordCrypted: string;

  @Prop({ default: Date.now })
  inscriptionDate: Date;

  @Prop()
  lastRequestDate: Date;

  @Prop({ default: false })
  isSiteBlocked: boolean;

  @Prop({ require: false })
  passwordModifiedAt: Date;

  @Prop({ require: true })
  dataAskedBySite: keyof UserInformations[];
}

@Schema()
export class User {
  @Prop({ required: true })
  pseudo: string;

  @Prop({ required: true })
  phoneKey: string;

  @Prop({ required: true })
  phoneAuthKey: string;

  @Prop({ required: true })
  informations: UserInformations;

  @Prop({ required: true, type: Map, of: WebSite })
  webSites: Map<string, WebSite>;

  @Prop({ required: true, default: false })
  accountBlocked: boolean;

  @Prop({ default: false })
  useTemporaryPseudo: boolean;

  @Prop()
  temporaryPseudoExpireAt: number;

  @Prop({ required: true }) // mettre lors de la création la valeur pseudo
  temporaryPseudo: string;

  @Prop()
  temporarySwitchKey: string;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
