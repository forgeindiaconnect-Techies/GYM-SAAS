import { Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middlewares/auth';

const getNotificationQuery = (user: any) => {
  const userId = user.id;
  const gymId = user.gymId;
  const role = user.role;

  const conditions: any[] = [{ recipientId: userId }];
  if (gymId && (role === 'GYM_OWNER' || role === 'ADMIN')) {
    conditions.push({ gymId, recipientRole: 'GYM_OWNER' });
  } else if (gymId && role === 'TRAINER') {
    conditions.push({ gymId, recipientRole: 'TRAINER' });
  }

  return { $or: conditions };
};

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const query = getNotificationQuery(req.user!);
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id: notificationId } = req.params;
    const query = getNotificationQuery(req.user!);

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, ...query },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const query = getNotificationQuery(req.user!);

    await Notification.updateMany(
      { ...query, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
