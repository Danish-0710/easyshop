import dotenv from 'dotenv';

dotenv.config();

const environment = process.env.NODE_ENV || 'development';

// MongoDB connection configuration
const mongoConfig = {
  development: {
    host: process.env.MONGO_HOST || 'localhost',
    port: process.env.MONGO_PORT || '27017',
    database: process.env.MONGO_DATABASE || 'shop-db',
    username: process.env.MONGO_USERNAME || 'root',
    password: process.env.MONGO_PASSWORD || 'test@123',
  },
  production: {
    host: process.env.MONGO_HOST || 'mongodb',
    port: process.env.MONGO_PORT || '27017',
    database: process.env.MONGO_DATABASE || 'shop-db',
    username: process.env.MONGO_USERNAME || 'root',
    password: process.env.MONGO_PASSWORD || 'test@123',
  },
  test: {
    host: process.env.MONGO_HOST || 'localhost',
    port: process.env.MONGO_PORT || '27017',
    database: process.env.MONGO_DATABASE || 'shop-db-test',
    username: process.env.MONGO_USERNAME || 'root',
    password: process.env.MONGO_PASSWORD || 'test@123',
  },
};

// Build MongoDB URI based on environment
const getMongoUri = () => {
  const { host, port, database, username, password } = mongoConfig[environment as keyof typeof mongoConfig];
  return `mongodb://${username}:${password}@${host}:${port}/${database}`;
};

// Service URLs based on environment
const getServiceUrl = (service: string, defaultPort: string) => {
  const host = process.env[`${service.toUpperCase()}_SERVICE_HOST`] || 
    (environment === 'production' ? service : 'localhost');
  const port = process.env[`${service.toUpperCase()}_SERVICE_PORT`] || defaultPort;
  return `http://${host}:${port}`;
};

export const config = {
  env: environment,
  port: parseInt(process.env.PORT || '3005', 10),
  mongoUri: process.env.MONGODB_URI || getMongoUri(),
  jwtSecret: process.env.JWT_SECRET || 'GPTteVlyaQyrxlh4DFoujz6u81Y2bDRmNyi6o',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  services: {
    product: process.env.PRODUCT_SERVICE_URL || getServiceUrl('product-service', '3002'),
    order: process.env.ORDER_SERVICE_URL || getServiceUrl('order-service', '3004'),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
};
