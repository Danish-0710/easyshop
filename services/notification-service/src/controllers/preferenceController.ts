import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { NotificationPreference } from '../models/NotificationPreference';
import { NotificationType, NotificationChannel } from '../models/Notification';
import { NotFoundError } from '../utils/errors';

export const preferenceController = {
  async createPreference(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;

      // Generate unsubscribe token
      const unsubscribeToken = crypto.randomBytes(32).toString('hex');

      // Create default settings for all notification types
      const defaultSettings = Object.values(NotificationType).map((type) => ({
        type,
        channels: Object.values(NotificationChannel),
        enabled: true,
      }));

      const preference = await NotificationPreference.create({
        userId,
        settings: defaultSettings,
        unsubscribeToken,
      });

      res.status(201).json({
        status: 'success',
        data: { preference },
      });
    } catch (error) {
      next(error);
    }
  },

  async updatePreference(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;
      const { settings } = req.body;

      const preference = await NotificationPreference.findOne({ userId });
      if (!preference) {
        throw new NotFoundError('Preferences not found');
      }

      preference.settings = settings;
      await preference.save();

      res.json({
        status: 'success',
        data: { preference },
      });
    } catch (error) {
      next(error);
    }
  },

  async getPreference(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;

      const preference = await NotificationPreference.findOne({ userId });
      if (!preference) {
        throw new NotFoundError('Preferences not found');
      }

      res.json({
        status: 'success',
        data: { preference },
      });
    } catch (error) {
      next(error);
    }
  },

  async unsubscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const { type } = req.query;

      const preference = await NotificationPreference.findOne({
        unsubscribeToken: token,
      });

      if (!preference) {
        throw new NotFoundError('Invalid unsubscribe token');
      }

      if (type) {
        // Unsubscribe from specific notification type
        const setting = preference.settings.find((s) => s.type === type);
        if (setting) {
          setting.enabled = false;
        }
      } else {
        // Unsubscribe from all notifications
        preference.settings.forEach((setting) => {
          setting.enabled = false;
        });
      }

      await preference.save();

      res.json({
        status: 'success',
        message: 'Successfully unsubscribed from notifications',
      });
    } catch (error) {
      next(error);
    }
  },

  async updateChannelPreference(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;
      const { type, channels } = req.body;

      const preference = await NotificationPreference.findOne({ userId });
      if (!preference) {
        throw new NotFoundError('Preferences not found');
      }

      const setting = preference.settings.find((s) => s.type === type);
      if (setting) {
        setting.channels = channels;
      }

      await preference.save();

      res.json({
        status: 'success',
        data: { preference },
      });
    } catch (error) {
      next(error);
    }
  },
};
