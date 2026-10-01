import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User, { Role, ApprovalStatus } from '../models/User';
import Trainer from '../models/Trainer';
import TrainerFee from '../models/TrainerFee';
import TrainerInvitation from '../models/TrainerInvitation';
import Gym from '../models/Gym';
import mongoose from 'mongoose';

const isAuthorizedStaff = (role?: string) => {
  const r = (role || '').toUpperCase().trim();
  return ['GYM_OWNER', 'GYM_MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(r);
};

const resolveGymId = async (req: AuthRequest): Promise<string | undefined> => {
  if (req.user?.gymId) return req.user.gymId.toString();
  if (req.query.gymId) return req.query.gymId as string;
  const gym = await Gym.findOne().sort({ createdAt: -1 });
  return gym?._id?.toString();
};

// 1. Manual Add Trainer
export const manualAddTrainer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymOwner = req.user;
    if (!gymOwner || !isAuthorizedStaff(gymOwner.role)) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const resolvedGymId = (await resolveGymId(req)) || gymOwner.gymId;

    const {
      name, email, phone, profilePhoto, specialization, experience,
      trainingMode, qualifications, certifications, expertise, bio,
      fee, paymentType, status, availableDays, availableStartTime, availableEndTime, availableSlot, password, branchId
    } = req.body;

    if (!name || !email || !phone || !specialization || !trainingMode) {
      res.status(400).json({ success: false, message: 'Required fields missing' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email already in use' });
      return;
    }

    // Ensure the training mode is valid for the gym
    const gym = await Gym.findById(resolvedGymId);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    if (gym.trainingMode !== 'both' && trainingMode !== 'both' && gym.trainingMode !== trainingMode) {
      res.status(400).json({ success: false, message: `Trainer mode ${trainingMode} is not supported by this gym (${gym.trainingMode})` });
      return;
    }

    const defaultPassword = password || 'WelcomeTrainer123!';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    const [firstName, ...lastNames] = name.split(' ');
    const lastName = lastNames.join(' ') || ' ';

    const user = new User({
      firstName,
      lastName,
      email,
      mobile: phone,
      passwordHash,
      role: Role.TRAINER,
      gymId: resolvedGymId,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED
    });

    await user.save();

    const trainer = new Trainer({
      gymId: resolvedGymId,
      branchId: branchId && branchId !== 'main' ? branchId : undefined,
      userId: user._id,
      name,
      email,
      phone,
      profilePhoto,
      specialization,
      experience,
      trainingMode,
      qualifications,
      certifications,
      expertise,
      bio,
      availableDays,
      availableStartTime,
      availableEndTime,
      availableSlot,
      fee,
      paymentType,
      status: status || 'Active'
    });

    await trainer.save();

    if (fee && Number(fee) > 0) {
      try {
        const cycleMap: Record<string, 'Weekly' | 'Monthly' | 'Per Session' | 'Custom'> = {
          'Per Week': 'Weekly',
          'Per Month': 'Monthly',
          'Per Session': 'Per Session'
        };
        const modeMap: Record<string, string> = {
          'online': 'Online Training',
          'offline': 'Offline Training',
          'both': 'Hybrid Training'
        };
        await TrainerFee.create({
          gymId: resolvedGymId,
          branchId: branchId && branchId !== 'main' ? branchId : undefined,
          trainerId: trainer._id,
          trainingType: modeMap[trainingMode] || 'Offline Training',
          feeAmount: Number(fee),
          billingCycle: cycleMap[paymentType || 'Per Month'] || 'Monthly',
          effectiveFrom: new Date(),
          paymentMethod: 'Bank Transfer',
          status: 'Active',
          notes: `Configured during trainer onboarding (${specialization || 'General'})`,
          createdBy: (gymOwner as any).id || (gymOwner as any)._id
        });
      } catch (feeErr) {
        console.error('Error auto-creating TrainerFee in manualAddTrainer:', feeErr);
      }
    }

    res.status(201).json({ success: true, message: 'Trainer added successfully', trainer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 2. Send Invitation
export const inviteTrainer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymOwner = req.user;
    if (!gymOwner || !isAuthorizedStaff(gymOwner.role)) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const resolvedGymId = (await resolveGymId(req)) || gymOwner.gymId;

    const { trainerName, email, trainingMode, personalMessage, phone, specialization } = req.body;

    if (!trainerName || !email || !trainingMode) {
      res.status(400).json({ success: false, message: 'Required fields missing' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User with this email already exists' });
      return;
    }

    const existingActiveInvite = await TrainerInvitation.findOne({ email, gymId: resolvedGymId, status: 'Pending' });
    if (existingActiveInvite) {
      res.status(400).json({ success: false, message: 'An active invitation already exists for this email.' });
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const gym = await Gym.findById(resolvedGymId);
    
    if (gym && gym.trainingMode !== 'both' && trainingMode !== 'both' && gym.trainingMode !== trainingMode) {
      res.status(400).json({ success: false, message: `Trainer mode ${trainingMode} is not supported by this gym (${gym.trainingMode})` });
      return;
    }

    const invitation = new TrainerInvitation({
      gymId: resolvedGymId,
      invitedBy: gymOwner.id,
      email,
      trainerName,
      tokenHash,
      expiresAt,
      trainingMode,
      personalMessage
    });

    await invitation.save();

    // In a real app, send email via SendGrid/Nodemailer here
    const inviteLink = `http://localhost:5173/invite/trainer/${rawToken}`;
    console.log(`[MOCK EMAIL SENT] To: ${email} | Link: ${inviteLink} | Message: ${personalMessage}`);

    res.status(200).json({ success: true, message: 'Invitation sent successfully', inviteLink });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 3. Verify Invitation (Public)
export const verifyInvitation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const token = req.params.token as string;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const invitation = await TrainerInvitation.findOne({ tokenHash }).populate('gymId', 'name location trainingMode');
    
    if (!invitation) {
      res.status(404).json({ success: false, message: 'Invalid invitation link' });
      return;
    }

    if (invitation.status !== 'Pending' || invitation.expiresAt < new Date()) {
      if (invitation.status === 'Pending') {
        invitation.status = 'Expired';
        await invitation.save();
      }
      res.status(400).json({ success: false, message: 'Invitation is expired or no longer valid' });
      return;
    }

    res.status(200).json({ success: true, invitation });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 4. Accept Invitation (Public)
export const acceptInvitation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const token = req.params.token as string;
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const invitation = await TrainerInvitation.findOne({ tokenHash, status: 'Pending' });

    if (!invitation || invitation.expiresAt < new Date()) {
      res.status(400).json({ success: false, message: 'Invalid or expired invitation' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const [firstName, ...lastNames] = name.split(' ');
    const lastName = lastNames.join(' ') || ' ';

    const user = new User({
      firstName,
      lastName,
      email: invitation.email,
      mobile: phone,
      passwordHash,
      role: Role.TRAINER,
      gymId: invitation.gymId,
      isActive: false, // Must be approved by gym owner
      approvalStatus: ApprovalStatus.PENDING
    });

    await user.save();

    invitation.status = 'Accepted';
    invitation.acceptedAt = new Date();
    await invitation.save();

    res.status(200).json({ success: true, message: 'Account created successfully. Please complete your profile.', userId: user.id });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 5. Complete Profile (Public/Trainer)
export const completeProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, specialization, experience, profilePhoto, qualifications, certifications, expertise, bio, availability, trainingMode } = req.body;

    const user = await User.findById(userId);
    if (!user || user.role !== Role.TRAINER) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const trainer = new Trainer({
      gymId: user.gymId,
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.mobile,
      profilePhoto,
      specialization,
      experience,
      trainingMode,
      qualifications,
      certifications,
      expertise,
      bio,
      availability,
      status: 'Pending'
    });

    await trainer.save();

    res.status(201).json({ success: true, message: 'Profile completed successfully. Awaiting admin approval.', trainer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 6. Get Trainers (Admin)
export const getMyGymTrainers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== Role.MEMBER) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!user.gymId) {
      res.status(400).json({ success: false, message: 'User is not associated with any gym' });
      return;
    }

    console.log('Fetching trainers for gymId:', user.gymId);
    const trainers = await Trainer.find({ gymId: user.gymId, status: 'Active' }).sort({ name: 1 });
    console.log('Found trainers:', trainers.length);

    res.status(200).json({ success: true, trainers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getTrainers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymOwner = req.user;
    if (!gymOwner || !isAuthorizedStaff(gymOwner.role)) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const resolvedGymId = (await resolveGymId(req)) || gymOwner.gymId;
    const branchId = req.query.branchId as string;
    let query: any = resolvedGymId ? { gymId: resolvedGymId } : {};
    if (branchId && branchId !== 'undefined' && branchId !== 'null' && branchId !== 'all') {
      if (branchId === 'main') {
        query.$or = [
          { branchId: { $exists: false } },
          { branchId: null }
        ];
      } else if (mongoose.Types.ObjectId.isValid(branchId)) {
        query.branchId = branchId;
      }
    }

    const trainers = await Trainer.find(query).sort({ createdAt: -1 });
    // fetch all invitations for this gym
    const invitations = resolvedGymId ? await TrainerInvitation.find({ gymId: resolvedGymId }).sort({ createdAt: -1 }) : [];

    res.status(200).json({ success: true, trainers, invitations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getTrainerById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainer = await Trainer.findOne({ _id: req.params.id });
    if (!trainer) {
      res.status(404).json({ success: false, message: 'Trainer not found' });
      return;
    }
    res.status(200).json({ success: true, trainer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateTrainerStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymOwner = req.user;
    if (!gymOwner || !isAuthorizedStaff(gymOwner.role)) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { status, reason } = req.body;
    const resolvedGymId = (await resolveGymId(req)) || gymOwner.gymId;
    const trainerQuery: any = { _id: id };
    if (resolvedGymId) trainerQuery.gymId = resolvedGymId;
    
    const trainer = await Trainer.findOne(trainerQuery);
    if (!trainer) {
      res.status(404).json({ success: false, message: 'Trainer not found' });
      return;
    }

    trainer.status = status;
    await trainer.save();

    // Sync with User model
    const user = await User.findById(trainer.userId);
    if (user) {
      if (status === 'Active') {
        user.isActive = true;
        user.approvalStatus = ApprovalStatus.APPROVED;
      } else if (status === 'Rejected') {
        user.isActive = false;
        user.approvalStatus = ApprovalStatus.REJECTED;
        user.rejectionReason = reason;
      } else if (status === 'Suspended') {
        user.isActive = false;
        user.approvalStatus = ApprovalStatus.SUSPENDED;
      }
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Trainer status updated', trainer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const deleteTrainer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymOwner = req.user;
    if (!gymOwner || !isAuthorizedStaff(gymOwner.role)) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const resolvedGymId = (await resolveGymId(req)) || gymOwner.gymId;
    const trainerQuery: any = { _id: id };
    if (resolvedGymId) trainerQuery.gymId = resolvedGymId;
    const trainer = await Trainer.findOne(trainerQuery);
    if (!trainer) {
      res.status(404).json({ success: false, message: 'Trainer not found' });
      return;
    }

    await Trainer.findByIdAndDelete(id);
    await User.findByIdAndDelete(trainer.userId);

    res.status(200).json({ success: true, message: 'Trainer deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 8. Get My Profile (Trainer self)
export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const trainer = await Trainer.findOne({ userId });
    if (!trainer) {
      res.status(404).json({ success: false, message: 'Trainer profile not found' });
      return;
    }
    res.status(200).json({ success: true, trainer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 9. Update My Profile (Trainer self)
export const updateMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const allowedUpdates = [
      'phone', 'profilePhoto', 'specialization', 'experience',
      'trainingMode', 'qualifications', 'certifications', 'expertise',
      'bio', 'fee', 'paymentType', 'availableDays',
      'availableStartTime', 'availableEndTime', 'availableSlot'
    ];
    const updateData: any = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    const trainer = await Trainer.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true }
    );

    if (!trainer) {
      res.status(404).json({ success: false, message: 'Trainer profile not found' });
      return;
    }

    res.status(200).json({ success: true, trainer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 10. Update Trainer (Admin)
export const updateTrainer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymOwner = req.user;
    if (!gymOwner || !isAuthorizedStaff(gymOwner.role)) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const resolvedGymId = (await resolveGymId(req)) || gymOwner.gymId;
    
    const allowedUpdates = [
      'name', 'phone', 'profilePhoto', 'specialization', 'experience',
      'trainingMode', 'qualifications', 'certifications', 'expertise',
      'bio', 'fee', 'paymentType', 'availableDays',
      'availableStartTime', 'availableEndTime', 'availableSlot', 'branchId'
    ];
    
    const updateData: any = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    const trainerQuery: any = { _id: id };
    if (resolvedGymId) trainerQuery.gymId = resolvedGymId;

    const trainer = await Trainer.findOneAndUpdate(
      trainerQuery,
      { $set: updateData },
      { new: true }
    );

    if (!trainer) {
      res.status(404).json({ success: false, message: 'Trainer not found' });
      return;
    }

    // Also update User if name or phone changed
    if (updateData.name || updateData.phone) {
      const userUpdate: any = {};
      if (updateData.name) {
        const [firstName, ...lastNames] = updateData.name.split(' ');
        userUpdate.firstName = firstName;
        userUpdate.lastName = lastNames.join(' ') || ' ';
      }
      if (updateData.phone) {
        userUpdate.mobile = updateData.phone;
      }
      await User.findByIdAndUpdate(trainer.userId, { $set: userUpdate });
    }

    if (updateData.fee !== undefined && Number(updateData.fee) > 0) {
      try {
        const cycleMap: Record<string, 'Weekly' | 'Monthly' | 'Per Session' | 'Custom'> = {
          'Per Week': 'Weekly',
          'Per Month': 'Monthly',
          'Per Session': 'Per Session'
        };
        const modeMap: Record<string, string> = {
          'online': 'Online Training',
          'offline': 'Offline Training',
          'both': 'Hybrid Training'
        };
        const existingFee = await TrainerFee.findOne({ trainerId: trainer._id, status: 'Active' });
        if (existingFee) {
          existingFee.feeAmount = Number(updateData.fee);
          if (updateData.paymentType) existingFee.billingCycle = cycleMap[updateData.paymentType] || 'Monthly';
          if (updateData.trainingMode) existingFee.trainingType = modeMap[updateData.trainingMode] || existingFee.trainingType;
          await existingFee.save();
        } else {
          await TrainerFee.create({
            gymId: gymOwner.gymId,
            branchId: trainer.branchId,
            trainerId: trainer._id,
            trainingType: modeMap[trainer.trainingMode] || 'Offline Training',
            feeAmount: Number(updateData.fee),
            billingCycle: cycleMap[trainer.paymentType || 'Per Month'] || 'Monthly',
            effectiveFrom: new Date(),
            paymentMethod: 'Bank Transfer',
            status: 'Active',
            notes: 'Configured from trainer profile update',
            createdBy: gymOwner.id as any
          });
        }
      } catch (syncErr) {
        console.error('Error syncing TrainerFee on trainer update:', syncErr);
      }
    }

    res.status(200).json({ success: true, message: 'Trainer updated successfully', trainer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getOnlineTrainers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId || (await resolveGymId(req));
    const filter: any = {
      status: 'Active'
    };
    if (gymId) filter.gymId = gymId;

    const trainers = await Trainer.find(filter).sort({ averageRating: -1, createdAt: -1 });
    res.status(200).json({ success: true, trainers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const toggleTrainerAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainerUserId = req.user?.id;
    const { availabilityStatus } = req.body;

    const trainer = await Trainer.findOne({ userId: trainerUserId });
    if (!trainer) {
      res.status(404).json({ success: false, message: 'Trainer profile not found' });
      return;
    }

    if (availabilityStatus && ['Online', 'Offline', 'Busy'].includes(availabilityStatus)) {
      trainer.availabilityStatus = availabilityStatus;
    } else {
      trainer.availabilityStatus = trainer.availabilityStatus === 'Offline' ? 'Online' : 'Offline';
    }

    await trainer.save();
    res.status(200).json({ success: true, message: 'Availability status updated', trainer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
