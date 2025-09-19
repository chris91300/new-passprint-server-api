import { Module } from '@nestjs/common';
import { WebSiteModule } from './web-site/web-site.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EventModule } from './event/event.module';
//import { NonceModule } from './nonce/nonce.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL!),
    WebSiteModule,
    EventModule,
    // NonceModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
