import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { config } from '../config';
import { INotification } from '../models/Notification';
import { logger } from './logger';

class SocketService {
  private io: Server | null = null;

  initialize(server: HTTPServer) {
    this.io = new Server(server, {
      cors: config.socketio.cors,
    });

    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on('join', (userId: string) => {
        socket.join(`user_${userId}`);
        logger.info(`User ${userId} joined their room`);
      });

      socket.on('leave', (userId: string) => {
        socket.leave(`user_${userId}`);
        logger.info(`User ${userId} left their room`);
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  async send(notification: INotification) {
    try {
      if (!this.io) {
        throw new Error('Socket.IO has not been initialized');
      }

      this.io.to(`user_${notification.userId}`).emit('notification', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata,
        createdAt: notification.createdAt,
      });

      logger.info(
        `In-app notification sent successfully to user: ${notification.userId}`
      );
    } catch (error) {
      logger.error('Failed to send in-app notification:', error);
      throw error;
    }
  }

  getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.IO has not been initialized');
    }
    return this.io;
  }
}

export const socketService = new SocketService();
