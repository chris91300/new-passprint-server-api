import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

const twoMinutes = 120000;
/*const getExpirationTime = () => {
  const currentTime = Date.now();
  const expireTime = currentTime + twoMinutes;
  return expireTime;
};*/
// Définissez la durée de vie de votre nonce en secondes
const NONCE_TTL_SECONDS = 120; // 2 minutes

@Schema()
export class Nonce {
  @Prop({ required: true })
  nonce: string;

  @Prop({ required: true })
  timestamp: number;

  @Prop({
    default: () => {
      return Date.now() + twoMinutes;
    },
    expires: NONCE_TTL_SECONDS,
  })
  expiredAt: Date;
}

export type NonceDocument = HydratedDocument<Nonce>;
export const NonceSchema = SchemaFactory.createForClass(Nonce);
