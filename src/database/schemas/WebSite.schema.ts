import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type WebSiteDocument = HydratedDocument<WebSite>;

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

export const WebSiteSchema = SchemaFactory.createForClass(WebSite);
/*
const webSiteSchema = new Schema<WebSiteDatabaseType>({
  hostname: { type: String, require: true },
  contactFirstName: { type: String, require: true },
  contactLastName: { type: String, require: true },
  contactEmail: { type: String, require: true },
  publicKey: { type: String, require: true },
  
  authKey: { type: String, require: true },
  createdAt: { type: Number, default: Date.now },
});

const WebSite =
  mongoose.models.WebSite ||
  model<WebSiteDatabaseType>('WebSite', webSiteSchema);

export default WebSite;*/

/**
 * pour plus tard
 * 
 * /*ipv4: { type: String, default: '' },
  ipv6: { type: String, default: '' },
 */
