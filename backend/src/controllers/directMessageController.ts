import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import DirectMessage, { IAttachment, MessageType, AttachmentCategory } from '../models/DirectMessage';
import User from '../models/User';
import TrainerSession from '../models/TrainerSession';
import { notify } from '../utils/notificationUtils';
import mongoose from 'mongoose';
import multer from 'multer';
import { uploadBufferToCloudinary } from '../config/cloudinary';

// Configure multer memory storage for message uploads (Max 50MB)
export const messageUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

export const getAttachmentCategory = (mimeType: string, filename: string): AttachmentCategory => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
    return 'image';
  }
  if (mimeType.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) {
    return 'video';
  }
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'weba'].includes(ext)) {
    return 'audio';
  }
  if (
    mimeType.includes('pdf') ||
    mimeType.includes('msword') ||
    mimeType.includes('wordprocessingml') ||
    mimeType.includes('spreadsheetml') ||
    mimeType.includes('excel') ||
    mimeType.startsWith('text/') ||
    ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'].includes(ext)
  ) {
    return 'document';
  }
  return 'other';
};

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
    let activeTrainerCtx: any = null;
    if (currentUser.role === 'TRAINER') {
      const { resolveTrainerContext, getTrainerAssignedCustomerIds } = await import('../utils/trainerIsolation');
      activeTrainerCtx = await resolveTrainerContext(req.user);
      if (!activeTrainerCtx) {
        res.status(403).json({ success: false, message: 'Active trainer context required' });
        return;
      }
      const assignedIds = await getTrainerAssignedCustomerIds(activeTrainerCtx);
      assignedIds.forEach((id) => contactIdsSet.add(id));
    } else {
      // Customer / Member side:
      const Trainer = (await import('../models/Trainer')).default;
      if (currentUser.assignedTrainer) {
        const assignedTrainerDoc: any = await Trainer.findById(currentUser.assignedTrainer).select('userId').lean();
        contactIdsSet.add(String(assignedTrainerDoc?.userId || currentUser.assignedTrainer));
      }

      // Find trainers from booked sessions
      const sessions = await TrainerSession.find({ customerId: currentUserId }).select('trainerId').lean();
      for (const s of sessions) {
        if (s.trainerId) {
          const tDoc: any = await Trainer.findById(s.trainerId).select('userId').lean();
          contactIdsSet.add(String(tDoc?.userId || s.trainerId));
        }
      }

      // Include trainers in the same gym
      if (currentUser.gymId) {
        const gymTrainers = await Trainer.find({ gymId: currentUser.gymId, status: 'Active' }).select('userId').lean();
        gymTrainers.forEach((t: any) => {
          if (t.userId && String(t.userId) !== currentUserId) {
            contactIdsSet.add(String(t.userId));
          }
        });
      }
    }

    const contactIds = Array.from(contactIdsSet).filter((id) => mongoose.Types.ObjectId.isValid(id) && id !== currentUserId);
    const userFilter: any = { _id: { $in: contactIds } };
    if (activeTrainerCtx) {
      userFilter.gymId = activeTrainerCtx.gymId;
    } else if (currentUser.gymId) {
      userFilter.gymId = currentUser.gymId;
    }
    const users = contactIds.length > 0
      ? await User.find(userFilter).select('firstName lastName email profilePhoto role specialization isActive')
      : [];

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

        let snippet = 'Tap to start conversation';
        if (lastMsg) {
          if (lastMsg.message && lastMsg.message.trim()) {
            snippet = lastMsg.message;
          } else if (lastMsg.messageType === 'voice') {
            snippet = '🎤 Voice message';
          } else if (lastMsg.messageType === 'image') {
            snippet = '📷 Photo attachment';
          } else if (lastMsg.messageType === 'video') {
            snippet = '🎥 Video attachment';
          } else if (lastMsg.attachments && lastMsg.attachments.length > 0) {
            snippet = `📎 ${lastMsg.attachments[0].fileName || 'Attachment'}`;
          } else if (lastMsg.fileName) {
            snippet = `📎 ${lastMsg.fileName}`;
          } else {
            snippet = '📎 Sent an attachment';
          }
        }

        const safePhoto = (u.profilePhoto && !u.profilePhoto.startsWith('file:') && !u.profilePhoto.startsWith('content:')) ? u.profilePhoto : '';

        return {
          id: u._id.toString(),
          _id: u._id.toString(),
          firstName: u.firstName,
          lastName: u.lastName,
          name: `${u.firstName} ${u.lastName}`.trim(),
          email: u.email,
          profilePhoto: safePhoto,
          role: u.role,
          specialization: u.specialization || '',
          isActive: u.isActive !== false,
          lastMsg: snippet,
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
    const rawOtherUserId = req.params.otherUserId;
    const otherUserId = Array.isArray(rawOtherUserId) ? rawOtherUserId[0] : (rawOtherUserId || '');

    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!otherUserId) {
      res.status(400).json({ success: false, message: 'otherUserId is required' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      res.status(400).json({ success: false, message: 'Invalid user ID' });
      return;
    }

    const resolvedOtherId = otherUserId;
    if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const otherObjId = new mongoose.Types.ObjectId(resolvedOtherId);
    const currentObjId = new mongoose.Types.ObjectId(currentUserId);

    // Enforce trainer-wise and gym-wise isolation on message history
    if (req.user?.role === 'TRAINER') {
      const { resolveTrainerContext, isCustomerAssignedToTrainer } = await import('../utils/trainerIsolation');
      const trainerCtx = await resolveTrainerContext(req.user);
      if (!trainerCtx) {
        res.status(403).json({ success: false, message: 'Active trainer context required' });
        return;
      }
      const otherUser: any = await User.findById(otherObjId).select('role gymId').lean();
      if (!otherUser || (otherUser.gymId && String(otherUser.gymId) !== trainerCtx.gymId)) {
        res.status(403).json({ success: false, message: 'Unauthorized: cross-gym access denied' });
        return;
      }
      if (otherUser.role === 'MEMBER') {
        const assigned = await isCustomerAssignedToTrainer(trainerCtx, resolvedOtherId);
        const hasPriorMsg = await DirectMessage.exists({
          $or: [
            { senderId: currentObjId, receiverId: otherObjId },
            { senderId: otherObjId, receiverId: currentObjId }
          ]
        });
        if (!assigned && !hasPriorMsg) {
          res.status(403).json({ success: false, message: 'Unauthorized: customer is not assigned to you' });
          return;
        }
      }
    }

    // Fetch messages between these two users
    const messages = await DirectMessage.find({
      $or: [
        { senderId: currentObjId, receiverId: otherObjId },
        { senderId: otherObjId, receiverId: currentObjId }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages sent by resolvedOtherId to currentUserId as read
    await DirectMessage.updateMany(
      { senderId: otherObjId, receiverId: currentObjId, read: false },
      { read: true }
    );

    res.status(200).json({ success: true, messages });
  } catch (error: any) {
    console.error('Error fetching message history:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const uploadAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    // 50MB limit validation
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      res.status(400).json({ 
        success: false, 
        message: 'File size exceeds maximum allowed limit (50MB).' 
      });
      return;
    }

    const fileName = file.originalname || `upload-${Date.now()}`;
    const mimeType = file.mimetype || 'application/octet-stream';
    const isVoice = req.body.isVoice === 'true' || req.body.isVoice === true;
    const fileCategory = isVoice ? 'audio' : getAttachmentCategory(mimeType, fileName);

    // Upload buffer to Cloudinary with automatic fallback
    const uploadResult = await uploadBufferToCloudinary(
      file.buffer,
      fileName,
      mimeType,
      'gym_saas/messages'
    );

    const duration = req.body.duration ? parseFloat(req.body.duration) : uploadResult.duration;

    const attachment: IAttachment = {
      url: uploadResult.secure_url || uploadResult.url,
      fileName,
      fileType: fileCategory,
      mimeType,
      fileSize: file.size,
      duration: duration || undefined,
      publicId: uploadResult.public_id
    };

    res.status(200).json({
      success: true,
      attachment
    });
  } catch (error: any) {
    console.error('Error uploading message attachment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload attachment.'
    });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    let { 
      receiverId, 
      recipientId,
      message = '', 
      content = '',
      text = '',
      messageType = 'text', 
      attachments = [], 
      duration, 
      attachmentUrl, 
      fileName, 
      fileType, 
      fileSize 
    } = req.body;

    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let targetReceiverId = receiverId || recipientId;
    let finalMessage = (message || content || text || '').trim();

    const sender = await User.findById(currentUserId);

    let receiver: any = null;
    if (targetReceiverId && mongoose.Types.ObjectId.isValid(targetReceiverId)) {
      receiver = await User.findById(targetReceiverId);
      if (!receiver) {
        // Support passing Trainer._id when customer messages a trainer
        const Trainer = (await import('../models/Trainer')).default;
        const trainerDoc: any = await Trainer.findById(targetReceiverId).select('userId gymId').lean();
        if (trainerDoc?.userId) {
          receiver = await User.findById(trainerDoc.userId);
        }
      }
    }

    if (!receiver && sender?.role === 'MEMBER' && sender?.assignedTrainer) {
      const Trainer = (await import('../models/Trainer')).default;
      const trainerDoc: any = await Trainer.findById(sender.assignedTrainer).select('userId').lean();
      receiver = await User.findById(trainerDoc?.userId || sender.assignedTrainer);
    }

    if (!receiver) {
      res.status(404).json({ success: false, message: 'Recipient user not found' });
      return;
    }

    // Strict gym & trainer isolation on sendMessage
    if (sender?.role === 'TRAINER') {
      const { resolveTrainerContext, isCustomerAssignedToTrainer } = await import('../utils/trainerIsolation');
      const trainerCtx = await resolveTrainerContext(req.user);
      if (!trainerCtx) {
        res.status(403).json({ success: false, message: 'Active trainer context required' });
        return;
      }
      if (receiver.gymId && String(receiver.gymId) !== trainerCtx.gymId) {
        res.status(403).json({ success: false, message: 'Unauthorized: cannot message users outside your gym' });
        return;
      }
      if (receiver.role === 'MEMBER') {
        const assigned = await isCustomerAssignedToTrainer(trainerCtx, String(receiver._id));
        if (!assigned) {
          res.status(403).json({ success: false, message: 'Unauthorized: customer is not assigned to you' });
          return;
        }
      }
    } else if (sender?.role === 'MEMBER') {
      if (!sender.gymId) {
        res.status(403).json({ success: false, message: 'Please select a gym first to message trainers.' });
        return;
      }
      if (!receiver.gymId || String(sender.gymId) !== String(receiver.gymId)) {
        res.status(403).json({ success: false, message: 'Unauthorized: cannot message users outside your selected gym' });
        return;
      }
      if (receiver.role === 'MEMBER') {
        res.status(403).json({ success: false, message: 'Unauthorized: customers can only message gym trainers or staff' });
        return;
      }
      if (receiver.role === 'TRAINER') {
        const { verifyTrainerBelongsToCustomerGym } = await import('../utils/customerIsolation');
        const check = await verifyTrainerBelongsToCustomerGym(String(receiver._id), sender.gymId);
        if (!check.valid) {
          res.status(403).json({ success: false, message: check.message || 'Unauthorized: trainer not active in your selected gym' });
          return;
        }
      }
    } else if (sender?.gymId && receiver.gymId && String(sender.gymId) !== String(receiver.gymId)) {
      res.status(403).json({ success: false, message: 'Unauthorized: cannot message users outside your gym' });
      return;
    }

    targetReceiverId = receiver._id.toString();

    // Validate that either message text or attachments exist
    const hasText = finalMessage.length > 0;
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
    const hasSingleAttachment = Boolean(attachmentUrl);

    if (!hasText && !hasAttachments && !hasSingleAttachment && messageType !== 'voice') {
      res.status(400).json({ 
        success: false, 
        message: 'Message cannot be empty. Please provide text, a voice recording, or file attachment.' 
      });
      return;
    }

    // Normalize attachments and sanitize unsafe device file URIs
    let normalizedAttachments: IAttachment[] = [];
    if (hasAttachments) {
      normalizedAttachments = attachments.filter((att: any) => {
        const u = att?.url;
        return typeof u === 'string' && !u.startsWith('file:') && !u.startsWith('content:');
      });
    } else if (hasSingleAttachment && typeof attachmentUrl === 'string' && !attachmentUrl.startsWith('file:') && !attachmentUrl.startsWith('content:')) {
      normalizedAttachments = [{
        url: attachmentUrl,
        fileName: fileName || (messageType === 'voice' ? 'voice-message.webm' : 'attachment'),
        fileType: (fileType as AttachmentCategory) || (messageType === 'voice' ? 'audio' : 'other'),
        mimeType: messageType === 'voice' ? 'audio/webm' : 'application/octet-stream',
        fileSize: fileSize || 0,
        duration: duration ? parseFloat(duration) : undefined
      }];
    }

    // Determine primary messageType
    let resolvedMessageType: MessageType = messageType;
    if (messageType === 'text' && normalizedAttachments.length > 0) {
      const firstType = normalizedAttachments[0].fileType;
      if (firstType === 'image') resolvedMessageType = 'image';
      else if (firstType === 'video') resolvedMessageType = 'video';
      else if (firstType === 'audio') resolvedMessageType = 'voice';
      else resolvedMessageType = 'file';
    }

    const primaryAttachment = normalizedAttachments[0];

    const newMsg = await DirectMessage.create({
      senderId: currentUserId,
      receiverId: targetReceiverId,
      gymId: sender?.gymId || receiver.gymId,
      message: finalMessage,
      messageType: resolvedMessageType,
      attachments: normalizedAttachments,
      attachmentUrl: primaryAttachment ? primaryAttachment.url : attachmentUrl,
      fileName: primaryAttachment ? primaryAttachment.fileName : fileName,
      fileType: primaryAttachment ? primaryAttachment.fileType : fileType,
      fileSize: primaryAttachment ? primaryAttachment.fileSize : fileSize,
      duration: duration || (primaryAttachment ? primaryAttachment.duration : undefined),
      read: false
    });

    // Notify receiver
    const senderName = sender ? `${sender.firstName} ${sender.lastName}`.trim() : 'Someone';
    let notifyTitle = `New Message from ${senderName}`;
    let notifySnippet = finalMessage ? finalMessage.slice(0, 60) : 'Sent an attachment';

    if (resolvedMessageType === 'voice') {
      notifyTitle = `🎤 Voice Message from ${senderName}`;
      notifySnippet = 'Sent a voice recording';
    } else if (resolvedMessageType === 'image') {
      notifyTitle = `📷 New Photo from ${senderName}`;
      notifySnippet = message ? `Photo: ${message.slice(0, 40)}` : 'Sent a photo';
    } else if (resolvedMessageType === 'video') {
      notifyTitle = `🎥 New Video from ${senderName}`;
      notifySnippet = message ? `Video: ${message.slice(0, 40)}` : 'Sent a video';
    } else if (resolvedMessageType === 'file') {
      notifyTitle = `📎 New Attachment from ${senderName}`;
      notifySnippet = primaryAttachment?.fileName || 'Sent a file';
    }

    await notify({
      recipientId: receiver._id,
      recipientRole: receiver.role,
      gymId: receiver.gymId || sender?.gymId || new mongoose.Types.ObjectId(),
      title: notifyTitle,
      message: notifySnippet,
      type: 'info',
      link: receiver.role === 'TRAINER' ? '/trainer/messages' : '/member/chat'
    });

    res.status(201).json({ success: true, message: newMsg });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
