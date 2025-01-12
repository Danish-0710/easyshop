import nodemailer from 'nodemailer';
import { config } from '../config';
import { Notification } from '../models/Notification';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  async sendEmail(notification: Notification): Promise<void> {
    const mailOptions = {
      from: config.email.from,
      to: notification.recipient,
      subject: notification.subject,
      text: notification.content,
      html: notification.htmlContent || notification.content,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error(`Failed to send email: ${error}`);
    }
  }
}

export const emailService = new EmailService();
