import { Request, Response } from 'express';
import User, { Role, SubscriptionStatus } from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import Gym from '../models/Gym';
import CustomerMembership, { CustomerMembershipStatus } from '../models/CustomerMembership';

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

    const branchIdQuery = req.query.branchId as string;
    const effectiveBranchId = req.user?.branchId || branchIdQuery;
    if (effectiveBranchId && effectiveBranchId !== 'all') {
      if (effectiveBranchId === 'main') {
        filter.$or = [{ branchId: { $exists: false } }, { branchId: null }];
      } else {
        filter.branchId = effectiveBranchId;
      }
    }

    const rawUsers = await User.find(filter)
      .populate('gymId')
      .populate('branchId', 'name')
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    const gymIds = rawUsers.map((u: any) => u.gymId?._id || u.gymId).filter(Boolean);
    let branchesMap: Record<string, any[]> = {};
    if (gymIds.length > 0) {
      const Branch = (await import('../models/Branch')).default;
      const branches = await Branch.find({ gymId: { $in: gymIds } }).lean();
      branches.forEach((b: any) => {
        const gId = b.gymId?.toString();
        if (gId) {
          if (!branchesMap[gId]) branchesMap[gId] = [];
          branchesMap[gId].push(b);
        }
      });
    }

    const users = rawUsers.map((u: any) => {
      const gId = u.gymId?._id?.toString() || u.gymId?.toString();
      return {
        ...u,
        branches: gId && branchesMap[gId] ? branchesMap[gId] : []
      };
    });

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
      user.paymentStatus = 'Approved';
      user.subscriptionStatus = SubscriptionStatus.ACTIVE;

      if (user.role === Role.MEMBER) {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1); // 1 year active upon approval

        user.subscriptionExpiry = futureDate;
        (user as any).subscriptionExpiryDate = futureDate;

        const memberships = await CustomerMembership.find({ userId: user._id });
        if (memberships.length > 0) {
          for (const m of memberships) {
            m.status = CustomerMembershipStatus.ACTIVE;
            m.startDate = now;
            m.endDate = futureDate;
            await m.save();
          }
        } else {
          await CustomerMembership.create({
            userId: user._id,
            gymId: user.gymId,
            branchId: user.branchId,
            planName: user.subscriptionPlan || 'Active Membership',
            duration: '1 Year',
            price: 0,
            discount: 0,
            finalAmount: 0,
            paymentMethod: 'Approved by Gym Owner',
            status: CustomerMembershipStatus.ACTIVE,
            startDate: now,
            endDate: futureDate,
          });
        }
      }
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
    if (updateData.phone && !updateData.mobile) {
      updateData.mobile = updateData.phone;
    }
    
    let user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (gymData && user.gymId) {
      // Handle nested location data correctly if provided
      const updateGymObj: any = { ...gymData };
      if (updateGymObj.memberCapacity !== undefined) {
        updateGymObj.memberCapacity = updateGymObj.memberCapacity === '' ? undefined : Number(updateGymObj.memberCapacity);
      }
      if (updateGymObj.trainerCapacity !== undefined) {
        updateGymObj.trainerCapacity = updateGymObj.trainerCapacity === '' ? undefined : Number(updateGymObj.trainerCapacity);
      }
      if (updateGymObj.rating !== undefined) {
        updateGymObj.rating = updateGymObj.rating === '' ? undefined : Number(updateGymObj.rating);
      }
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

    const userObj = user?.toObject() || user;
    if (userObj) {
      (userObj as any).phone = userObj.mobile;
      (userObj as any).id = userObj._id;
    }

    res.status(200).json({ success: true, user: userObj });
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
