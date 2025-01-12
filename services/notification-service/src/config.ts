import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3006,
  mongoUri: process.env.MONGODB_URI || 'mongodb://mongodb:27017/notification-db',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672',
    exchangeName: 'notifications',
    queueName: 'notification_queue',
  },
  email: {
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'no-reply@easyshop.com',
      fromName: process.env.SENDGRID_FROM_NAME || 'EasyShop',
    },
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    },
  },
  sms: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      fromNumber: process.env.TWILIO_FROM_NUMBER || '',
    },
  },
  socketio: {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  },
};
