import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { cartRoutes } from './routes/cartRoutes';
import { logger } from './utils/logger';

const app = express();

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials
}));
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(config.mongodb.uri)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Routes
app.use(config.server.apiPrefix + '/cart', cartRoutes);

// Error handling
app.use(errorHandler);

const PORT = config.server.port;

app.listen(PORT, config.server.host, () => {
  logger.info(`Cart Service running on port ${PORT}`);
});
