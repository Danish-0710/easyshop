import { config } from '../config';
import { logger } from './logger';
import { INotification, NotificationStatus } from '../models/Notification';
import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    if (config.env === 'development') {
      // In development, just log the emails
      this.transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    } else {
      // In production, use SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: config.email.smtp.secure,
        auth: {
          user: config.email.smtp.auth.user,
          pass: config.email.smtp.auth.pass
        }
      });
    }
  }

  async sendEmail(notification: INotification): Promise<boolean> {
    try {
      const to = notification.userId.toString(); // Convert ObjectId to string
      const subject = notification.title;
      const html = notification.message;

      const mailOptions = {
        from: `${config.email.sendgrid.fromName} <${config.email.sendgrid.fromEmail}>`,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      // Update notification status and sent time
      notification.status = NotificationStatus.SENT;
      notification.sentAt = new Date();
      await notification.save();
      
      if (config.env === 'development') {
        logger.debug('Email sent (development):', info);
      } else {
        logger.info('Email sent successfully:', info.messageId);
      }
      
      return true;
    } catch (error) {
      // Update notification status to failed
      notification.status = NotificationStatus.FAILED;
      await notification.save();
      
      logger.error('Error sending email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
