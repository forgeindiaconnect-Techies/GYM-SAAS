import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Gym, { GymStatus } from '../models/Gym';
import User, { Role, ApprovalStatus } from '../models/User';

export const createGym = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name, gymType, logo, description, email, phone, website,
      address, city, state, pinCode,
      ownerFirstName, ownerLastName, ownerEmail, ownerPhone, createAdminAccount,
      subscriptionPlan, subscriptionStartDate, subscriptionEndDate, subscriptionStatus,
      status, memberCapacity, trainerCapacity, equipment
    } = req.body;

    if (!name || !gymType || !email || !phone || !address || !city || !state || !pinCode || !ownerFirstName || !ownerLastName || !ownerEmail || !ownerPhone || !subscriptionPlan || !subscriptionStartDate) {
      res.status(400).json({ success: false, message: 'Required fields missing', errorCode: 'MISSING_FIELDS' });
      return;
    }

    const existingGym = await Gym.findOne({ $or: [{ name }, { email }] });
    if (existingGym) {
      res.status(400).json({ success: false, message: 'Gym with this name or email already exists', errorCode: 'GYM_EXISTS' });
      return;
    }

    // 1. Create or find owner
    let ownerId;
    let existingOwner = await User.findOne({ email: ownerEmail });
    
    if (existingOwner) {
      ownerId = existingOwner._id;
      // Optionally upgrade their role if they are just a member
      if (existingOwner.role === Role.MEMBER) {
        existingOwner.role = Role.GYM_OWNER;
        await existingOwner.save();
      }
    } else if (createAdminAccount) {
      const defaultPassword = 'WelcomeGymAdmin123!';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(defaultPassword, salt);

      const newOwner = new User({
        firstName: ownerFirstName,
        lastName: ownerLastName,
        email: ownerEmail,
        mobile: ownerPhone,
        passwordHash,
        role: Role.GYM_OWNER,
        approvalStatus: ApprovalStatus.APPROVED,
        isActive: true
      });
      await newOwner.save();
      ownerId = newOwner._id;
    } else {
      // If we don't create an account, but the owner doesn't exist, this is an edge case
      // For now, we enforce creating an account or using an existing one.
      res.status(400).json({ success: false, message: 'Admin account must be created for a new gym if they do not exist.', errorCode: 'ADMIN_REQUIRED' });
      return;
    }

    // 2. Create the Gym
    const gym = new Gym({
      ownerId,
      name,
      gymType,
      logo,
      description,
      email,
      phone,
      website,
      subscription: {
        plan: subscriptionPlan,
        startDate: subscriptionStartDate,
        endDate: subscriptionEndDate,
        status: subscriptionStatus || 'Active'
      },
      location: {
        address,
        city,
        state,
        pinCode
      },
      memberCapacity,
      trainerCapacity,
      equipment,
      status: status || GymStatus.PENDING
    });

    await gym.save();

    // 3. Update the owner to reference this gym
    await User.findByIdAndUpdate(ownerId, { gymId: gym._id });

    res.status(201).json({
      success: true,
      message: 'Gym created successfully.',
      gym
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getGyms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    let filter: any = {};
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: 'DELETED' };
    }
    const gyms = await Gym.find(filter).populate('ownerId', 'firstName lastName email mobile').sort({ createdAt: -1 });
    res.status(200).json({ success: true, gyms });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getGymById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gym = await Gym.findById(id).populate('ownerId', 'firstName lastName email mobile');
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    res.status(200).json({ success: true, gym });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getMyGym = async (req: Request, res: Response): Promise<void> => {
  try {
    const userGymId = (req as any).user?.gymId;
    if (!userGymId) {
      res.status(404).json({ success: false, message: 'No gym assigned to this user' });
      return;
    }

    const gym = await Gym.findById(userGymId).populate('ownerId', 'firstName lastName email mobile');
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    res.status(200).json({ success: true, gym });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateGymStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    if (!Object.values(GymStatus).includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const gym = await Gym.findByIdAndUpdate(id, { status }, { new: true });
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const owner = await User.findById(gym.ownerId);
    if (owner) {
      owner.approvalStatus = status as any;
      if (status === 'REJECTED') {
        owner.rejectionReason = reason;
        owner.isActive = false;
      } else if (status === 'SUSPENDED') {
        (owner as any).suspensionReason = reason;
        owner.isActive = false;
      } else if (status === 'APPROVED') {
        owner.isActive = true;
        owner.rejectionReason = undefined;
        (owner as any).suspensionReason = undefined;
        // Start 1-day free trial
        owner.subscriptionStatus = 'TRIAL' as any;
        const oneDayMs = 24 * 60 * 60 * 1000;
        owner.subscriptionExpiry = new Date(Date.now() + oneDayMs);
      }
      await owner.save();
    }

    res.status(200).json({ success: true, message: 'Gym status updated', gym });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateGym = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name, gymType, logo, description, email, phone, website,
      address, city, state, pinCode,
      subscriptionPlan, subscriptionStartDate, subscriptionEndDate, subscriptionStatus,
      status, memberCapacity, trainerCapacity, equipment, subscriptionPlans
    } = req.body;

    const gym = await Gym.findById(id);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (gymType) updateData.gymType = gymType;
    if (logo !== undefined) updateData.logo = logo;
    if (description !== undefined) updateData.description = description;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (website !== undefined) updateData.website = website;
    if (memberCapacity !== undefined) updateData.memberCapacity = memberCapacity;
    if (trainerCapacity !== undefined) updateData.trainerCapacity = trainerCapacity;
    if (equipment) updateData.equipment = equipment;
    if (status) updateData.status = status;
    if (subscriptionPlans) updateData.subscriptionPlans = subscriptionPlans;

    if (address || city || state || pinCode) {
      updateData.location = {
        address: address || gym.location?.address,
        city: city || gym.location?.city,
        state: state || gym.location?.state,
        pinCode: pinCode || gym.location?.pinCode,
      };
    }

    if (subscriptionPlan || subscriptionStartDate || subscriptionEndDate || subscriptionStatus) {
      updateData.subscription = {
        plan: subscriptionPlan || gym.subscription?.plan,
        startDate: subscriptionStartDate || gym.subscription?.startDate,
        endDate: subscriptionEndDate || gym.subscription?.endDate,
        status: subscriptionStatus || gym.subscription?.status || 'Active',
      };
    }

    const updatedGym = await Gym.findByIdAndUpdate(id, { $set: updateData }, { new: true });

    res.status(200).json({ success: true, message: 'Gym updated successfully', gym: updatedGym });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const deleteGym = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gym = await Gym.findByIdAndUpdate(id, { status: 'DELETED' }, { new: true });
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    
    // Note: If you want to unlink the owner on delete, uncomment the next line
    // await User.findByIdAndUpdate(gym.ownerId, { $unset: { gymId: 1 } });
    
    res.status(200).json({ success: true, message: 'Gym deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getPublicGyms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city, pinCode, search, gymType } = req.query;
    // Show gyms that are ACTIVE, APPROVED, Active, or PENDING (for testing)
    let filter: any = { status: { $in: ['ACTIVE', 'APPROVED', 'Active', 'PENDING', 'Pending'] } };
    
    if (city) filter['location.city'] = { $regex: new RegExp(city as string, 'i') };
    if (pinCode) filter['location.pinCode'] = pinCode;
    if (gymType) filter.gymType = gymType;
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filter.$or = [
        { name: searchRegex },
        { 'location.city': searchRegex },
        { 'location.area': searchRegex },
        { 'location.state': searchRegex },
        { 'location.pinCode': searchRegex },
        { gymType: searchRegex },
      ];
    }

    const gyms = await Gym.find(filter).select('-subscription').sort({ createdAt: -1 });
    res.status(200).json({ success: true, gyms });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

import Branch from '../models/Branch';

export const getPublicGymById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gym = await Gym.findById(id).select('-subscription').populate('ownerId', 'firstName lastName email mobile subscriptionPlan');
    if (!gym || (gym.status !== GymStatus.ACTIVE && (gym.status as string) !== 'APPROVED')) {
      res.status(404).json({ success: false, message: 'Gym not found or not active' });
      return;
    }
    
    // Also fetch trainers for this gym
    const trainers = await User.find({ gymId: gym._id.toString(), role: 'TRAINER', isActive: true } as any).select('firstName lastName specialization experienceYears profilePhoto bio');

    // Fetch branches for this gym
    const branches = await Branch.find({ gymId: gym._id.toString(), isActive: true });

    res.status(200).json({ success: true, gym, trainers, branches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
