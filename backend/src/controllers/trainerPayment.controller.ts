import { Request, Response } from 'express';
import TrainerFee from '../models/TrainerFee';
import TrainerPayment from '../models/TrainerPayment';
import Trainer from '../models/Trainer';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/auth';
import TrainerWithdrawal from '../models/TrainerWithdrawal';
import Notification from '../models/Notification';

// --- Gym Owner: Trainer Fee Management ---

export const setTrainerFee = async (req: AuthRequest, res: Response) => {
  try {
    const { id: userId, gymId } = req.user!;
    const branchId = (req.user as any).branchId;
    const { trainerId, trainingType, feeAmount, billingCycle, effectiveFrom, paymentMethod, status, notes, accountHolder, bankName, accountNumber, ifscCode, upiId, upiName } = req.body;

    if (!trainerId || !trainingType || !feeAmount || !billingCycle || !effectiveFrom || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    // Verify trainer belongs to the gym
    const trainer = await Trainer.findOne({ _id: trainerId, gymId });
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found in this gym' });
    }

    // Check for an existing active fee
    const existingFee = await TrainerFee.findOne({ trainerId, status: 'Active' });

    if (existingFee) {
      // If fee changes, archive old one
      await TrainerFee.updateOne(
        { _id: existingFee._id },
        { $set: { status: 'Inactive', effectiveUntil: new Date(effectiveFrom) } }
      );
    }

    const newFee = new TrainerFee({
      gymId,
      branchId: branchId || undefined,
      trainerId,
      trainingType,
      feeAmount,
      billingCycle,
      effectiveFrom,
      paymentMethod,
      bankDetails: paymentMethod === 'Bank Transfer' ? { accountHolder, bankName, accountNumber, ifscCode } : undefined,
      upiDetails: paymentMethod === 'UPI' ? { upiId, upiName } : undefined,
      status: status || 'Active',
      notes,
      createdBy: userId
    });

    await newFee.save();

    // Create Notification for Trainer
    await Notification.create({
      recipientId: trainer.userId,
      recipientRole: 'TRAINER',
      gymId,
      title: existingFee ? 'Trainer Fee Updated' : 'New Trainer Fee Assigned',
      message: existingFee 
        ? `Your trainer fee has been updated from ${existingFee.feeAmount} to ${feeAmount} per ${billingCycle.toLowerCase()}.` 
        : `Your Gym Owner has assigned a new trainer fee of ${feeAmount} per ${billingCycle.toLowerCase()}.`,
      type: 'info',
      relatedRecordId: newFee._id
    });

    res.status(201).json({ success: true, message: 'Trainer fee set successfully', fee: newFee });
  } catch (error: any) {
    console.error('Error in setTrainerFee:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + (error.message || error.toString()) });
  }
};

export const updateTrainerFeeStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { gymId } = req.user!;
    const { feeId, status } = req.body;

    if (!feeId || !status) {
      return res.status(400).json({ success: false, message: 'Fee ID and status are required' });
    }

    const fee = await TrainerFee.findOne({ _id: feeId, gymId });
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Trainer fee not found' });
    }

    fee.status = status;
    await fee.save();

    res.status(200).json({ success: true, message: 'Status updated', fee });
  } catch (error) {
    console.error('Error in updateTrainerFeeStatus:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getTrainerFees = async (req: AuthRequest, res: Response) => {
  try {
    const { gymId } = req.user!;
    
    // Fetch all active fees and populate trainer details
    const fees = await TrainerFee.find({ gymId, status: 'Active' })
      .populate({
        path: 'trainerId',
        select: 'name email profilePhoto specialization'
      })
      .sort({ createdAt: -1 });

    // Also get all trainers in gym that don't have a fee set yet (so owner can see who needs one)
    const trainers = await Trainer.find({ gymId, status: 'Active' }).select('name email profilePhoto specialization');

    res.status(200).json({ success: true, fees, trainers });
  } catch (error) {
    console.error('Error in getTrainerFees:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// --- Gym Owner: Trainer Payments ---

export const getPendingPayments = async (req: AuthRequest, res: Response) => {
  try {
    const { gymId } = req.user!;

    // For simplicity in this demo logic, we'll return all active fees as "pending" potentials
    // In a real complex system, you'd calculate exact sessions/weeks passed since last payment.
    const activeFees = await TrainerFee.find({ gymId, status: { $in: ['Active', 'Pending', 'Rejected'] } })
      .populate('trainerId', 'name email profilePhoto');

    const pending = activeFees.map(fee => {
      // Mocking due date and pending amount for now based on fee config
      // A robust implementation would query sessions or check calendar weeks
      const nextDueDate = new Date(); // Mock
      nextDueDate.setDate(nextDueDate.getDate() + 7);
      
      return {
        _id: fee._id,
        trainer: fee.trainerId,
        feeAmount: fee.feeAmount,
        billingCycle: fee.billingCycle,
        dueDate: nextDueDate,
        amount: fee.feeAmount, // Assuming 1 cycle due
        status: fee.status,
        paymentMethod: fee.paymentMethod,
        bankDetails: fee.bankDetails,
        upiDetails: fee.upiDetails
      };
    });

    res.status(200).json({ success: true, pending });
  } catch (error) {
    console.error('Error in getPendingPayments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const processPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { gymId, id: userId } = req.user!;
    const branchId = (req.user as any).branchId;
    const { trainerId, trainerFeeId, amount, paymentMethod, transactionId, paymentDate, paymentProof, notes } = req.body;

    if (!trainerId || !trainerFeeId || !amount || !paymentMethod || !paymentDate) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    if (transactionId) {
      const existingPayment = await TrainerPayment.findOne({ transactionId });
      if (existingPayment) {
        return res.status(400).json({ success: false, message: 'Duplicate transaction. A payment with this reference ID already exists.' });
      }
    }

    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    const newPayment = new TrainerPayment({
      gymId,
      branchId: branchId || undefined,
      trainerId,
      trainerFeeId,
      amount,
      paymentMethod,
      transactionId,
      paymentDate,
      paymentProof,
      notes,
      paymentStatus: 'Paid',
      paidBy: userId
    });

    await newPayment.save();

    trainer.totalEarnings += Number(amount);
    trainer.availableBalance += Number(amount);
    await trainer.save();
    
    // Create Notification for Trainer
    await Notification.create({
      recipientId: trainer.userId,
      recipientRole: 'TRAINER',
      gymId,
      title: 'Payment Received',
      message: `You received a trainer payment of ${amount} from the Gym Owner.`,
      type: 'success',
      relatedRecordId: newPayment._id
    });

    res.status(201).json({ success: true, message: 'Payment processed successfully', payment: newPayment });
  } catch (error) {
    console.error('Error in processPayment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPaymentHistoryGymOwner = async (req: AuthRequest, res: Response) => {
  try {
    const { gymId } = req.user!;
    
    const payments = await TrainerPayment.find({ gymId })
      .populate('trainerId', 'name email profilePhoto')
      .populate('trainerFeeId', 'trainingType feeAmount billingCycle')
      .sort({ paymentDate: -1, createdAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error('Error in getPaymentHistoryGymOwner:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getTrainerEarningsGymOwner = async (req: AuthRequest, res: Response) => {
  try {
    const { gymId } = req.user!;
    
    const payments = await TrainerPayment.find({ gymId, paymentStatus: 'Paid' });
    const totalPaidOut = payments.reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({ success: true, totalPaidOut, paymentsCount: payments.length });
  } catch (error) {
    console.error('Error in getTrainerEarningsGymOwner:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// --- Trainer: Own Dashboard ---

export const getMyTrainerFee = async (req: AuthRequest, res: Response) => {
  try {
    const { id: userId } = req.user!;
    
    const trainer = await Trainer.findOne({ userId });
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer profile not found' });
    }

    const fees = await TrainerFee.find({ trainerId: trainer._id })
      .sort({ effectiveFrom: -1, createdAt: -1 });

    const fee = fees.find(f => f.status === 'Active') || fees[0] || null;

    res.status(200).json({ success: true, fee, fees });
  } catch (error) {
    console.error('Error in getMyTrainerFee:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMyPendingPayments = async (req: AuthRequest, res: Response) => {
  try {
    const { id: userId } = req.user!;
    const trainer = await Trainer.findOne({ userId });
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer profile not found' });

    // Fetch active fees for this trainer to represent 'pending' future cycles
    const activeFees = await TrainerFee.find({ trainerId: trainer._id, status: { $in: ['Active', 'Pending', 'Rejected'] } })
      .populate('gymId', 'name')
      .populate('branchId', 'name');

    const pending = activeFees.map(fee => {
      // Mocking due date and pending amount for now based on fee config
      const nextDueDate = new Date();
      nextDueDate.setDate(nextDueDate.getDate() + 7);
      
      return {
        _id: fee._id,
        gymId: fee.gymId,
        branchId: fee.branchId,
        amount: fee.feeAmount,
        billingCycle: fee.billingCycle,
        paymentDate: nextDueDate, // Use next due date as payment date for display
        paymentMethod: fee.paymentMethod,
        paymentStatus: 'Pending',
        transactionId: null,
        trainerFeeId: { trainingType: fee.trainingType },
      };
    });

    res.status(200).json({ success: true, pending });
  } catch (error) {
    console.error('Error in getMyPendingPayments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMyEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const { id: userId } = req.user!;
    
    const trainer = await Trainer.findOne({ userId });
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer profile not found' });
    }

    const payments = await TrainerPayment.find({ trainerId: trainer._id, paymentStatus: 'Paid' });
    const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);

    const withdrawals = await TrainerWithdrawal.find({ trainerId: trainer._id });
    const totalWithdrawn = withdrawals
      .filter(w => w.status === 'Approved')
      .reduce((sum, w) => sum + w.amount, 0);
      
    const pendingWithdrawalAmount = withdrawals
      .filter(w => w.status === 'Pending')
      .reduce((sum, w) => sum + w.amount, 0);
      
    const availableBalance = totalEarnings - totalWithdrawn - pendingWithdrawalAmount;

    const currentFee = await TrainerFee.findOne({ trainerId: trainer._id, status: 'Active' });

    res.status(200).json({ 
      success: true, 
      currentFee,
      trainer: {
        totalEarnings, 
        availableBalance,
        pendingWithdrawal: pendingWithdrawalAmount,
        withdrawnAmount: totalWithdrawn
      },
      hasPendingWithdrawal: pendingWithdrawalAmount > 0
    });
  } catch (error) {
    console.error('Error in getMyEarnings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMyPaymentHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { id: userId } = req.user!;
    
    const trainer = await Trainer.findOne({ userId });
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer profile not found' });
    }

    const payments = await TrainerPayment.find({ trainerId: trainer._id })
      .populate('trainerFeeId', 'trainingType feeAmount billingCycle')
      .populate('gymId', 'name')
      .sort({ paymentDate: -1, createdAt: -1 });
    
    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error('Error in getMyPaymentHistory:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMyWithdrawalHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { id: userId } = req.user!;
    
    const trainer = await Trainer.findOne({ userId });
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer profile not found' });
    }

    const withdrawals = await TrainerWithdrawal.find({ trainerId: trainer._id })
      .sort({ requestedAt: -1 });
    
    res.status(200).json({ success: true, withdrawals });
  } catch (error) {
    console.error('Error in getMyWithdrawalHistory:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const requestWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { id: userId } = req.user!;
    const { amount, withdrawalMethod, bankDetails, upiDetails } = req.body;

    const trainer = await Trainer.findOne({ userId });
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer profile not found' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    if (amount > trainer.availableBalance) {
      return res.status(400).json({ success: false, message: 'Amount exceeds available balance' });
    }

    const existing = await TrainerWithdrawal.findOne({ trainerId: trainer._id, status: { $in: ['Pending', 'Processing'] } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have an active withdrawal request' });
    }

    if (!withdrawalMethod) {
      return res.status(400).json({ success: false, message: 'Withdrawal method is required' });
    }

    const withdrawal = new TrainerWithdrawal({
      gymId: trainer.gymId,
      trainerId: trainer._id,
      amount,
      withdrawalMethod,
      bankDetails: withdrawalMethod === 'Bank Transfer' ? bankDetails : undefined,
      upiDetails: withdrawalMethod === 'UPI' ? upiDetails : undefined
    });

    await withdrawal.save();

    trainer.availableBalance -= Number(amount);
    trainer.pendingWithdrawal += Number(amount);
    await trainer.save();

    // Create Notification for Trainer
    await Notification.create({
      recipientId: trainer.userId,
      recipientRole: 'TRAINER',
      gymId: trainer.gymId,
      title: 'Withdrawal Submitted',
      message: `Your withdrawal request for ${amount} has been submitted successfully.`,
      type: 'success',
      relatedRecordId: withdrawal._id
    });

    res.status(201).json({ success: true, message: 'Withdrawal requested successfully', withdrawal });
  } catch (error) {
    console.error('Error in requestWithdrawal:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getWithdrawalRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { gymId } = req.user!;
    
    const requests = await TrainerWithdrawal.find({ gymId })
      .populate('trainerId', 'name email profilePhoto')
      .sort({ requestedAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error('Error in getWithdrawalRequests:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllWithdrawalRequests = async (req: AuthRequest, res: Response) => {
  try {
    const requests = await TrainerWithdrawal.find()
      .populate('trainerId', 'name email profilePhoto')
      .populate('gymId', 'name')
      .sort({ requestedAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error('Error in getAllWithdrawalRequests:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateWithdrawalStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { gymId, role } = req.user!;
    const { id } = req.params;
    const { status, transactionId, rejectionReason, notes } = req.body;

    let query: any = { _id: id };
    if (role !== 'SUPER_ADMIN') {
      query.gymId = gymId;
    }

    const withdrawal = await TrainerWithdrawal.findOne(query);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
    }

    if (['Completed', 'Rejected', 'Cancelled'].includes(withdrawal.status)) {
      return res.status(400).json({ success: false, message: 'Request is already in a final state' });
    }

    const trainer = await Trainer.findById(withdrawal.trainerId);
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    const oldStatus = withdrawal.status;
    withdrawal.status = status;
    if (transactionId) withdrawal.transactionId = transactionId;
    if (rejectionReason) withdrawal.rejectionReason = rejectionReason;
    if (['Completed', 'Rejected', 'Cancelled'].includes(status)) {
      withdrawal.processedAt = new Date();
    }
    
    await withdrawal.save();

    // Handle balances
    if (status === 'Completed' && oldStatus !== 'Completed') {
      trainer.pendingWithdrawal -= withdrawal.amount;
      trainer.withdrawnAmount += withdrawal.amount;
      await trainer.save();
    } else if (['Rejected', 'Cancelled'].includes(status) && !['Rejected', 'Cancelled'].includes(oldStatus)) {
      // Refund available balance
      trainer.pendingWithdrawal -= withdrawal.amount;
      trainer.availableBalance += withdrawal.amount;
      await trainer.save();
    }

    // Notification message
    let message = `Your withdrawal request for ${withdrawal.amount} has been ${status.toLowerCase()}.`;
    if (status === 'Processing') message = `Your withdrawal of ${withdrawal.amount} is currently being processed.`;
    if (status === 'Rejected' && rejectionReason) message = `Your withdrawal request for ${withdrawal.amount} was rejected. Reason: ${rejectionReason}`;

    // Create Notification for Trainer
    await Notification.create({
      recipientId: trainer.userId,
      recipientRole: 'TRAINER',
      gymId: trainer.gymId,
      title: `Withdrawal ${status}`,
      message,
      type: status === 'Rejected' ? 'alert' : 'info',
      relatedRecordId: withdrawal._id
    });

    res.status(200).json({ success: true, message: `Withdrawal status updated to ${status}`, withdrawal });
  } catch (error: any) {
    console.error('Error in updateWithdrawalStatus:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
