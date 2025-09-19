import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/database/schemas/User.schema';
import { HybridEncryptedPayload } from 'utils/passprint/types';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

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

  async getUser(pseudo: string) {
    try {
      const user = await this.UserModel.findOne({
        temporaryPseudo: pseudo,
      });
      if (user) {
        return user;
      } else {
        throw new Error('User not found');
      }
    } catch (err) {
      console.log(err);
      if (err instanceof Error) {
        throw new Error('An error occurred: ' + err.message);
      }
      throw new Error('An unknown error occurred');
    }
  }
}
