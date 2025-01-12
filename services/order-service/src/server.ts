import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { orderRoutes } from './routes/orderRoutes';
import { logger } from './utils/logger';

const app = express();

// Middleware
app.use(cors());

// Special handling for Stripe webhooks
app.post(
  '/api/orders/webhook',
  express.raw({ type: 'application/json' }),
  orderRoutes
);

// Regular JSON parsing for other routes
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(config.mongoUri)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Routes
app.use('/api/orders', orderRoutes);

// Error handling
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`Order Service running on port ${PORT}`);
});
