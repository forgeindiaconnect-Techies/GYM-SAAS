import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import DirectMessage from '../models/DirectMessage';
import User from '../models/User';
import TrainerSession from '../models/TrainerSession';
import { notify } from '../utils/notificationUtils';
import mongoose from 'mongoose';

export const getContacts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    let contactIdsSet = new Set<string>();

    // 1. Gather users with existing direct message history
    const messageHistory = await DirectMessage.find({
      $or: [
        { senderId: new mongoose.Types.ObjectId(currentUserId) },
        { receiverId: new mongoose.Types.ObjectId(currentUserId) }
      ]
    }).select('senderId receiverId');

    messageHistory.forEach((msg) => {
      if (msg.senderId.toString() !== currentUserId) {
        contactIdsSet.add(msg.senderId.toString());
      }
      if (msg.receiverId.toString() !== currentUserId) {
        contactIdsSet.add(msg.receiverId.toString());
      }
    });

    // 2. Gather role-specific contacts
    if (currentUser.role === 'TRAINER') {
      // Find customers who booked sessions with this trainer
      const sessions = await TrainerSession.find({ trainerId: currentUserId }).select('customerId');
      sessions.forEach((s) => {
        if (s.customerId) contactIdsSet.add(s.customerId.toString());
      });

      // Find customers assigned to this trainer
      const assignedCustomers = await User.find({ assignedTrainer: currentUserId }).select('_id');
      assignedCustomers.forEach((c) => contactIdsSet.add(c._id.toString()));

      // If set is still empty, include members in the same gym
      if (contactIdsSet.size === 0 && currentUser.gymId) {
        const gymMembers = await User.find({
          gymId: currentUser.gymId,
          role: 'MEMBER',
          _id: { $ne: currentUserId }
        } as any).limit(20).select('_id');
        gymMembers.forEach((m) => contactIdsSet.add(m._id.toString()));
      }
    } else {
      // Customer / Member side:
      // Find assigned trainer
      if (currentUser.assignedTrainer) {
        contactIdsSet.add(currentUser.assignedTrainer.toString());
      }

      // Find trainers from booked sessions
      const sessions = await TrainerSession.find({ customerId: currentUserId }).select('trainerId');
      sessions.forEach((s) => {
        if (s.trainerId) contactIdsSet.add(s.trainerId.toString());
      });

      // Include all trainers in current gym
      const gymTrainers = await User.find({
        role: 'TRAINER',
        _id: { $ne: currentUserId }
      } as any).limit(20).select('_id');
      gymTrainers.forEach((t) => contactIdsSet.add(t._id.toString()));
    }

    const contactIds = Array.from(contactIdsSet);
    const users = await User.find({ _id: { $in: contactIds } })
      .select('firstName lastName email profilePhoto role specialization isActive');

    // Build contacts payload with last message info & unread count
    const contactsPayload = await Promise.all(
      users.map(async (u) => {
        const lastMsg = await DirectMessage.findOne({
          $or: [
            { senderId: currentUserId, receiverId: u._id },
            { senderId: u._id, receiverId: currentUserId }
          ]
        }).sort({ createdAt: -1 });

        const unreadCount = await DirectMessage.countDocuments({
          senderId: u._id,
          receiverId: currentUserId,
          read: false
        });

        return {
          id: u._id.toString(),
          _id: u._id.toString(),
          firstName: u.firstName,
          lastName: u.lastName,
          name: `${u.firstName} ${u.lastName}`.trim(),
          email: u.email,
          profilePhoto: u.profilePhoto || '',
          role: u.role,
          specialization: u.specialization || '',
          isActive: u.isActive !== false,
          lastMsg: lastMsg ? lastMsg.message : 'Tap to start conversation',
          lastMsgTime: lastMsg ? lastMsg.createdAt : null,
          unreadCount
        };
      })
    );

    // Sort by last message time descending
    contactsPayload.sort((a, b) => {
      const timeA = a.lastMsgTime ? new Date(a.lastMsgTime).getTime() : 0;
      const timeB = b.lastMsgTime ? new Date(b.lastMsgTime).getTime() : 0;
      return timeB - timeA;
    });

    res.status(200).json({ success: true, contacts: contactsPayload });
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    const { otherUserId } = req.params;

    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!otherUserId) {
      res.status(400).json({ success: false, message: 'otherUserId is required' });
      return;
    }

    // Fetch messages between these two users
    const messages = await DirectMessage.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages sent by otherUserId to currentUserId as read
    await DirectMessage.updateMany(
      { senderId: otherUserId, receiverId: currentUserId, read: false },
      { read: true }
    );

    res.status(200).json({ success: true, messages });
  } catch (error: any) {
    console.error('Error fetching message history:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    const { receiverId, message } = req.body;

    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!receiverId || !message || !message.trim()) {
      res.status(400).json({ success: false, message: 'receiverId and message are required' });
      return;
    }

    const sender = await User.findById(currentUserId);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      res.status(404).json({ success: false, message: 'Recipient user not found' });
      return;
    }

    const newMsg = await DirectMessage.create({
      senderId: currentUserId,
      receiverId,
      gymId: sender?.gymId || receiver.gymId,
      message: message.trim(),
      read: false
    });

    // Notify receiver
    const senderName = sender ? `${sender.firstName} ${sender.lastName}`.trim() : 'Someone';
    await notify({
      recipientId: receiver._id,
      recipientRole: receiver.role,
      gymId: receiver.gymId || sender?.gymId || new mongoose.Types.ObjectId(),
      title: `New Message from ${senderName}`,
      message: message.trim().slice(0, 60),
      type: 'info',
      link: receiver.role === 'TRAINER' ? '/trainer/messages' : '/member/chat'
    });

    res.status(201).json({ success: true, message: newMsg });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
