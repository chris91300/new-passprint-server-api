import { Module } from '@nestjs/common';
import { NonceService } from './nonce.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Nonce, NonceSchema } from 'src/database/schemas/Nonce.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Nonce.name, schema: NonceSchema }]),
  ],
  providers: [NonceService],
  exports: [NonceService],
})
export class NonceModule {}
