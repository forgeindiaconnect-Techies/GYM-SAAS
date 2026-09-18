import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User, { Role, ApprovalStatus, SubscriptionStatus } from '../models/User';
import Gym, { GymStatus } from '../models/Gym';
import Trainer from '../models/Trainer';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      firstName, lastName, email, mobile, password,
      dateOfBirth, gender, city, pinCode,
      fitnessGoal, experienceLevel, preferredTraining, preferredWorkoutTime,
      height, weight,
      emergencyContact, gymId, branchId
    } = req.body;

    if (!firstName || !lastName || !email || !mobile || !password) {
      res.status(400).json({ success: false, message: 'Required fields missing', errorCode: 'MISSING_FIELDS' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email already in use', errorCode: 'EMAIL_IN_USE' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      firstName,
      lastName,
      email,
      mobile,
      passwordHash,
      role: Role.MEMBER,
      approvalStatus: ApprovalStatus.PENDING,
      isActive: true,
      subscriptionStatus: SubscriptionStatus.NONE,
      customerType: 'PUBLIC_SIGNUP',
      gymId,
      branchId,
      dateOfBirth,
      gender,
      city,
      pinCode,
      fitnessGoal,
      experienceLevel,
      preferredTraining,
      preferredWorkoutTime,
      height,
      weight,
      emergencyContact,
    });

    await user.save();

    const payload = {
      id: user._id,
      role: user.role,
      gymId: user.gymId,
      approvalStatus: user.approvalStatus,
      subscriptionStatus: user.subscriptionStatus,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        gymId: user.gymId,
        approvalStatus: user.approvalStatus,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const registerGymOwner = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      firstName, lastName, email, mobile, password,
      gymName, gymType, gymEmail, gymContactNumber, 
      address, city, state, pinCode, 
      approxMembers, numTrainers, operatingHours,
      trainingMode, services,
      subscriptionPlans, equipment, acDetails, facilities, offers,
      rating, reviewCount, logo, images
    } = req.body;

    if (!firstName || !lastName || !email || !mobile || !password || !gymName || !gymType || !address || !city) {
      res.status(400).json({ success: false, message: 'Required fields missing', errorCode: 'MISSING_FIELDS' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email already in use', errorCode: 'EMAIL_IN_USE' });
      return;
    }

    const existingGym = await Gym.findOne({ $or: [{ name: gymName }] });
    if (existingGym) {
      res.status(400).json({ success: false, message: 'Gym with this name already exists', errorCode: 'GYM_EXISTS' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      firstName,
      lastName,
      email,
      mobile,
      passwordHash,
      role: Role.GYM_OWNER,
      approvalStatus: ApprovalStatus.PENDING,
      subscriptionStatus: SubscriptionStatus.NONE,
      isActive: true,
    });
    
    await user.save();

    const gym = new Gym({
      ownerId: user._id,
      name: gymName,
      gymType,
      logo: logo || undefined,
      images: images || [],
      email: gymEmail || email,
      phone: gymContactNumber || mobile,
      location: {
        address,
        city,
        state,
        pinCode
      },
      status: GymStatus.PENDING,
      memberCapacity: approxMembers,
      trainerCapacity: numTrainers,
      trainingMode: trainingMode || 'offline',
      services: services || [],
      subscriptionPlans: subscriptionPlans || [],
      equipment: equipment || [],
      acDetails: acDetails || undefined,
      facilities: facilities || [],
      offers: offers || [],
      rating: rating ? Number(rating) : undefined,
      reviewCount: reviewCount ? Number(reviewCount) : undefined,
    });

    await gym.save();

    user.gymId = gym._id as any;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Gym Owner registration successful. Pending Admin approval.',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required', errorCode: 'MISSING_FIELDS' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials', errorCode: 'INVALID_CREDENTIALS' });
      return;
    }

    if (!user.isActive) {
      const reason = user.suspensionReason || 'suspended';
      res.status(403).json({ success: false, message: `Your account is ${reason}`, errorCode: 'ACCOUNT_SUSPENDED' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials', errorCode: 'INVALID_CREDENTIALS' });
      return;
    }

    // Check Trainer Status
    if (user.role === Role.TRAINER) {
      const trainer = await Trainer.findOne({ userId: user._id });
      if (trainer && trainer.status !== 'Active') {
        res.status(403).json({ success: false, message: `Your account is ${trainer.status}`, errorCode: 'ACCOUNT_SUSPENDED' });
        return;
      }
    }

    // Check trial expiration
    if (user.subscriptionStatus === SubscriptionStatus.TRIAL && user.subscriptionExpiry) {
      if (new Date(user.subscriptionExpiry) < new Date()) {
        user.subscriptionStatus = SubscriptionStatus.EXPIRED;
        await user.save();
      }
    }

    const payload = {
      id: user._id,
      role: user.role,
      gymId: user.gymId,
      approvalStatus: user.approvalStatus,
      subscriptionStatus: user.subscriptionStatus,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    // Fetch gym name if the user is a gym owner
    let gymName: string | undefined;
    if (user.gymId) {
      const gym = await Gym.findById(user.gymId).select('name');
      gymName = gym?.name;
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        gymId: user.gymId,
        gymName,
        approvalStatus: user.approvalStatus,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        rejectionReason: user.rejectionReason,
        suspensionReason: user.suspensionReason,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    
    // Check trial expiration
    if (user.subscriptionStatus === SubscriptionStatus.TRIAL && user.subscriptionExpiry) {
      if (new Date(user.subscriptionExpiry) < new Date()) {
        user.subscriptionStatus = SubscriptionStatus.EXPIRED;
        await user.save();
      }
    }
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
