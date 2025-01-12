import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const environment = process.env.NODE_ENV || 'development';

// Server configuration
const serverConfig = {
  port: parseInt(process.env.PORT || '3003', 10),
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
  uri: process.env.MONGODB_URI || `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}?authSource=${process.env.MONGO_AUTH_SOURCE}`,
};

// Redis configuration
const redisConfig = {
  uri: process.env.REDIS_URI || `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DB}`,
};

// JWT configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
};

// Service URLs
const serviceConfig = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  product: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002',
  shop: process.env.SHOP_SERVICE_URL || 'http://shop-service:3005',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3006',
};

// Logging configuration
const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.LOG_FORMAT || 'combined',
};

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGO_USERNAME', 'MONGO_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export const config = {
  env: environment,
  server: serverConfig,
  cors: corsConfig,
  mongodb: mongoConfig,
  redis: redisConfig,
  jwt: jwtConfig,
  services: serviceConfig,
  logging: loggingConfig,
};

// Type definitions for better TypeScript support
export type Config = typeof config;
export type Environment = typeof environment;
