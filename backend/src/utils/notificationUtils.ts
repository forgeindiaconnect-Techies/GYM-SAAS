import Notification from '../models/Notification';
import mongoose from 'mongoose';

interface NotifyParams {
  recipientId: string | mongoose.Types.ObjectId;
  recipientRole: string;
  gymId: string | mongoose.Types.ObjectId;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  relatedRecordId?: string;
  link?: string;
}

export const notify = async (params: NotifyParams): Promise<void> => {
  try {
    const notif = new Notification({
      ...params,
      isRead: false
    });
    await notif.save();
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};
