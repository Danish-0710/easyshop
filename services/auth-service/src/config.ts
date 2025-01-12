import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const environment = process.env.NODE_ENV || 'development';

// Server configuration
const serverConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
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

// Auth configuration
const authConfig = {
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/google/callback',
};

// Service URLs
const serviceConfig = {
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3006',
};

// Logging configuration
const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.LOG_FORMAT || 'combined',
};

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'MONGO_USERNAME',
  'MONGO_PASSWORD',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
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
  auth: authConfig,
  services: serviceConfig,
  logging: loggingConfig,
};

// Type definitions for better TypeScript support
export type Config = typeof config;
export type Environment = typeof environment;
