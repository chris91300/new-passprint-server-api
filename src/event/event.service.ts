import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventDocument } from 'src/database/schemas/Event.schema';
import { EventType } from 'types/event';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private EventModel: Model<EventDocument>,
  ) {}

  async create(event: EventType) {
    try {
      const eventDoc = await this.EventModel.create(event);
      return eventDoc._id;
    } catch (err) {
      console.log(err);
      if (err instanceof Error) {
        throw new Error('An error occurred when creating event');
      }
      throw new Error('An unknown error occurred when creating event');
    }
    /* const eventID = await this.database.createEvent(payloadWithoutSignature);

      return {
        success: true,
        message: 'awaiting user validation',
        eventID: eventID,
      };*/
  }

  async isValid(eventID: string) {
    try {
      const event = await this.EventModel.findById(eventID);
      const eventISValid = event ? true : false;
      return eventISValid;
    } catch (err) {
      console.log(err);
      if (err instanceof Error) {
        throw new Error('An error occurred when checking event');
      }
      throw new Error('An unknown error occurred when checking event');
    }
  }

  async remove(EventID: string) {
    try {
      await this.EventModel.findByIdAndDelete(EventID);
    } catch (err) {
      console.log(err);
    }
  }
}
