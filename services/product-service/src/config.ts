import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const environment = process.env.NODE_ENV || 'development';

// Server configuration
const serverConfig = {
  port: parseInt(process.env.PORT || '3002', 10),
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

// AWS S3 configuration for product images
const s3Config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
  bucket: process.env.AWS_S3_BUCKET || 'easyshop-products',
};

// RabbitMQ configuration
const rabbitmqConfig = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  exchange: process.env.RABBITMQ_EXCHANGE || 'product_exchange',
  queue: process.env.RABBITMQ_QUEUE || 'product_queue',
};

// Service URLs
const serviceConfig = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3006',
};

// Logging configuration
const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.LOG_FORMAT || 'combined',
};

// Product configuration
const productConfig = {
  imageMaxSize: parseInt(process.env.PRODUCT_IMAGE_MAX_SIZE || '5242880', 10), // 5MB
  allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
  maxImagesPerProduct: parseInt(process.env.MAX_IMAGES_PER_PRODUCT || '5', 10),
  thumbnailSizes: {
    small: { width: 150, height: 150 },
    medium: { width: 300, height: 300 },
    large: { width: 600, height: 600 },
  },
};

// Cache configuration
const cacheConfig = {
  ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hour in seconds
  checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '600', 10), // 10 minutes
};

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'MONGO_USERNAME',
  'MONGO_PASSWORD',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY'
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
  s3: s3Config,
  rabbitmq: rabbitmqConfig,
  services: serviceConfig,
  logging: loggingConfig,
  product: productConfig,
  cache: cacheConfig,
};

// Type definitions for better TypeScript support
export type Config = typeof config;
export type Environment = typeof environment;
