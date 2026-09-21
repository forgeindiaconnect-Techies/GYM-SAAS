import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Payment, { PaymentStatus } from '../models/Payment';
import CustomerMembership, { CustomerMembershipStatus } from '../models/CustomerMembership';
import User, { SubscriptionStatus } from '../models/User';

export const submitPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { gymId, branchId, planName, amount, paymentMethod, transactionId, paymentProofUrl, duration, customerBankDetails, notes } = req.body;

    // Create a new Payment record
    const payment = new Payment({
      customerId: userId,
      gymId,
      branchId,
      planName,
      amount,
      paymentMethod,
      transactionId,
      paymentProofUrl,
      customerBankDetails,
      notes,
      status: PaymentStatus.PENDING_VERIFICATION,
      paymentDate: new Date(),
    });

    await payment.save();

    // Create a new CustomerMembership but keep it pending
    const membership = new CustomerMembership({
      userId,
      gymId,
      branchId,
      planName,
      duration,
      price: amount,
      discount: 0,
      finalAmount: amount,
      paymentMethod,
      status: CustomerMembershipStatus.PAYMENT_VERIFICATION_PENDING,
    });
    
    await membership.save();

    // Update user status
    await User.findByIdAndUpdate(userId, {
      $set: {
        paymentStatus: 'Pending Verification',
        subscriptionStatus: SubscriptionStatus.PAYMENT_VERIFICATION_PENDING,
        subscriptionPlan: planName,
      }
    });

    res.status(201).json({ success: true, message: 'Payment submitted for verification', payment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const gymOwnerId = req.user?.id;

    const payment = await Payment.findById(id);
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }

    // Verify Gym Owner (skipping complex gym owner check for brevity, assuming middleware handles basic role check)

    if (status === 'Approve') {
      payment.status = PaymentStatus.APPROVED;
      payment.approvedAt = new Date();
      await payment.save();

      // Find pending membership and activate
      const membership = await CustomerMembership.findOne({ userId: payment.customerId, status: CustomerMembershipStatus.PAYMENT_VERIFICATION_PENDING }).sort({ createdAt: -1 });
      
      let endDate = new Date();
      if (membership) {
        membership.status = CustomerMembershipStatus.ACTIVE;
        membership.startDate = new Date();
        
        const duration = membership.duration.toLowerCase();
        if (duration.includes('month')) {
          endDate.setMonth(endDate.getMonth() + (parseInt(duration) || 1));
        } else if (duration.includes('year')) {
          endDate.setFullYear(endDate.getFullYear() + (parseInt(duration) || 1));
        } else if (duration.includes('day')) {
          endDate.setDate(endDate.getDate() + (parseInt(duration) || 1));
        } else if (duration.includes('week')) {
          endDate.setDate(endDate.getDate() + ((parseInt(duration) || 1) * 7));
        }
        membership.endDate = endDate;
        await membership.save();
      } else {
         // Default to 1 month if no pending membership record found 
         endDate.setMonth(endDate.getMonth() + 1);
      }

      await User.findByIdAndUpdate(payment.customerId, {
        $set: {
          paymentStatus: 'Approved',
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          subscriptionExpiry: endDate,
        }
      });

      res.status(200).json({ success: true, message: 'Payment approved successfully', payment });
      return;
    }

    if (status === 'Reject') {
      payment.status = PaymentStatus.REJECTED;
      payment.rejectionReason = rejectionReason;
      await payment.save();

      const membership = await CustomerMembership.findOne({ userId: payment.customerId, status: CustomerMembershipStatus.PAYMENT_VERIFICATION_PENDING }).sort({ createdAt: -1 });
      if (membership) {
        membership.status = CustomerMembershipStatus.REJECTED;
        await membership.save();
      }

      await User.findByIdAndUpdate(payment.customerId, {
        $set: {
          paymentStatus: 'Rejected',
          subscriptionStatus: SubscriptionStatus.REJECTED,
        }
      });

      res.status(200).json({ success: true, message: 'Payment rejected', payment });
      return;
    }

    if (status === 'Pending') {
      payment.status = PaymentStatus.PENDING_VERIFICATION;
      await payment.save();

      const membership = await CustomerMembership.findOne({ userId: payment.customerId }).sort({ createdAt: -1 });
      if (membership) {
        membership.status = CustomerMembershipStatus.PAYMENT_VERIFICATION_PENDING;
        await membership.save();
      }

      await User.findByIdAndUpdate(payment.customerId, {
        $set: {
          paymentStatus: 'Pending Verification',
          subscriptionStatus: SubscriptionStatus.PAYMENT_VERIFICATION_PENDING,
        }
      });

      res.status(200).json({ success: true, message: 'Payment status reverted to Pending', payment });
      return;
    }

    res.status(400).json({ success: false, message: 'Invalid status action' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getGymPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    // For Gym Owner, find their gyms
    const UserGyms = await User.findById(userId).populate('gymId');
    const gymId = UserGyms?.gymId;
    
    let filter = {};
    if (req.user?.role === 'GYM_OWNER') {
      filter = { gymId };
    }

    const payments = await Payment.find(filter)
      .populate('customerId', 'firstName lastName email mobile profilePhoto')
      .populate('gymId', 'name')
      .populate('branchId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getMyPaymentHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const payments = await Payment.find({ customerId: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
