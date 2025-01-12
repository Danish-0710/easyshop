import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3003,
  mongoUri: process.env.MONGODB_URI || 'mongodb://mongodb:27017/cart-db',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  services: {
    product: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002',
  },
};
