import twilio from 'twilio';
import handlebars from 'handlebars';
import { config } from '../config';
import { INotification } from '../models/Notification';
import { logger } from './logger';

class SMSService {
  private client: twilio.Twilio;

  constructor() {
    this.client = twilio(
      config.sms.twilio.accountSid,
      config.sms.twilio.authToken
    );
  }

  async send(notification: INotification) {
    try {
      // Compile template with Handlebars
      const template = handlebars.compile(notification.message);
      const message = template(notification.metadata);

      if (!notification.metadata.phone) {
        throw new Error('Phone number is required for SMS notification');
      }

      await this.client.messages.create({
        body: message,
        from: config.sms.twilio.fromNumber,
        to: notification.metadata.phone,
      });

      logger.info(`SMS sent successfully to notification ID: ${notification._id}`);
    } catch (error) {
      logger.error('Failed to send SMS:', error);
      throw error;
    }
  }
}

export const smsService = new SMSService();
