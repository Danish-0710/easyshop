import mongoose, { Document, Schema } from 'mongoose';
import { NotificationType, NotificationChannel } from './Notification';

export interface NotificationSetting {
  type: NotificationType;
  channels: NotificationChannel[];
  enabled: boolean;
}

export interface INotificationPreference extends Document {
  userId: mongoose.Types.ObjectId;
  settings: NotificationSetting[];
  unsubscribeToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSettingSchema = new Schema<NotificationSetting>({
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: true,
  },
  channels: [{
    type: String,
    enum: Object.values(NotificationChannel),
    required: true,
  }],
  enabled: {
    type: Boolean,
    default: true,
  },
});

const notificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    settings: [notificationSettingSchema],
    unsubscribeToken: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
notificationPreferenceSchema.index({ userId: 1 }, { unique: true });
notificationPreferenceSchema.index({ unsubscribeToken: 1 }, { unique: true });

export const NotificationPreference = mongoose.model<INotificationPreference>(
  'NotificationPreference',
  notificationPreferenceSchema
);
