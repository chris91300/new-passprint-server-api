import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Nonce, NonceDocument } from 'src/database/schemas/Nonce.schema';

@Injectable()
export class NonceService {
  constructor(
    @InjectModel(Nonce.name) private NonceModel: Model<NonceDocument>,
  ) {}

  async save(nonce: string, timestamp: number) {
    try {
      const nonceDocument = new this.NonceModel({ nonce, timestamp });
      await nonceDocument.save();
    } catch (err) {
      console.log(err);
    }
  }

  isValid(timestamp: number) {
    try {
      const currentTimestamp = Date.now();
      const toleranceInMilliseconds = 5000; // Par exemple, 5 secondes de tolérance
      // Vérification si le timestamp est trop vieux (plus ancien que le serveur actuel - tolérance)
      if (timestamp < currentTimestamp - toleranceInMilliseconds) {
        console.error('Requête refusée : Timestamp trop ancien.');
        throw new Error('Requête refusée car trop ancienne.');
      }

      // Vérification si le timestamp est trop jeune (plus récent que le serveur actuel + tolérance)
      if (timestamp > currentTimestamp + toleranceInMilliseconds) {
        console.error('Requête refusée : Timestamp trop jeune.');
        throw new Error('Requête refusée car le timestamp est trop jeune.');
      }
    } catch (err) {
      console.log(err);
    }
  }

  async alreadyExist(nonce: string, timestamp: number) {
    try {
      const nonceDocument = await this.NonceModel.findOne({
        nonce,
        timestamp,
      });
      if (nonceDocument) {
        throw new Error('nonce already use');
      }
    } catch (err) {
      console.log(err);
    }
  }

  async remove(nonce: string, timestamp: number) {
    try {
      await this.NonceModel.deleteOne({ nonce, timestamp });
    } catch (err) {
      console.log(err);
    }
  }
}
