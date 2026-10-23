import { Response } from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification';
import { AuthRequest } from '../middlewares/auth';

const getNotificationQuery = (user: any, branchQuery?: string) => {
  const userId = user.id || user._id;
  const gymId = user.gymId;
  const role = (user.role || '').toUpperCase();
  const effectiveBranchId = user.branchId || branchQuery;

  const validUserObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;
  const userIds = validUserObjId ? [userId, validUserObjId] : [userId];

  const conditions: any[] = [{ recipientId: { $in: userIds } }];

  const validGymObjId = gymId && mongoose.Types.ObjectId.isValid(gymId) ? new mongoose.Types.ObjectId(gymId) : null;
  const gymMatch = validGymObjId ? { $in: [gymId, validGymObjId] } : gymId;

  if (role === 'SUPER_ADMIN') {
    conditions.push({ recipientRole: 'SUPER_ADMIN' });
  } else if (gymId && (role === 'GYM_OWNER' || role === 'ADMIN')) {
    if (effectiveBranchId && effectiveBranchId !== 'all') {
      if (effectiveBranchId === 'main') {
        conditions.push({ gymId: gymMatch, recipientRole: 'GYM_OWNER', $or: [{ branchId: { $exists: false } }, { branchId: null }] });
      } else {
        const validBranchObjId = mongoose.Types.ObjectId.isValid(effectiveBranchId) ? new mongoose.Types.ObjectId(effectiveBranchId) : null;
        const branchMatch = validBranchObjId ? { $in: [effectiveBranchId, validBranchObjId] } : effectiveBranchId;
        conditions.push({ gymId: gymMatch, recipientRole: 'GYM_OWNER', branchId: branchMatch });
      }
    } else {
      conditions.push({ gymId: gymMatch, recipientRole: 'GYM_OWNER' });
    }
  } else if (gymId && role === 'TRAINER') {
    conditions.push({ gymId: gymMatch, recipientRole: 'TRAINER' });
  } else if (gymId && (role === 'MEMBER' || role === 'CUSTOMER')) {
    conditions.push({ gymId: gymMatch, recipientRole: 'MEMBER' });
  }

  return { $or: conditions };
};

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const query = getNotificationQuery(req.user!, req.query.branchId as string);
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(100);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const rawId = req.params.id;
    const notificationId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }
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

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const rawId = req.params.id;
    const notificationId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }
    const query = getNotificationQuery(req.user!);

    const notification = await Notification.findOneAndDelete({ _id: notificationId, ...query });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

