import { databaseInterface } from '../interfaces/database.interface';
import { Model } from 'mongoose';
import { WebSiteDataType } from 'types/webSite';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WebSite } from '../schemas/WebSite.schema';
import { Nonce } from '../schemas/Nonce.schema';
import { User } from '../schemas/User.schema';
import { Event } from '../schemas/Event.schema';
import { EventType } from 'types/event';

@Injectable()
class DatabaseMongoose implements databaseInterface {
  constructor(
    @InjectModel(WebSite.name)
    private readonly WebSiteModel: Model<WebSite>,
    @InjectModel(Nonce.name)
    private readonly NonceModel: Model<Nonce>,
    @InjectModel(User.name)
    private readonly UserModel: Model<User>,
    @InjectModel(Event.name)
    private readonly EventModel: Model<Event>,
  ) {}

  public async createWebSite(webSiteData: WebSiteDataType, authKey: string) {
    const createdAt = Date.now();
    const webSite = new this.WebSiteModel({
      ...webSiteData,
      authKey,
      createdAt,
    });
    await webSite.save();
  }

  public async getWebSite(hostname: string, authKey: string) {
    try {
      const webSite = await this.WebSiteModel.findOne({
        hostname,
        authKey,
      });
      if (webSite) {
        return webSite;
      } else {
        throw new Error('WebSite not found');
      }
    } catch (err) {
      if (err instanceof Error) {
        throw new Error('An error occurred when getWebSite: ' + err.message);
      }
      throw new Error('An unknown error occurred when getWebSite');
    }
  }

  public async checkIfNonceAlreadyExist(nonce: string, timestamp: number) {
    try {
      return await this.NonceModel.findOne({
        nonce,
        timestamp,
      }).exec();
    } catch (err) {
      if (err instanceof Error) {
        throw new Error('Une erreur est survenue : ' + err.message);
      }
      throw new Error('Une erreur est survenue');
    }
  }

  public async saveNonce(nonce: string, timestamp: number) {
    const nonceDocument = new this.NonceModel({
      nonce,
      timestamp,
    });
    await nonceDocument.save();
  }

  public async removeNonce(nonce: string, timestamp: number) {
    await this.NonceModel.deleteOne({
      nonce,
      timestamp,
    });
  }

  public async getUser(pseudo: string) {
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
      if (err instanceof Error) {
        throw new Error('An error occurred');
      }
      throw new Error('An unknown error occurred');
    }
  }

  public async createEvent(event: EventType) {
    try {
      const eventDoc = await this.EventModel.create(event);
      return eventDoc._id;
    } catch (err) {
      if (err instanceof Error) {
        throw new Error('An error occurred');
      }
      throw new Error('An unknown error occurred');
    }
  }
}

export default DatabaseMongoose;
