import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/database/schemas/User.schema';
import { HybridEncryptedPayload } from 'utils/passprint/types';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  create(data: HybridEncryptedPayload) {
    console.log(data);
    // décrypter payload avec passprint. Il faut l'injecter dans le constructeur
    // vérifier les données avec zod.
    // enregistrer l'utilisateur dans la base de données.
  }

  update(data: HybridEncryptedPayload) {
    console.log(data);
  }

  setDevice(data: HybridEncryptedPayload) {
    console.log(data);
  }

  setWebSite(data: HybridEncryptedPayload) {
    console.log(data);
  }
}
