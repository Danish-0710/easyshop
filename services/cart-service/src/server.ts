import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { cartRoutes } from './routes/cartRoutes';
import { logger } from './utils/logger';

const app = express();

// Middleware
app.use(cors());
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
app.use('/api/cart', cartRoutes);

// Error handling
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`Cart Service running on port ${PORT}`);
});
