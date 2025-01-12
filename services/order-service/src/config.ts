import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const environment = process.env.NODE_ENV || 'development';

// Server configuration
const serverConfig = {
  port: parseInt(process.env.PORT || '3005', 10),
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

// Stripe configuration
const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  currency: process.env.STRIPE_CURRENCY || 'usd',
};

// RabbitMQ configuration
const rabbitmqConfig = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  exchange: process.env.RABBITMQ_EXCHANGE || 'order_exchange',
  queue: process.env.RABBITMQ_QUEUE || 'order_queue',
};

// Service URLs
const serviceConfig = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  cart: process.env.CART_SERVICE_URL || 'http://cart-service:3003',
  product: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3006',
};

// Logging configuration
const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.LOG_FORMAT || 'combined',
};

// Order configuration
const orderConfig = {
  taxRate: parseFloat(process.env.TAX_RATE || '0.1'), // 10% by default
  shippingFlatRate: parseFloat(process.env.SHIPPING_FLAT_RATE || '10'), // $10 by default
  minimumOrderAmount: parseFloat(process.env.MINIMUM_ORDER_AMOUNT || '0'),
  maximumOrderAmount: parseFloat(process.env.MAXIMUM_ORDER_AMOUNT || '10000'),
};

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'MONGO_USERNAME',
  'MONGO_PASSWORD',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET'
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
  stripe: stripeConfig,
  rabbitmq: rabbitmqConfig,
  services: serviceConfig,
  logging: loggingConfig,
  order: orderConfig,
};

// Type definitions for better TypeScript support
export type Config = typeof config;
export type Environment = typeof environment;
