import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import CustomerMembership, { CustomerMembershipStatus } from '../models/CustomerMembership';
import User, { SubscriptionStatus } from '../models/User';
import Gym from '../models/Gym';

export const joinGym = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { gymId, branchId, planName, duration, price, discount, paymentMethod, paymentReference, paymentProofUrl } = req.body;
    
    const gym = await Gym.findById(gymId);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    const membership = new CustomerMembership({
      userId,
      gymId,
      branchId,
      planName: planName, // Record their intended plan
      duration: '1 Week',
      price: 0,
      discount: 0,
      finalAmount: 0,
      paymentMethod: 'Trial',
      status: CustomerMembershipStatus.FREE_TRIAL,
      startDate: new Date(),
      endDate: trialEndDate,
    });

    await membership.save();

    await User.findByIdAndUpdate(userId, {
      $set: {
        paymentStatus: 'Approved',
        subscriptionStatus: SubscriptionStatus.FREE_TRIAL,
        subscriptionPlan: planName,
        subscriptionExpiry: trialEndDate,
        branchId: branchId || undefined,
        gymId: gymId,
      }
    });

    res.status(201).json({ success: true, message: 'Free trial activated successfully', membership });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getMyMemberships = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const memberships = await CustomerMembership.find({ userId }).populate('gymId', 'name location logo phone email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, memberships });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const verifyMembership = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // In a real app, verify that req.user is the owner of the gym tied to this membership
    const membership = await CustomerMembership.findById(id);
    if (!membership) {
      res.status(404).json({ success: false, message: 'Membership not found' });
      return;
    }

    membership.status = CustomerMembershipStatus.ACTIVE;
    membership.startDate = new Date();
    
    const endDate = new Date();
    if (membership.planName.toLowerCase().includes('trial')) {
      endDate.setDate(endDate.getDate() + 1);
    } else if (membership.duration.toLowerCase().includes('month')) {
      endDate.setMonth(endDate.getMonth() + (parseInt(membership.duration) || 1));
    } else if (membership.duration.toLowerCase().includes('year')) {
      endDate.setFullYear(endDate.getFullYear() + (parseInt(membership.duration) || 1));
    } else if (membership.duration.toLowerCase().includes('day')) {
      endDate.setDate(endDate.getDate() + (parseInt(membership.duration) || 1));
    } else if (membership.duration.toLowerCase().includes('week')) {
      endDate.setDate(endDate.getDate() + ((parseInt(membership.duration) || 1) * 7));
    }
    membership.endDate = endDate;

    await membership.save();

    res.status(200).json({ success: true, message: 'Membership verified and activated', membership });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
