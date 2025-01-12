import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    },
    product: {
      url: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002',
    },
    cart: {
      url: process.env.CART_SERVICE_URL || 'http://cart-service:3003',
    },
    order: {
      url: process.env.ORDER_SERVICE_URL || 'http://order-service:3004',
    },
    shop: {
      url: process.env.SHOP_SERVICE_URL || 'http://shop-service:3005',
    },
  },
};
