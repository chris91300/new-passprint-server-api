import { Module } from '@nestjs/common';
import { WebSiteController } from './web-site.controller';
import { WebSiteService } from './web-site.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WebSite, WebSiteSchema } from '../database/schemas/WebSite.schema';
import DatabaseMongoose from 'src/database/mongoose/DatabaseMongoose';
import { DATABASE_PROVIDER } from 'src/database/database.provider';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WebSite.name, schema: WebSiteSchema }]),
  ],
  controllers: [WebSiteController],
  providers: [
    WebSiteService,
    {
      provide: DATABASE_PROVIDER,
      /*  si on veut changer de base de donnée, on créer une nouvelle class 
          qui implemente DatabaseInterface et on remplace DatabaseMongoose par
          la nouvelle
      */
      useClass: DatabaseMongoose,
    },
  ],
})
export class WebSiteModule {}
