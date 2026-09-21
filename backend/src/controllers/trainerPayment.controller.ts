import { Request, Response } from 'express';
import TrainerFee from '../models/TrainerFee';
import TrainerPayment from '../models/TrainerPayment';
import Trainer from '../models/Trainer';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/auth';
import TrainerWithdrawal from '../models/TrainerWithdrawal';

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
      existingFee.status = 'Inactive';
      existingFee.effectiveUntil = new Date(effectiveFrom);
      await existingFee.save();
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

    res.status(201).json({ success: true, message: 'Trainer fee set successfully', fee: newFee });
  } catch (error) {
    console.error('Error in setTrainerFee:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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
    
    // In a real app, send notification to trainer here

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
      .sort({ paymentDate: -1 });

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

    const fee = await TrainerFee.findOne({ trainerId: trainer._id, status: { $in: ['Active', 'Pending', 'Rejected'] } });
    
    res.status(200).json({ success: true, fee });
  } catch (error) {
    console.error('Error in getMyTrainerFee:', error);
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

    // Calculate pending amount based on last payment
    const fee = await TrainerFee.findOne({ trainerId: trainer._id, status: { $in: ['Active', 'Pending'] } });
    let pendingAmount = fee ? fee.feeAmount : 0; 
    
    // If a payment was already made recently (e.g., within the last 25 days for monthly cycle), assume nothing is pending right now
    const lastPayment = await TrainerPayment.findOne({ trainerId: trainer._id, paymentStatus: 'Paid' }).sort({ paymentDate: -1 });
    if (lastPayment && fee && fee.billingCycle === 'Monthly') {
      const daysSincePayment = (new Date().getTime() - new Date(lastPayment.paymentDate).getTime()) / (1000 * 3600 * 24);
      if (daysSincePayment < 25) {
        pendingAmount = 0;
      }
    }
    
    const pendingWithdrawal = await TrainerWithdrawal.findOne({ trainerId: trainer._id, status: 'Pending' });

    res.status(200).json({ 
      success: true, 
      totalEarnings, 
      pendingAmount,
      hasPendingWithdrawal: !!pendingWithdrawal,
      withdrawalAmount: pendingWithdrawal ? pendingWithdrawal.amount : null,
      paidAmount: totalEarnings,
      currentFee: fee
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
      .sort({ paymentDate: -1 });
    
    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error('Error in getMyPaymentHistory:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const requestWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { id: userId } = req.user!;
    const { amount } = req.body;

    const trainer = await Trainer.findOne({ userId });
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer profile not found' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const existing = await TrainerWithdrawal.findOne({ trainerId: trainer._id, status: 'Pending' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have a pending withdrawal request' });
    }

    const withdrawal = new TrainerWithdrawal({
      gymId: trainer.gymId,
      trainerId: trainer._id,
      amount
    });

    await withdrawal.save();

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

export const approveWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { gymId, id: userId } = req.user!;
    const { id } = req.params;
    const { paymentMethod, transactionId, paymentDate, notes } = req.body || {};

    const withdrawal = await TrainerWithdrawal.findOne({ _id: id, gymId });
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
    }

    if (withdrawal.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Request is already processed' });
    }

    const fee = await TrainerFee.findOne({ trainerId: withdrawal.trainerId, status: { $in: ['Active', 'Pending', 'Rejected'] } });
    if (!fee) {
      return res.status(400).json({ success: false, message: 'Trainer fee configuration not found' });
    }

    const newPayment = new TrainerPayment({
      gymId,
      trainerId: withdrawal.trainerId,
      trainerFeeId: fee._id,
      amount: withdrawal.amount,
      paymentMethod: paymentMethod || 'Bank Transfer',
      transactionId,
      paymentDate: paymentDate || new Date(),
      notes: notes || 'Withdrawal approved',
      paymentStatus: 'Paid',
      paidBy: userId
    });

    await newPayment.save();

    withdrawal.status = 'Approved';
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    res.status(200).json({ success: true, message: 'Withdrawal approved and payment processed', withdrawal });
  } catch (error: any) {
    console.error('Error in approveWithdrawal:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const rejectWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { gymId } = req.user!;
    const { id } = req.params;

    const withdrawal = await TrainerWithdrawal.findOne({ _id: id, gymId });
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
    }

    if (withdrawal.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Request is already processed' });
    }

    withdrawal.status = 'Rejected';
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    res.status(200).json({ success: true, message: 'Withdrawal rejected', withdrawal });
  } catch (error) {
    console.error('Error in rejectWithdrawal:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
