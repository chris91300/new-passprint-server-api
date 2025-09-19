import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class WebSite {
  @Prop({ required: true })
  hostname: string;

  @Prop({ required: true })
  contactFirstName: string;

  @Prop({ required: true })
  contactLastName: string;

  @Prop({ required: true })
  contactEmail: string;

  @Prop({ required: true })
  publicKey: string;

  @Prop({ required: true })
  authKey: string;

  @Prop({ default: Date.now })
  createdAt: number;
}

export type WebSiteDocument = HydratedDocument<WebSite>;
export const WebSiteSchema = SchemaFactory.createForClass(WebSite);
