import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import proxy from 'express-http-proxy';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/authMiddleware';
import { logger } from './utils/logger';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Service routes
app.use('/api/auth', proxy(config.services.auth.url));
app.use('/api/products', proxy(config.services.product.url));
app.use('/api/cart', authMiddleware, proxy(config.services.cart.url));
app.use('/api/orders', authMiddleware, proxy(config.services.order.url));
app.use('/api/shops', proxy(config.services.shop.url));

// Error handling
app.use(errorHandler);

const PORT = 4000;

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});
