import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User, { Role, ApprovalStatus, SubscriptionStatus } from '../models/User';
import Gym, { GymStatus } from '../models/Gym';
import Trainer from '../models/Trainer';
import CustomerMembership, { CustomerMembershipStatus } from '../models/CustomerMembership';

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

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 1); // 1 Day Free Trial

    const user = new User({
      firstName,
      lastName,
      email,
      mobile,
      passwordHash,
      role: Role.MEMBER,
      approvalStatus: ApprovalStatus.PENDING,
      isActive: true,
      subscriptionStatus: gymId ? SubscriptionStatus.FREE_TRIAL : SubscriptionStatus.NONE,
      subscriptionPlan: gymId ? 'Free Trial' : undefined,
      subscriptionExpiry: gymId ? trialEndDate : undefined,
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

    if (gymId) {
      await CustomerMembership.create({
        userId: user._id,
        gymId,
        branchId,
        planName: 'Free Trial',
        duration: '1 Day',
        price: 0,
        discount: 0,
        finalAmount: 0,
        paymentMethod: 'Trial',
        status: CustomerMembershipStatus.FREE_TRIAL,
        startDate: new Date(),
        endDate: trialEndDate,
      });
    }

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
      city: city || undefined,
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
      operatingHours: operatingHours || undefined,
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

    if (user.approvalStatus === ApprovalStatus.DELETED) {
      res.status(403).json({ success: false, message: 'Your account has been deleted or deactivated. Please contact support.', errorCode: 'ACCOUNT_DELETED' });
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

    // Check subscription / plan expiration for ALL users (paid monthly, annual, free trial, etc.)
    const now = new Date();
    let isExpired = false;

    // 1. Direct user subscription expiry check
    if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) < now) {
      if (user.subscriptionStatus === SubscriptionStatus.FREE_TRIAL || user.subscriptionStatus === SubscriptionStatus.ACTIVE) {
        user.subscriptionStatus = SubscriptionStatus.EXPIRED;
        isExpired = true;
      }
    }
    if ((user as any).subscriptionExpiryDate && new Date((user as any).subscriptionExpiryDate) < now) {
      if (user.subscriptionStatus === SubscriptionStatus.FREE_TRIAL || user.subscriptionStatus === SubscriptionStatus.ACTIVE) {
        user.subscriptionStatus = SubscriptionStatus.EXPIRED;
        isExpired = true;
      }
    }

    // 2. Member CustomerMembership check
    if (user.role === Role.MEMBER) {
      const latestMembership = await CustomerMembership.findOne({ userId: user._id }).sort({ createdAt: -1 });
      if (latestMembership) {
        if (latestMembership.endDate && new Date(latestMembership.endDate) < now) {
          if (latestMembership.status === CustomerMembershipStatus.ACTIVE || latestMembership.status === CustomerMembershipStatus.FREE_TRIAL) {
            latestMembership.status = CustomerMembershipStatus.EXPIRED;
            await latestMembership.save();
          }
          user.subscriptionStatus = SubscriptionStatus.EXPIRED;
          isExpired = true;
        }
      }
    }

    // 3. Gym Owner / Admin Subscription check
    if (user.role === Role.GYM_OWNER || user.role === Role.ADMIN) {
      if (user.gymId) {
        const gym = await Gym.findById(user.gymId);
        if (gym?.subscription?.endDate && new Date(gym.subscription.endDate) < now) {
          gym.subscription.status = 'Expired';
          await gym.save();
          user.subscriptionStatus = SubscriptionStatus.EXPIRED;
          isExpired = true;
        }
      }
    }

    if (user.subscriptionStatus === SubscriptionStatus.EXPIRED) {
      isExpired = true;
    }

    user.lastLogin = new Date();
    await User.updateOne(
      { _id: user._id },
      { $set: { lastLogin: user.lastLogin, subscriptionStatus: user.subscriptionStatus } }
    );

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
      isSubscriptionCompleted: isExpired,
      subscriptionMessage: isExpired ? 'Your subscription plan is completed. Please upgrade your plan.' : undefined,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        phone: user.mobile,
        role: user.role,
        gymId: user.gymId,
        gymName,
        isActive: user.isActive,
        approvalStatus: user.approvalStatus,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionExpiry: user.subscriptionExpiry,
        subscriptionStartDate: (user as any).subscriptionStartDate,
        subscriptionExpiryDate: (user as any).subscriptionExpiryDate,
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
    
    // Check subscription / plan expiration for ALL users (paid monthly, annual, free trial, etc.)
    const now = new Date();
    let isExpired = false;

    if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) < now) {
      if (user.subscriptionStatus === SubscriptionStatus.FREE_TRIAL || user.subscriptionStatus === SubscriptionStatus.ACTIVE) {
        user.subscriptionStatus = SubscriptionStatus.EXPIRED;
        isExpired = true;
      }
    }
    if ((user as any).subscriptionExpiryDate && new Date((user as any).subscriptionExpiryDate) < now) {
      if (user.subscriptionStatus === SubscriptionStatus.FREE_TRIAL || user.subscriptionStatus === SubscriptionStatus.ACTIVE) {
        user.subscriptionStatus = SubscriptionStatus.EXPIRED;
        isExpired = true;
      }
    }

    if (user.role === Role.MEMBER) {
      const latestMembership = await CustomerMembership.findOne({ userId: user._id }).sort({ createdAt: -1 });
      if (latestMembership) {
        if (latestMembership.endDate && new Date(latestMembership.endDate) < now) {
          if (latestMembership.status === CustomerMembershipStatus.ACTIVE || latestMembership.status === CustomerMembershipStatus.FREE_TRIAL) {
            latestMembership.status = CustomerMembershipStatus.EXPIRED;
            await latestMembership.save();
          }
          user.subscriptionStatus = SubscriptionStatus.EXPIRED;
          isExpired = true;
        }
      }
    }

    if (user.role === Role.GYM_OWNER || user.role === Role.ADMIN) {
      if (user.gymId) {
        const gym = await Gym.findById(user.gymId);
        if (gym?.subscription?.endDate && new Date(gym.subscription.endDate) < now) {
          gym.subscription.status = 'Expired';
          await gym.save();
          user.subscriptionStatus = SubscriptionStatus.EXPIRED;
          isExpired = true;
        }
      }
    }

    if (isExpired || user.subscriptionStatus === SubscriptionStatus.EXPIRED) {
      await user.save();
    }
    
    const userObj = user.toObject();
    (userObj as any).phone = user.mobile;
    (userObj as any).id = user._id;

    res.status(200).json({ 
      success: true, 
      user: userObj, 
      isSubscriptionCompleted: isExpired || user.subscriptionStatus === SubscriptionStatus.EXPIRED,
      subscriptionMessage: (isExpired || user.subscriptionStatus === SubscriptionStatus.EXPIRED) 
        ? 'Your subscription plan is completed. Please upgrade your plan.' 
        : undefined
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
