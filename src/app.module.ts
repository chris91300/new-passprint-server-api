import { Module } from '@nestjs/common';
import { WebSiteModule } from './web-site/web-site.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URL!),
    WebSiteModule,
  ],
})
export class AppModule {}
