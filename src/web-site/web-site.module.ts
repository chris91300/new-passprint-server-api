import { Module } from '@nestjs/common';
import { WebSiteController } from './web-site.controller';
import { WebSiteService } from './web-site.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WebSite, WebSiteSchema } from '../database/schemas/WebSite.schema';
import { NonceModule } from 'src/nonce/nonce.module';
import { EventModule } from 'src/event/event.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WebSite.name, schema: WebSiteSchema }]),
    NonceModule,
    EventModule,
    UserModule,
  ],
  controllers: [WebSiteController],
  providers: [WebSiteService],
})
export class WebSiteModule {}
