import { Request, Response, NextFunction } from 'express';
import { Notification, NotificationStatus } from '../models/Notification';
import { NotificationPreference } from '../models/NotificationPreference';
import { NotificationTemplate } from '../models/NotificationTemplate';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { emailService } from '../utils/emailService';
import { smsService } from '../utils/smsService';
import { socketService } from '../utils/socketService';
import { logger } from '../utils/logger';

export const notificationController = {
  async createNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, channel, templateName, variables } = req.body;
      const userId = req.user?.id;

      // Get notification template
      const template = await NotificationTemplate.findOne({
        name: templateName,
        isActive: true,
      });

      if (!template) {
        throw new NotFoundError('Notification template not found');
      }

      // Get user preferences
      const preferences = await NotificationPreference.findOne({ userId });
      if (!preferences) {
        throw new NotFoundError('User preferences not found');
      }

      // Check if user has enabled this type of notification
      const setting = preferences.settings.find((s) => s.type === type);
      if (!setting || !setting.enabled || !setting.channels.includes(channel)) {
        throw new BadRequestError('Notification channel is disabled for this type');
      }

      // Create notification
      const notification = await Notification.create({
        userId,
        type,
        channel,
        title: template.subject,
        message: template.template,
        metadata: variables,
      });

      // Send notification based on channel
      try {
        switch (channel) {
          case 'email':
            await emailService.sendEmail(notification);
            break;
          case 'sms':
            await smsService.send(notification);
            break;
          case 'in_app':
            await socketService.send(notification);
            break;
        }

        notification.status = NotificationStatus.SENT;
        notification.sentAt = new Date();
      } catch (error) {
        notification.status = NotificationStatus.FAILED;
        logger.error('Failed to send notification:', error);
      }

      await notification.save();

      res.status(201).json({
        status: 'success',
        data: { notification },
      });
    } catch (error) {
      next(error);
    }
  },

  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, type, status } = req.query;
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestError('User not authenticated');
      }

      const query: any = { userId };

      if (type) {
        query.type = type;
      }

      if (status) {
        query.status = status;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await Notification.countDocuments(query);

      res.json({
        status: 'success',
        data: {
          notifications,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestError('User not authenticated');
      }

      const notification = await Notification.findOne({
        _id: notificationId,
        userId,
      });

      if (!notification) {
        throw new NotFoundError('Notification not found');
      }

      notification.status = NotificationStatus.READ;
      notification.readAt = new Date();
      await notification.save();

      res.json({
        status: 'success',
        data: { notification },
      });
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestError('User not authenticated');
      }

      await Notification.updateMany(
        {
          userId,
          status: { $ne: NotificationStatus.READ },
        },
        {
          $set: {
            status: NotificationStatus.READ,
            readAt: new Date(),
          },
        }
      );

      res.json({
        status: 'success',
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestError('User not authenticated');
      }

      const count = await Notification.countDocuments({
        userId,
        status: { $ne: NotificationStatus.READ },
      });

      res.json({
        status: 'success',
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestError('User not authenticated');
      }

      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId,
      });

      if (!notification) {
        throw new NotFoundError('Notification not found');
      }

      res.json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },
};
