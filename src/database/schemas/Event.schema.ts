import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type EventDocument = HydratedDocument<Event>;

@Schema()
export class Event {
  @Prop({ required: true })
  pseudo: string;

  @Prop({ required: true })
  authKey: string;

  @Prop({ required: true })
  hostname: string;

  @Prop({ required: true })
  request: string; //   "signIn" | "signUp" | "update"

  @Prop()
  userDataAsked: string; // string[] sérialisé

  @Prop({ required: true })
  nonce: string;

  @Prop({ required: true })
  timestamp: number;
}

export const EventSchema = SchemaFactory.createForClass(Event);
