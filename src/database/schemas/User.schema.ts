import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = HydratedDocument<User>;

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
@Schema()
export class User {
  @Prop({ required: true })
  pseudo: string;

  @Prop({ required: true })
  phoneKey: string;

  @Prop({ required: true })
  phoneAuthKey: string;

  @Prop({ required: true })
  informations: object;

  @Prop({ required: true })
  passwords: object;

  @Prop({ required: true, default: false })
  accountBlocked: boolean;

  @Prop({ default: false })
  useTemporaryPseudo: boolean;

  @Prop({ required: true, default: '' })
  temporaryPseudo: string;

  @Prop()
  temporarySwitchKey: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
