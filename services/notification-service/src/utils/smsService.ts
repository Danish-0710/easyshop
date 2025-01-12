import { config } from '../config';
import { logger } from './logger';

export class SMSService {
  private client: any;

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      const twilio = require('twilio');
      this.client = new twilio(config.sms.twilio.accountSid, config.sms.twilio.authToken);
    }
  }

  async send(notification: any): Promise<boolean> {
    try {
      // Compile template with Handlebars
      const handlebars = require('handlebars');
      const template = handlebars.compile(notification.message);
      const message = template(notification.metadata);

      if (!notification.metadata.phone) {
        throw new Error('Phone number is required for SMS notification');
      }

      if (process.env.NODE_ENV === 'production') {
        await this.client.messages.create({
          body: message,
          from: config.sms.twilio.fromNumber,
          to: notification.metadata.phone,
        });
      } else {
        // Development mode - just log the message
        logger.info(`[DEV MODE] SMS would be sent to ${notification.metadata.phone}: ${message}`);
      }
      logger.info(`SMS sent successfully to notification ID: ${notification._id}`);
      return true;
    } catch (error) {
      logger.error('Failed to send SMS:', error);
      return false;
    }
  }
}

export const smsService = new SMSService();
