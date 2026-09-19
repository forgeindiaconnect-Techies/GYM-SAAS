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

    const finalAmount = price - (discount || 0);

    const membership = new CustomerMembership({
      userId,
      gymId,
      branchId,
      planName,
      duration,
      price,
      discount: discount || 0,
      finalAmount,
      paymentMethod,
      paymentReference,
      paymentProofUrl,
      status: paymentMethod !== 'Bank Transfer' ? CustomerMembershipStatus.ACTIVE : CustomerMembershipStatus.PENDING_VERIFICATION,
      startDate: paymentMethod !== 'Bank Transfer' ? new Date() : undefined,
    });

    if (paymentMethod !== 'Bank Transfer') {
      // Calculate end date based on duration
      const endDate = new Date();
      if (planName.toLowerCase().includes('trial')) {
        endDate.setDate(endDate.getDate() + 1);
      } else if (duration.toLowerCase().includes('month')) {
        endDate.setMonth(endDate.getMonth() + (parseInt(duration) || 1));
      } else if (duration.toLowerCase().includes('year')) {
        endDate.setFullYear(endDate.getFullYear() + (parseInt(duration) || 1));
      } else if (duration.toLowerCase().includes('day')) {
        endDate.setDate(endDate.getDate() + (parseInt(duration) || 1));
      } else if (duration.toLowerCase().includes('week')) {
        endDate.setDate(endDate.getDate() + ((parseInt(duration) || 1) * 7));
      }
      membership.endDate = endDate;
    }

    await membership.save();

    // Update User model
    const paymentStatus = paymentMethod !== 'Bank Transfer' ? 'PAID' : 'PENDING';
    const subStatus = paymentMethod !== 'Bank Transfer' ? 
      (planName.toLowerCase().includes('trial') ? SubscriptionStatus.TRIAL : SubscriptionStatus.ACTIVE) 
      : SubscriptionStatus.NONE;

    await User.findByIdAndUpdate(userId, {
      $set: {
        paymentStatus,
        subscriptionStatus: subStatus,
        subscriptionPlan: planName,
        subscriptionExpiry: membership.endDate,
        branchId: branchId || undefined,
        gymId: gymId,
      }
    });

    res.status(201).json({ success: true, message: 'Membership processed successfully', membership });
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
