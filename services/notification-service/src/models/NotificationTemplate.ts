import mongoose, { Document, Schema } from 'mongoose';
import { NotificationType, NotificationChannel } from './Notification';

export interface INotificationTemplate extends Document {
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject: string;
  template: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationTemplateSchema = new Schema<INotificationTemplate>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    channel: {
      type: String,
      enum: Object.values(NotificationChannel),
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    template: {
      type: String,
      required: true,
    },
    variables: [{
      type: String,
      required: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
notificationTemplateSchema.index({ name: 1 }, { unique: true });
notificationTemplateSchema.index({ type: 1, channel: 1 });
notificationTemplateSchema.index({ isActive: 1 });

export const NotificationTemplate = mongoose.model<INotificationTemplate>(
  'NotificationTemplate',
  notificationTemplateSchema
);
