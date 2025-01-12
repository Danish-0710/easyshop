import { z } from 'zod';
import { NotificationType, NotificationChannel } from '../models/Notification';

export const notificationValidation = {
  createNotification: z.object({
    body: z.object({
      userId: z.string(),
      type: z.enum(Object.values(NotificationType) as [string, ...string[]]),
      channel: z.enum(Object.values(NotificationChannel) as [string, ...string[]]),
      templateName: z.string(),
      variables: z.record(z.string(), z.any()),
    }),
  }),

  updatePreference: z.object({
    body: z.object({
      settings: z.array(
        z.object({
          type: z.enum(Object.values(NotificationType) as [string, ...string[]]),
          channels: z.array(
            z.enum(Object.values(NotificationChannel) as [string, ...string[]])
          ),
          enabled: z.boolean(),
        })
      ),
    }),
  }),

  updateChannelPreference: z.object({
    body: z.object({
      type: z.enum(Object.values(NotificationType) as [string, ...string[]]),
      channels: z.array(
        z.enum(Object.values(NotificationChannel) as [string, ...string[]])
      ),
    }),
  }),
};
