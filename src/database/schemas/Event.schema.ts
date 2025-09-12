import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Event {
  @Prop({ required: true })
  pseudo: string;

  @Prop({ required: true })
  authKey: string;

  @Prop({ required: true })
  hostname: string;

  @Prop({ required: true })
  requestType: string; //   "signIn" | "signUp" | "update"

  @Prop()
  userDataAsked: string[]; // string[] sérialisé

  @Prop({ required: true })
  nonce: string;

  @Prop({ required: true })
  timestamp: number;
}

export type EventDocument = HydratedDocument<Event>;
export const EventSchema = SchemaFactory.createForClass(Event);
