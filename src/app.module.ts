import { Module } from '@nestjs/common';
import { WebSiteModule } from './web-site/web-site.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ownPublicKey } from 'configurations/ownPublicKey';
import { UserController } from './user/user.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({
          passprintPublicKey: ownPublicKey,
        }),
      ],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL!),
    WebSiteModule,
  ],
  controllers: [UserController],
})
export class AppModule {}
