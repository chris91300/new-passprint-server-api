import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

const twoMinutes = 120000;
const getExpirationTime = () => {
  const currentTime = Date.now();
  const expireTime = currentTime + twoMinutes;
  return expireTime;
};
export type NonceDocument = HydratedDocument<Nonce>;

@Schema()
export class Nonce {
  @Prop({ required: true })
  nonce: string;

  @Prop({ required: true })
  timestamp: number;

  @Prop({ default: getExpirationTime })
  expiredAt: number;
}

export const NonceSchema = SchemaFactory.createForClass(Nonce);
