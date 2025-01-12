import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import { config } from '../config';
import { INotification } from '../models/Notification';
import { logger } from './logger';

// Configure SendGrid
sgMail.setApiKey(config.email.sendgrid.apiKey);

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: config.email.smtp.host,
  port: config.email.smtp.port,
  secure: config.email.smtp.secure,
  auth: {
    user: config.email.smtp.auth.user,
    pass: config.email.smtp.auth.pass,
  },
});

class EmailService {
  async send(notification: INotification) {
    try {
      // Compile template with Handlebars
      const template = handlebars.compile(notification.message);
      const html = template(notification.metadata);

      if (config.email.sendgrid.apiKey) {
        // Use SendGrid if API key is available
        await this.sendWithSendGrid(notification, html);
      } else {
        // Fallback to SMTP
        await this.sendWithSMTP(notification, html);
      }

      logger.info(`Email sent successfully to notification ID: ${notification._id}`);
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  private async sendWithSendGrid(notification: INotification, html: string) {
    const msg = {
      to: notification.metadata.email,
      from: {
        email: config.email.sendgrid.fromEmail,
        name: config.email.sendgrid.fromName,
      },
      subject: notification.title,
      html,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      },
    };

    await sgMail.send(msg);
  }

  private async sendWithSMTP(notification: INotification, html: string) {
    const msg = {
      from: `"${config.email.sendgrid.fromName}" <${config.email.sendgrid.fromEmail}>`,
      to: notification.metadata.email,
      subject: notification.title,
      html,
    };

    await transporter.sendMail(msg);
  }
}

export const emailService = new EmailService();
