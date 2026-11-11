import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User, { Role, ApprovalStatus } from '../models/User';
import Trainer from '../models/Trainer';
import TrainerFee from '../models/TrainerFee';
import TrainerInvitation from '../models/TrainerInvitation';
import Gym from '../models/Gym';
import JobApplication from '../models/JobApplication';
import mongoose from 'mongoose';
import TrainerSession from '../models/TrainerSession';
import WorkoutPlan from '../models/WorkoutPlan';
import TrainerPlanRequest from '../models/TrainerPlanRequest';
import TrainerPayment from '../models/TrainerPayment';
import DirectMessage from '../models/DirectMessage';
import Notification from '../models/Notification';
import {
  generateUniqueTrainerId,
  normalizeTrainerStatus,
  resolveTrainerContext,
  getTrainerAssignedCustomerIds,
} from '../utils/trainerIsolation';

const isAuthorizedStaff = (role?: string) => {
  const r = (role || '').toUpperCase().trim();
  return ['GYM_OWNER', 'GYM_MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(r);
};

const resolveGymId = async (req: AuthRequest): Promise<string | undefined> => {
  if (req.user?.gymId) return req.user.gymId.toString();
  if (req.query.gymId) return req.query.gymId as string;
  if (req.user?.id) {
    const gymByOwner = await Gym.findOne({ ownerId: req.user.id });
    if (gymByOwner) return gymByOwner._id.toString();
  }
  const gym = await Gym.findOne({ status: 'ACTIVE' } as any) || await Gym.findOne().sort({ createdAt: -1 });
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
      fee, paymentType, status, availableDays, availableStartTime, availableEndTime, availableSlot, password, branchId,
      firstName: rawFirstName, lastName: rawLastName, mobile: rawMobile, experienceYears, salary, qualification
    } = req.body;

    const effectiveName = (name || `${rawFirstName || ''} ${rawLastName || ''}`).trim();
    const effectiveEmail = (email || '').trim().toLowerCase();
    const effectivePhone = (phone || rawMobile || '').trim();
    const effectiveSpecialization = specialization || req.body.role || 'Fitness Trainer';
    let effectiveMode = trainingMode || 'both';

    if (!effectiveName || !effectiveEmail || !effectivePhone) {
      res.status(400).json({ success: false, message: 'Trainer Name, Email, and Phone are required' });
      return;
    }

    // Ensure the gym exists or resolve fallback
    const gym = await Gym.findById(resolvedGymId);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    // Adapt training mode if gym does not support specified mode
    if (gym.trainingMode !== 'both' && effectiveMode !== 'both' && gym.trainingMode !== effectiveMode) {
      effectiveMode = gym.trainingMode || 'both';
    }

    // Safe numerical parsing for experience & fee to prevent Mongoose cast errors
    const parsedExperience = typeof experience === 'number'
      ? experience
      : parseInt(String(experience || experienceYears || '0').replace(/[^0-9]/g, ''), 10) || 0;

    const parsedFee = typeof fee === 'number'
      ? fee
      : parseFloat(String(fee || salary || '0').replace(/[^0-9.]/g, '')) || 0;

    const effectiveQualifications = qualifications || qualification || '';

    // Check if user already exists
    let existingUser = await User.findOne({ email: effectiveEmail });
    let userId: any;
    const normalizedStatus = normalizeTrainerStatus(status) || 'Active';

    if (existingUser) {
      if (existingUser.role !== Role.TRAINER) {
        res.status(400).json({
          success: false,
          message: `This email is already registered under a ${existingUser.role} account and cannot be duplicated as a trainer.`,
        });
        return;
      }

      userId = existingUser._id;
      // Avoid overwriting another gym's trainer record: scope check strictly by (userId/email, resolvedGymId)
      const duplicateInGym = await Trainer.findOne({
        gymId: resolvedGymId,
        $or: [{ userId: existingUser._id }, { email: effectiveEmail }],
      });

      if (duplicateInGym) {
        res.status(409).json({
          success: false,
          message: `Trainer with email ${effectiveEmail} already exists in this gym (${duplicateInGym.trainerId || duplicateInGym._id}).`,
        });
        return;
      }

      if (!existingUser.gymId && resolvedGymId) {
        existingUser.gymId = resolvedGymId as any;
        await existingUser.save();
      }
    } else {
      // Create new user account for trainer
      const defaultPassword = password || 'WelcomeTrainer123!';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(defaultPassword, salt);

      const [firstName, ...lastNames] = effectiveName.split(' ');
      const lastName = lastNames.join(' ') || ' ';

      const user = new User({
        firstName: rawFirstName || firstName,
        lastName: rawLastName || lastName,
        email: effectiveEmail,
        mobile: effectivePhone,
        passwordHash,
        role: Role.TRAINER,
        gymId: resolvedGymId,
        isActive: normalizedStatus === 'Active',
        approvalStatus:
          normalizedStatus === 'Pending'
            ? ApprovalStatus.PENDING
            : normalizedStatus === 'Inactive' || normalizedStatus === 'Suspended'
            ? ApprovalStatus.SUSPENDED
            : ApprovalStatus.APPROVED
      });

      await user.save();
      userId = user._id;
    }

    const uniqueTrainerCode = await generateUniqueTrainerId();

    const trainer = new Trainer({
      trainerId: uniqueTrainerCode,
      gymId: resolvedGymId,
      branchId: branchId && branchId !== 'main' ? branchId : undefined,
      userId,
      name: effectiveName,
      email: effectiveEmail,
      phone: effectivePhone,
      profilePhoto,
      specialization: effectiveSpecialization,
      experience: parsedExperience,
      trainingMode: effectiveMode,
      qualifications: effectiveQualifications,
      certifications: certifications || '',
      expertise: expertise || effectiveSpecialization,
      bio: bio || '',
      availableDays: availableDays || 'Monday to Friday',
      availableStartTime: availableStartTime || '06:00 AM',
      availableEndTime: availableEndTime || '08:00 PM',
      availableSlot: availableSlot || 10,
      fee: parsedFee,
      paymentType: paymentType || 'Per Month',
      status: normalizedStatus,
      averageRating: 0,
      totalReviews: 0
    });

    await trainer.save();

    if (parsedFee > 0) {
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
          trainingType: modeMap[effectiveMode] || 'Offline Training',
          feeAmount: parsedFee,
          billingCycle: cycleMap[paymentType || 'Per Month'] || 'Monthly',
          effectiveFrom: new Date(),
          paymentMethod: 'Bank Transfer',
          status: 'Active',
          notes: `Configured during trainer onboarding (${effectiveSpecialization})`,
          createdBy: (gymOwner as any).id || (gymOwner as any)._id
        });
      } catch (feeErr) {
        console.error('Error auto-creating TrainerFee in manualAddTrainer:', feeErr);
      }
    }

    res.status(201).json({ success: true, message: 'Trainer hired and added to gym roster successfully!', trainer });
  } catch (error: any) {
    console.error('Error in manualAddTrainer:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error', error: error.message });
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

    const uniqueTrainerCode = await generateUniqueTrainerId();
    const trainer = new Trainer({
      trainerId: uniqueTrainerCode,
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
      status: 'Pending',
      averageRating: 0,
      totalReviews: 0
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
    const branchIdQuery = req.query.branchId as string;
    const effectiveBranchId = gymOwner.branchId || branchIdQuery;

    // Sync any registered trainer applicants for this gym so they appear in Gym Owner's trainers directory
    if (resolvedGymId) {
      try {
        const gymApps = await JobApplication.find({ gymId: resolvedGymId });
        for (const app of gymApps) {
          const filter: any = {};
          if (app.trainerId) {
            filter.$or = [{ userId: app.trainerId }, { email: app.email.toLowerCase() }];
          } else {
            filter.email = app.email.toLowerCase();
          }

          let trainer = await Trainer.findOne(filter);
          if (trainer) {
            let needsSave = false;
            if (!trainer.gymId) {
              trainer.gymId = new mongoose.Types.ObjectId(resolvedGymId);
              needsSave = true;
            }
            if (!trainer.phone && app.phone) {
              trainer.phone = app.phone;
              needsSave = true;
            }
            if (!trainer.specialization && app.expertise?.length) {
              trainer.specialization = app.expertise[0];
              needsSave = true;
            }
            if (!trainer.experience && app.workExperience) {
              trainer.experience = parseInt(app.workExperience, 10) || 1;
              needsSave = true;
            }
            if (!trainer.expectedSalary && app.expectedSalary) {
              const num = Number(String(app.expectedSalary).replace(/[^0-9]/g, ''));
              if (num) {
                trainer.expectedSalary = num;
                needsSave = true;
              }
            }
            if (!trainer.resumeUrl && app.resumeUrl) {
              trainer.resumeUrl = app.resumeUrl;
              needsSave = true;
            }
            if (!trainer.qualifications && app.qualifications) {
              trainer.qualifications = app.qualifications;
              needsSave = true;
            }
            if (!trainer.certifications && app.certifications) {
              trainer.certifications = app.certifications;
              needsSave = true;
            }
            if (!trainer.status || trainer.status === 'Pending') {
              trainer.status = 'Active';
              needsSave = true;
            }
            if (needsSave) {
              await trainer.save();
            }
          } else {
            const numericExp = parseInt(app.workExperience, 10) || 1;
            const expectedNum = app.expectedSalary ? Number(String(app.expectedSalary).replace(/[^0-9]/g, '')) || undefined : undefined;
            trainer = new Trainer({
              userId: app.trainerId || new mongoose.Types.ObjectId(),
              gymId: new mongoose.Types.ObjectId(resolvedGymId),
              name: app.name,
              email: app.email.toLowerCase(),
              phone: app.phone || '',
              profilePhoto: app.profilePhoto || '',
              specialization: app.expertise?.[0] || 'Nutrition Coaching',
              experience: numericExp,
              trainingMode: 'both',
              qualifications: app.qualifications || '',
              certifications: app.certifications || '',
              expertise: app.expertise?.join(', ') || 'Nutrition Coaching',
              expectedSalary: expectedNum,
              preferredLocation: app.preferredLocation || '',
              availability: app.availability || 'Immediately',
              resumeUrl: app.resumeUrl || '',
              status: 'Active',
              isPublicRecruitment: true
            });
            await trainer.save();
          }
        }
      } catch (syncErr) {
        console.warn('Error syncing applicant trainers to gym:', syncErr);
      }
    }

    let query: any = resolvedGymId ? { gymId: resolvedGymId } : {};
    if (effectiveBranchId && effectiveBranchId !== 'undefined' && effectiveBranchId !== 'null' && effectiveBranchId !== 'all') {
      if (effectiveBranchId === 'main') {
        query.$or = [
          { branchId: { $exists: false } },
          { branchId: null }
        ];
      } else if (mongoose.Types.ObjectId.isValid(effectiveBranchId as string)) {
        query.branchId = effectiveBranchId;
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

    const role = (req.user?.role || '').toUpperCase();
    if (role === 'TRAINER') {
      if (String(trainer.userId) !== String(req.user?.id)) {
        res.status(403).json({ success: false, message: 'Unauthorized: cannot access another trainer profile' });
        return;
      }
    } else if (role === 'GYM_OWNER' || role === 'GYM_MANAGER') {
      const ownerGymId = req.user?.gymId || (await resolveGymId(req));
      if (ownerGymId && trainer.gymId && String(trainer.gymId) !== String(ownerGymId)) {
        res.status(403).json({ success: false, message: 'Unauthorized: trainer belongs to another gym' });
        return;
      }
    } else if (role === 'MEMBER') {
      const userGymId = req.user?.gymId;
      if (!userGymId || !trainer.gymId || String(trainer.gymId) !== String(userGymId)) {
        res.status(403).json({ success: false, message: 'Unauthorized: trainer does not belong to your selected gym' });
        return;
      }
      if (trainer.status !== 'Active') {
        res.status(404).json({ success: false, message: 'Trainer not available' });
        return;
      }
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
    const normalizedStatus = normalizeTrainerStatus(status);
    if (!normalizedStatus) {
      res.status(400).json({ success: false, message: 'Invalid trainer status' });
      return;
    }

    const resolvedGymId = (await resolveGymId(req)) || gymOwner.gymId;
    const trainerQuery: any = { _id: id };
    if (resolvedGymId) trainerQuery.gymId = resolvedGymId;

    const trainer = await Trainer.findOne(trainerQuery);
    if (!trainer) {
      res.status(404).json({ success: false, message: 'Trainer not found' });
      return;
    }

    trainer.status = normalizedStatus;
    if (!trainer.trainerId) {
      trainer.trainerId = await generateUniqueTrainerId();
    }
    await trainer.save();

    // Sync with User model (only overwrite if user has no active profile in another gym)
    const user = await User.findById(trainer.userId);
    if (user) {
      if (normalizedStatus === 'Active') {
        user.isActive = true;
        user.approvalStatus = ApprovalStatus.APPROVED;
      } else {
        const otherActiveGymProfile = await Trainer.exists({
          userId: trainer.userId,
          _id: { $ne: trainer._id },
          status: 'Active',
        });
        if (!otherActiveGymProfile) {
          if (normalizedStatus === 'Pending') {
            user.isActive = false;
            user.approvalStatus = ApprovalStatus.PENDING;
          } else if (normalizedStatus === 'Rejected') {
            user.isActive = false;
            user.approvalStatus = ApprovalStatus.REJECTED;
            user.rejectionReason = reason;
          } else if (normalizedStatus === 'Suspended' || normalizedStatus === 'Inactive') {
            user.isActive = false;
            user.approvalStatus = ApprovalStatus.SUSPENDED;
            (user as any).suspensionReason = reason || normalizedStatus;
          }
        }
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
    const role = String(req.user?.role || '').toUpperCase();
    const gymId = role === 'MEMBER'
      ? req.user?.gymId
      : (req.user?.gymId || (await resolveGymId(req)));

    if (role === 'MEMBER' && !gymId) {
      res.status(200).json({
        success: true,
        trainers: [],
        message: 'Please select a gym first to view available trainers.'
      });
      return;
    }

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

// 13. Trainer Dashboard Summary (strictly scoped by trainerId + gymId, real DB records only)
export const getTrainerDashboardSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requestedGymId = (req.query.gymId as string) || (req.headers['x-gym-id'] as string);
    const ctx = await resolveTrainerContext(req.user, { requestedGymId });
    if (!ctx) {
      res.status(403).json({ success: false, message: 'Active trainer context required' });
      return;
    }

    const gymObjectId = new mongoose.Types.ObjectId(ctx.gymId);
    const assignedCustomerIds = await getTrainerAssignedCustomerIds(ctx);

    const [
      activeClientsCount,
      upcomingSessionsCount,
      completedSessionsCount,
      workoutPlansCount,
      approvedWorkoutRequestsCount,
      dietPlansCount,
      ratedSessions,
      messagesCount,
      unreadMessagesCount,
      notificationsCount,
      unreadNotificationsCount,
      gymDoc,
      paidPayments,
      completedSessionEarnings,
    ] = await Promise.all([
      assignedCustomerIds.length > 0
        ? User.countDocuments({
            _id: { $in: assignedCustomerIds },
            gymId: gymObjectId,
            role: Role.MEMBER,
            isActive: { $ne: false },
            approvalStatus: { $ne: ApprovalStatus.DELETED },
          } as any)
        : Promise.resolve(0),
      TrainerSession.countDocuments({
        gymId: gymObjectId,
        trainerId: { $in: ctx.trainerObjectIds },
        status: {
          $in: [
            'Pending',
            'Awaiting Payment',
            'Confirmed',
            'Upcoming',
            'In Progress',
            'Reschedule Requested',
            'Rescheduled',
          ] as any,
        },
      }),
      TrainerSession.countDocuments({
        gymId: gymObjectId,
        trainerId: { $in: ctx.trainerObjectIds },
        status: 'Completed' as any,
      }),
      WorkoutPlan.countDocuments({
        gymId: gymObjectId,
        trainerId: { $in: ctx.trainerObjectIds },
      }),
      TrainerPlanRequest.countDocuments({
        gymId: gymObjectId,
        trainerId: { $in: ctx.trainerObjectIds },
        planType: 'Workout Plan',
        status: 'Approved',
      }),
      TrainerPlanRequest.countDocuments({
        gymId: gymObjectId,
        trainerId: { $in: ctx.trainerObjectIds },
        planType: 'Diet Plan',
        status: { $in: ['Pending', 'Approved'] },
      }),
      TrainerSession.find({
        gymId: gymObjectId,
        trainerId: { $in: ctx.trainerObjectIds },
        customerRating: { $exists: true, $gt: 0 },
      })
        .select('customerRating customerReview customerId createdAt date')
        .lean(),
      DirectMessage.countDocuments({
        $or: [{ senderId: ctx.user._id }, { receiverId: ctx.user._id }],
      }),
      DirectMessage.countDocuments({
        receiverId: ctx.user._id,
        read: false,
      }),
      Notification.countDocuments({
        gymId: gymObjectId,
        recipientId: { $in: ctx.trainerObjectIds },
      }),
      Notification.countDocuments({
        gymId: gymObjectId,
        recipientId: { $in: ctx.trainerObjectIds },
        isRead: false,
      }),
      Gym.findById(gymObjectId).select('name').lean(),
      TrainerPayment.aggregate([
        {
          $match: {
            gymId: gymObjectId,
            trainerId: new mongoose.Types.ObjectId(ctx.trainerDocId),
            paymentStatus: 'Paid',
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      TrainerSession.aggregate([
        {
          $match: {
            gymId: gymObjectId,
            trainerId: { $in: ctx.trainerObjectIds },
            status: 'Completed',
            paymentStatus: 'Paid',
          },
        },
        { $group: { _id: null, total: { $sum: '$fee' } } },
      ]),
    ]);

    const reviewsCount = ratedSessions.length;
    const averageRating =
      reviewsCount > 0
        ? Number((ratedSessions.reduce((sum: number, s: any) => sum + Number(s.customerRating || 0), 0) / reviewsCount).toFixed(1))
        : 0;

    const paidTotal = Number(paidPayments?.[0]?.total || 0);
    const sessionTotal = Number(completedSessionEarnings?.[0]?.total || 0);
    const trainerTotalEarnings = Math.max(Number(ctx.trainer.totalEarnings || 0), paidTotal + sessionTotal);

    // Lazy backfill trainerId if older record lacked one
    let trainerCode = ctx.trainerCode;
    if (!trainerCode) {
      trainerCode = await generateUniqueTrainerId();
      await Trainer.updateOne({ _id: ctx.trainer._id }, { $set: { trainerId: trainerCode } });
    }

    res.status(200).json({
      success: true,
      trainer: {
        id: ctx.trainerDocId,
        trainerId: trainerCode,
        userId: ctx.userId,
        name: ctx.trainer.name,
        email: ctx.trainer.email,
        specialization: ctx.trainer.specialization,
        status: ctx.trainer.status,
        gymId: ctx.gymId,
        gymName: (gymDoc as any)?.name || '',
      },
      summary: {
        totalClients: assignedCustomerIds.length,
        activeClients: activeClientsCount,
        upcomingSessions: upcomingSessionsCount,
        completedSessions: completedSessionsCount,
        earnings: trainerTotalEarnings,
        availableBalance: Number(ctx.trainer.availableBalance || 0),
        workoutPlansCount: workoutPlansCount > 0 ? workoutPlansCount : approvedWorkoutRequestsCount,
        dietPlansCount,
        reviewsCount,
        averageRating,
        messagesCount,
        unreadMessagesCount,
        notificationsCount,
        unreadNotificationsCount,
      },
    });
  } catch (error: any) {
    console.error('Error in getTrainerDashboardSummary:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 14. Assigned Clients List for Logged-In Trainer (strictly isolated by trainerId + gymId)
export const getMyAssignedClients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requestedGymId = (req.query.gymId as string) || (req.headers['x-gym-id'] as string);
    const ctx = await resolveTrainerContext(req.user, { requestedGymId });
    if (!ctx) {
      res.status(403).json({ success: false, message: 'Active trainer context required' });
      return;
    }

    const assignedIds = await getTrainerAssignedCustomerIds(ctx);
    if (assignedIds.length === 0) {
      res.status(200).json({ success: true, clients: [] });
      return;
    }

    const gymObjectId = new mongoose.Types.ObjectId(ctx.gymId);
    const [members, sessions] = await Promise.all([
      User.find({
        _id: { $in: assignedIds },
        gymId: gymObjectId,
        role: Role.MEMBER,
        approvalStatus: { $ne: ApprovalStatus.DELETED },
      } as any)
        .select('firstName lastName email mobile profilePhoto fitnessGoal subscriptionStatus subscriptionPlan isActive assignedTrainer createdAt')
        .sort({ firstName: 1 })
        .lean(),
      TrainerSession.find({
        gymId: gymObjectId,
        trainerId: { $in: ctx.trainerObjectIds },
        customerId: { $in: assignedIds },
      })
        .select('customerId sessionDate status createdAt')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const sessionStatsMap = new Map<string, { total: number; completed: number; upcoming: number; lastDate?: string }>();
    sessions.forEach((s: any) => {
      const cid = String(s.customerId);
      const curr = sessionStatsMap.get(cid) || { total: 0, completed: 0, upcoming: 0 };
      curr.total += 1;
      if (s.status === 'Completed') curr.completed += 1;
      if (['Pending', 'Accepted', 'Confirmed', 'Paid'].includes(s.status)) curr.upcoming += 1;
      if (!curr.lastDate) curr.lastDate = s.sessionDate || (s.createdAt ? new Date(s.createdAt).toISOString() : undefined);
      sessionStatsMap.set(cid, curr);
    });

    const clients = members.map((m: any) => {
      const sStats = sessionStatsMap.get(String(m._id)) || { total: 0, completed: 0, upcoming: 0 };
      return {
        id: String(m._id),
        _id: m._id,
        firstName: m.firstName,
        lastName: m.lastName,
        name: `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email,
        email: m.email,
        phone: m.mobile || '',
        mobile: m.mobile || '',
        profilePhoto: m.profilePhoto || '',
        goal: m.fitnessGoal || 'General Fitness',
        subscriptionPlan: m.subscriptionPlan || 'Member',
        subscriptionStatus: m.subscriptionStatus || 'Active',
        isActive: m.isActive !== false,
        directlyAssigned: Boolean(m.assignedTrainer && ctx.trainerIdStrings.includes(String(m.assignedTrainer))),
        totalSessions: sStats.total,
        completedSessions: sStats.completed,
        upcomingSessions: sStats.upcoming,
        lastSession: sStats.lastDate || null,
        createdAt: m.createdAt,
      };
    });

    res.status(200).json({ success: true, clients });
  } catch (error: any) {
    console.error('Error in getMyAssignedClients:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
