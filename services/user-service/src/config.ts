import { z } from 'zod';

// Configuration schema definition
const configSchema = z.object({
  server: z.object({
    port: z.coerce.number().default(3005),
    host: z.string().default('0.0.0.0'),
    env: z.enum(['development', 'production', 'test']).default('development'),
    corsOrigin: z.string().default('*'),
  }),
  mongodb: z.object({
    uri: z.string(),
    username: z.string(),
    password: z.string(),
    host: z.string().default('localhost'),
    port: z.coerce.number().default(27017),
    database: z.string().default('easyshop_users'),
    options: z.object({
      retryWrites: z.boolean().default(true),
      w: z.enum(['majority']).default('majority'),
    }).default({}),
  }),
  jwt: z.object({
    secret: z.string(),
    expiresIn: z.string().default('1d'),
  }),
  services: z.object({
    auth: z.object({
      url: z.string().default('http://auth-service:3001'),
    }),
    notification: z.object({
      url: z.string().default('http://notification-service:3004'),
    }),
  }),
  rabbitmq: z.object({
    url: z.string().default('amqp://localhost:5672'),
    queues: z.object({
      userEvents: z.string().default('user_events'),
      userNotifications: z.string().default('user_notifications'),
    }),
    exchanges: z.object({
      userEvents: z.string().default('user_events'),
    }),
  }),
  redis: z.object({
    host: z.string().default('localhost'),
    port: z.coerce.number().default(6379),
    password: z.string().optional(),
    ttl: z.coerce.number().default(3600), // Cache TTL in seconds
  }),
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    format: z.enum(['json', 'console']).default('console'),
  }),
});

// Environment variable mapping
const envVars = {
  server: {
    port: process.env.PORT,
    host: process.env.HOST,
    env: process.env.NODE_ENV,
    corsOrigin: process.env.CORS_ORIGIN,
  },
  mongodb: {
    uri: process.env.MONGODB_URI,
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
    host: process.env.MONGO_HOST,
    port: process.env.MONGO_PORT,
    database: process.env.MONGO_DATABASE,
    options: {
      retryWrites: true,
      w: 'majority',
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL,
    },
    notification: {
      url: process.env.NOTIFICATION_SERVICE_URL,
    },
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    queues: {
      userEvents: process.env.RABBITMQ_USER_EVENTS_QUEUE,
      userNotifications: process.env.RABBITMQ_USER_NOTIFICATIONS_QUEUE,
    },
    exchanges: {
      userEvents: process.env.RABBITMQ_USER_EVENTS_EXCHANGE,
    },
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    ttl: process.env.REDIS_TTL,
  },
  logging: {
    level: process.env.LOG_LEVEL,
    format: process.env.LOG_FORMAT,
  },
};

// Construct MongoDB URI if not provided directly
if (!envVars.mongodb.uri && envVars.mongodb.username && envVars.mongodb.password) {
  envVars.mongodb.uri = `mongodb://${envVars.mongodb.username}:${envVars.mongodb.password}@${envVars.mongodb.host}:${envVars.mongodb.port}/${envVars.mongodb.database}`;
}

// Parse and validate configuration
const config = configSchema.parse(envVars);

// Required environment variables validation
const requiredEnvVars = [
  'MONGO_USERNAME',
  'MONGO_PASSWORD',
  'JWT_SECRET',
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default config;
