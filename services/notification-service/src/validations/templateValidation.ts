import { z } from 'zod';
import { NotificationType, NotificationChannel } from '../models/Notification';

export const templateValidation = {
  createTemplate: z.object({
    body: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      type: z.enum(Object.values(NotificationType) as [string, ...string[]]),
      channel: z.enum(Object.values(NotificationChannel) as [string, ...string[]]),
      subject: z.string().min(1, 'Subject is required'),
      template: z.string().min(1, 'Template content is required'),
      variables: z.array(z.string()),
      isActive: z.boolean().optional(),
    }),
  }),

  updateTemplate: z.object({
    body: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters').optional(),
      type: z
        .enum(Object.values(NotificationType) as [string, ...string[]])
        .optional(),
      channel: z
        .enum(Object.values(NotificationChannel) as [string, ...string[]])
        .optional(),
      subject: z.string().min(1, 'Subject is required').optional(),
      template: z.string().min(1, 'Template content is required').optional(),
      variables: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    }),
  }),
};
