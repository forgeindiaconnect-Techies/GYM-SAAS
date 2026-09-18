import { Request, Response } from 'express';
import User, { Role } from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import Gym from '../models/Gym';

export const getUsersByRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, status, gymId } = req.query;
    
    let filter: any = {};
    if (role) {
      filter.role = role as string;
    }
    if (status) {
      filter.approvalStatus = status;
    } else {
      filter.approvalStatus = { $ne: 'DELETED' };
    }

    // Role-based filtering
    if (req.user?.role === 'GYM_OWNER' || req.user?.role === 'GYM_MANAGER') {
      filter.gymId = req.user.gymId;
    } else if (req.user?.role === 'SUPER_ADMIN' && gymId) {
      filter.gymId = gymId;
    }

    const users = await User.find(filter)
      .populate('gymId', 'name')
      .populate('branchId', 'name')
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.approvalStatus = status;
    if (status === 'REJECTED') {
      user.rejectionReason = reason;
      user.isActive = false;
    } else if (status === 'SUSPENDED') {
      (user as any).suspensionReason = reason;
      user.isActive = false;
    } else if (status === 'APPROVED') {
      user.isActive = true;
      user.rejectionReason = undefined;
      (user as any).suspensionReason = undefined;
    }
    await user.save();
    
    // Sync gym status whenever user (gym owner) status changes
    if (user.role === 'GYM_OWNER' && user.gymId) {
      let gymStatus: string;
      if (status === 'APPROVED') gymStatus = 'ACTIVE';
      else if (status === 'SUSPENDED') gymStatus = 'SUSPENDED';
      else if (status === 'REJECTED') gymStatus = 'INACTIVE';
      else gymStatus = 'PENDING'; // PENDING or other
      
      await Gym.findByIdAndUpdate(user.gymId, { status: gymStatus });
    }
    
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { gymData, ...updateData } = req.body;
    
    let user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (gymData && user.gymId) {
      // Handle nested location data correctly if provided
      const updateGymObj: any = { ...gymData };
      if (gymData.location) {
        delete updateGymObj.location;
        for (const [key, value] of Object.entries(gymData.location)) {
          updateGymObj[`location.${key}`] = value;
        }
      }
      await Gym.findByIdAndUpdate(user.gymId, { $set: updateGymObj }, { new: true, runValidators: true });
    }

    user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('gymId').select('-passwordHash');

    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { approvalStatus: 'DELETED' }, { new: true });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
