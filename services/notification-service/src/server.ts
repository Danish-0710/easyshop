import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { notificationRoutes } from './routes/notificationRoutes';
import { logger } from './utils/logger';
import { socketService } from './utils/socketService';
import { rabbitmqService } from './utils/rabbitmqService';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
socketService.initialize(server);

// Middleware
app.use(cors());
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

// Initialize RabbitMQ
rabbitmqService
  .initialize()
  .then(() => {
    logger.info('RabbitMQ initialized');
  })
  .catch((error) => {
    logger.error('RabbitMQ initialization error:', error);
    process.exit(1);
  });

// Routes
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(errorHandler);

const PORT = config.server.port;

server.listen(PORT, () => {
  logger.info(`Notification Service running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await rabbitmqService.close();
  await mongoose.connection.close();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
