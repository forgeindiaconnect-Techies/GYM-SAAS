import { Request, Response } from 'express';
import Branch from '../models/Branch';
import Gym, { GymStatus } from '../models/Gym';
import User, { Role } from '../models/User';
import mongoose from 'mongoose';

const PLAN_BRANCH_LIMITS: Record<string, number> = {
  FREE_TRIAL: 1,
  SILVER: 1,
  GOLD: 2,
  PREMIUM: 5
};

export const createBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== Role.GYM_OWNER) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const gymId = user.gymId;
    if (!gymId) {
      res.status(400).json({ success: false, message: 'No gym associated with this owner.' });
      return;
    }

    const gym = await Gym.findById(gymId);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found.' });
      return;
    }

    // Check Subscription Limit
    const userDoc = await User.findById(user._id || user.id);
    const currentPlan = userDoc?.subscriptionPlan || gym.subscription?.plan || 'FREE_TRIAL';
    const limit = PLAN_BRANCH_LIMITS[currentPlan] || 1;
    
    // Get existing branches count + 1 (the main gym counts as 1 location basically, but in our logic the branches are the separate entities. Wait, if gym is 1, and limit is 1, they can't create ANY branches. If limit is 2, they can create 1 branch. So max branches allowed = limit - 1. Or maybe the limit is the number of extra branches? Let's check prompt: Gold plan limit 2, if current branches = 1, can add. So max branches = limit.)
    const existingCount = await Branch.countDocuments({ gymId });
    if (existingCount + 1 >= limit) {
       res.status(403).json({ success: false, message: `You have reached your branch limit (${limit}) on the ${currentPlan} plan.` });
       return;
    }

    const { branchName, branchCode, phone, email, managerId, location, operatingHours, trainingMode, services, facilities, images, memberCapacity, trainerCapacity } = req.body;

    // Validate Branch Code Uniqueness
    const existingBranch = await Branch.findOne({ gymId, branchCode });
    if (existingBranch) {
      res.status(400).json({ success: false, message: 'Branch code must be unique within your gym.' });
      return;
    }

    // Validate Training Mode
    if (gym.trainingMode !== 'both' && trainingMode !== 'both' && trainingMode !== gym.trainingMode) {
      res.status(400).json({ success: false, message: `Branch training mode (${trainingMode}) cannot exceed gym's supported mode (${gym.trainingMode}).` });
      return;
    }

    const branch = new Branch({
      gymId,
      branchName,
      branchCode,
      phone,
      email,
      managerId: managerId || null,
      location,
      operatingHours,
      trainingMode,
      services,
      facilities,
      images,
      memberCapacity,
      trainerCapacity,
      status: GymStatus.ACTIVE,
    });

    await branch.save();

    res.status(201).json({ success: true, message: 'Branch created successfully', branch });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getBranches = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || !user.gymId) {
      res.status(400).json({ success: false, message: 'No gym associated' });
      return;
    }

    const branches = await Branch.find({ gymId: user.gymId }).populate('managerId', 'firstName lastName email phone').sort({ createdAt: -1 });
    res.status(200).json({ success: true, branches });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getBranchById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const branch = await Branch.findOne({ _id: id, gymId: req.user?.gymId }).populate('managerId', 'firstName lastName email phone');
    if (!branch) {
      res.status(404).json({ success: false, message: 'Branch not found' });
      return;
    }
    res.status(200).json({ success: true, branch });
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const branch = await Branch.findOneAndUpdate({ _id: id, gymId: req.user?.gymId }, updateData, { new: true });
    if (!branch) {
      res.status(404).json({ success: false, message: 'Branch not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Branch updated', branch });
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateBranchStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const branch = await Branch.findOneAndUpdate({ _id: id, gymId: req.user?.gymId }, { status }, { new: true });
    if (!branch) {
      res.status(404).json({ success: false, message: 'Branch not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Branch status updated', branch });
  } catch (error) {
    console.error('Error updating branch status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const branch = await Branch.findOneAndDelete({ _id: id, gymId: req.user?.gymId });
    if (!branch) {
      res.status(404).json({ success: false, message: 'Branch not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Branch deleted' });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
