import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const environment = process.env.NODE_ENV || 'development';

// Server configuration
const serverConfig = {
  port: parseInt(process.env.PORT || '3006', 10),
  host: process.env.HOST || '0.0.0.0',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
};

// CORS configuration
const corsConfig = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: process.env.CORS_CREDENTIALS === 'true',
};

// MongoDB configuration
const mongoConfig = {
  uri: process.env.MONGODB_URI || 
    `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}?authSource=${process.env.MONGO_AUTH_SOURCE || 'admin'}`,
};

// JWT configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'GPTteVlyaQyrxlh4DFoujz6u81Y2bDRmNyi6o',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
};

// Email configuration
const emailConfig = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || 'apikey',
      pass: process.env.SMTP_PASS,
    },
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'no-reply@easyshop.com',
    fromName: process.env.SENDGRID_FROM_NAME || 'EasyShop',
  },
};

// RabbitMQ configuration
const rabbitmqConfig = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  exchange: process.env.RABBITMQ_EXCHANGE || 'notification_exchange',
  queue: process.env.RABBITMQ_QUEUE || 'notification_queue',
};

// Service URLs
const serviceConfig = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  user: process.env.USER_SERVICE_URL || 'http://user-service:3004',
  shop: process.env.SHOP_SERVICE_URL || 'http://shop-service:3005',
};

// Logging configuration
const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.LOG_FORMAT || 'combined',
};

// Templates configuration
const templatesConfig = {
  dir: process.env.TEMPLATES_DIR || 'src/templates',
  engine: process.env.TEMPLATE_ENGINE || 'handlebars',
};

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'MONGO_USERNAME',
  'MONGO_PASSWORD',
  'SENDGRID_API_KEY',
  'SMTP_PASS'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export const config = {
  env: environment,
  server: serverConfig,
  cors: corsConfig,
  mongodb: mongoConfig,
  jwt: jwtConfig,
  email: emailConfig,
  rabbitmq: rabbitmqConfig,
  services: serviceConfig,
  logging: loggingConfig,
  templates: templatesConfig,
};

// Type definitions for better TypeScript support
export type Config = typeof config;
export type Environment = typeof environment;
