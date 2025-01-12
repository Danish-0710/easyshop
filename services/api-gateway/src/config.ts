import dotenv from 'dotenv';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';

export const config = {
  port: process.env.PORT || 8000, // Changed to 8000 to match frontend expectation
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  services: {
    auth: {
      url: isDevelopment ? 'http://localhost:3001' : (process.env.AUTH_SERVICE_URL || 'http://auth-service:3001'),
    },
    product: {
      url: isDevelopment ? 'http://localhost:3002' : (process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002'),
    },
    cart: {
      url: isDevelopment ? 'http://localhost:3003' : (process.env.CART_SERVICE_URL || 'http://cart-service:3003'),
    },
    order: {
      url: isDevelopment ? 'http://localhost:3004' : (process.env.ORDER_SERVICE_URL || 'http://order-service:3004'),
    },
    shop: {
      url: isDevelopment ? 'http://localhost:3005' : (process.env.SHOP_SERVICE_URL || 'http://shop-service:3005'),
    },
  },
};
