import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3005,
  mongoUri: process.env.MONGODB_URI || 'mongodb://mongodb:27017/shop-db',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  services: {
    product: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002',
    order: process.env.ORDER_SERVICE_URL || 'http://order-service:3004',
  },
};
