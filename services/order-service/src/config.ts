import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3004,
  mongoUri: process.env.MONGODB_URI || 'mongodb://mongodb:27017/order-db',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  services: {
    product: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002',
    cart: process.env.CART_SERVICE_URL || 'http://cart-service:3003',
  },
};
