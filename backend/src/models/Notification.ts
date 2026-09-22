import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  recipientRole: 'GYM_OWNER' | 'TRAINER' | 'SUPER_ADMIN' | 'MEMBER';
  gymId?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert' | 'message';
  relatedRecordId?: mongoose.Types.ObjectId;
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipientRole: { type: String, enum: ['GYM_OWNER', 'TRAINER', 'SUPER_ADMIN', 'MEMBER'], required: true },
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'alert', 'message'], default: 'info' },
  relatedRecordId: { type: Schema.Types.ObjectId },
  link: { type: String },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', notificationSchema);
