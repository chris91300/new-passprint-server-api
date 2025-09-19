import { Module } from '@nestjs/common';
import { WebSiteModule } from './web-site/web-site.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ownPublicKey } from 'configurations/ownPublicKey';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { EventModule } from './event/event.module';

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
    EventModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule {}
