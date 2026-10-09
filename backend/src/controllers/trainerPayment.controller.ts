import { Request, Response } from 'express';
import TrainerFee from '../models/TrainerFee';
import TrainerPayment from '../models/TrainerPayment';
import Trainer from '../models/Trainer';
import Gym from '../models/Gym';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/auth';
import TrainerWithdrawal from '../models/TrainerWithdrawal';
import GymCommissionWithdrawal from '../models/GymCommissionWithdrawal';
import Notification from '../models/Notification';

const resolveGymId = async (req: AuthRequest): Promise<string | undefined> => {
  if (req.user?.gymId) return req.user.gymId.toString();
  if (req.query.gymId) return req.query.gymId as string;
  const gym = await Gym.findOne().sort({ createdAt: -1 });
  return gym?._id?.toString();
};

const getBranchFilter = (req: AuthRequest) => {
  const branchIdQuery = req.query.branchId as string;
  const effectiveBranchId = req.user?.branchId || branchIdQuery;
  if (effectiveBranchId && effectiveBranchId !== 'all') {
    if (effectiveBranchId === 'main') {
      return { $or: [{ branchId: { $exists: false } }, { branchId: null }] };
    }
    return { branchId: effectiveBranchId };
  }
  return {};
};

// --- Gym Owner: Trainer Fee Management ---

export const setTrainerFee = async (req: AuthRequest, res: Response) => {
  try {
    const gymId = (await resolveGymId(req)) || req.user?.gymId;
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    const branchId = (req.user as any)?.branchId;
    const { 
      trainerId, 
      trainingType, 
      feeAmount, 
      billingCycle, 
      effectiveFrom, 
      paymentMethod, 
      status, 
      notes, 
      accountHolder, 
      bankName, 
      accountNumber, 
      ifscCode, 
      upiId, 
      upiName,
      commissionType,
      commissionValue
    } = req.body;

    if (!trainerId || !trainingType || !feeAmount || !billingCycle || !effectiveFrom || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    const parsedCommissionValue = commissionValue !== undefined && commissionValue !== null && commissionValue !== '' 
      ? Number(commissionValue) 
      : 0;

    if (isNaN(parsedCommissionValue) || parsedCommissionValue < 0) {
      return res.status(400).json({ success: false, message: 'Commission value cannot be negative' });
    }

    if (commissionType === 'Percentage' && parsedCommissionValue > 100) {
      return res.status(400).json({ success: false, message: 'Commission percentage cannot exceed 100%' });
    }

    // Verify trainer belongs to the gym
    const trainerQuery: any = { _id: trainerId };
    if (gymId) trainerQuery.gymId = gymId;
    const trainer = await Trainer.findOne(trainerQuery);
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

    const feeAmountNum = Number(feeAmount) || 0;
    const commDeduction = commissionType === 'Fixed Amount' 
      ? parsedCommissionValue 
      : (feeAmountNum * parsedCommissionValue) / 100;
    const netAmount = Math.max(0, feeAmountNum - commDeduction);

    const newFee = new TrainerFee({
      gymId,
      branchId: branchId || undefined,
      trainerId,
      trainingType,
      feeAmount,
      billingCycle,
      effectiveFrom,
      paymentMethod,
      commissionType: commissionType || 'Percentage',
      commissionValue: parsedCommissionValue,
      netAmount,
      bankDetails: paymentMethod === 'Bank Transfer' ? { accountHolder, bankName, accountNumber, ifscCode } : undefined,
      upiDetails: paymentMethod === 'UPI' ? { upiId, upiName } : undefined,
      status: status || 'Active',
      notes,
      createdBy: userId
    });

    await newFee.save();

    // Also update fee on Trainer document for complete synchronization
    trainer.fee = Number(feeAmount);
    trainer.paymentType = billingCycle === 'Weekly' ? 'Per Week' : billingCycle === 'Per Session' ? 'Per Session' : 'Per Month';
    trainer.commissionType = commissionType || 'Percentage';
    trainer.commissionValue = parsedCommissionValue;
    await trainer.save();

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
    const gymId = (await resolveGymId(req)) || req.user?.gymId;
    const { feeId, status } = req.body;

    if (!feeId || !status) {
      return res.status(400).json({ success: false, message: 'Fee ID and status are required' });
    }

    const feeQuery: any = { _id: feeId };
    if (gymId) feeQuery.gymId = gymId;
    const fee = await TrainerFee.findOne(feeQuery);
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
    const gymId = (await resolveGymId(req)) || req.user?.gymId;
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    
    // Auto-sync any existing trainers with fee who don't have an active TrainerFee document
    const trainersWithFeeQuery: any = { fee: { $exists: true, $gt: 0 } };
    if (gymId) trainersWithFeeQuery.gymId = gymId;
    const trainersWithFee = await Trainer.find(trainersWithFeeQuery);
    for (const t of trainersWithFee) {
      const existingFee = await TrainerFee.findOne({ trainerId: t._id, status: 'Active' });
      if (!existingFee) {
        const cycleMap: Record<string, 'Weekly' | 'Monthly' | 'Per Session' | 'Custom'> = {
          'Per Week': 'Weekly',
          'Per Month': 'Monthly',
          'Per Session': 'Per Session'
        };
        const modeMap: Record<string, string> = {
          'online': 'Online Training',
          'offline': 'Offline Training',
          'both': 'Hybrid Training'
        };
        await TrainerFee.create({
          gymId: gymId || t.gymId,
          branchId: t.branchId,
          trainerId: t._id,
          trainingType: modeMap[t.trainingMode] || 'Offline Training',
          feeAmount: Number(t.fee),
          billingCycle: cycleMap[t.paymentType || 'Per Month'] || 'Monthly',
          effectiveFrom: t.createdAt || new Date(),
          paymentMethod: 'Bank Transfer',
          status: 'Active',
          notes: 'Auto-synced from trainer profile',
          createdBy: userId
        });
      }
    }

    // Fetch all active fees and populate trainer details
    const branchFilter = getBranchFilter(req);
    const feesQuery: any = { status: 'Active', ...branchFilter };
    if (gymId) feesQuery.gymId = gymId;
    const fees = await TrainerFee.find(feesQuery)
      .populate({
        path: 'trainerId',
        select: 'name email phone profilePhoto specialization experience trainingMode fee paymentType status commissionType commissionValue createdAt'
      })
      .sort({ createdAt: -1 });

    const sanitizedFees = fees.map(f => {
      const feeObj: any = f.toObject ? f.toObject() : { ...f };
      const trainer = feeObj.trainerId || {};
      const commType = feeObj.commissionType || trainer.commissionType || 'Percentage';
      const commVal = Number(
        feeObj.commissionValue !== undefined && feeObj.commissionValue !== null
          ? feeObj.commissionValue
          : (trainer.commissionValue !== undefined && trainer.commissionValue !== null ? trainer.commissionValue : 0)
      ) || 0;
      const baseFee = Number(feeObj.feeAmount) || 0;

      let netAmount = feeObj.netAmount;
      if (netAmount === undefined || netAmount === null || isNaN(netAmount)) {
        const deduction = commType === 'Fixed Amount' ? commVal : (baseFee * commVal) / 100;
        netAmount = Math.max(0, Math.round(baseFee - deduction));
      }

      return {
        ...feeObj,
        commissionType: commType,
        commissionValue: commVal,
        netAmount
      };
    });

    // Also get all trainers in gym with full details
    const trainersQuery: any = { ...branchFilter };
    if (gymId) trainersQuery.gymId = gymId;
    const trainers = await Trainer.find(trainersQuery)
      .select('name email phone profilePhoto specialization experience trainingMode fee paymentType status commissionType commissionValue createdAt');

    res.status(200).json({ success: true, fees: sanitizedFees, trainers });
  } catch (error) {
    console.error('Error in getTrainerFees:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// --- Gym Owner: Trainer Payments ---

export const getPendingPayments = async (req: AuthRequest, res: Response) => {
  try {
    const gymId = (await resolveGymId(req)) || req.user?.gymId;
    const branchFilter = getBranchFilter(req);

    // For simplicity in this demo logic, we'll return all active fees as "pending" potentials
    const pendingQuery: any = { status: { $in: ['Active', 'Pending', 'Rejected'] }, ...branchFilter };
    if (gymId) pendingQuery.gymId = gymId;
    const activeFees = await TrainerFee.find(pendingQuery)
      .populate('trainerId', 'name email profilePhoto commissionType commissionValue');

    const pending = activeFees.map(fee => {
      const nextDueDate = new Date();
      nextDueDate.setDate(nextDueDate.getDate() + 7);

      const feeAmountNum = Number(fee.feeAmount) || 0;
      const trainer = (fee.trainerId as any) || {};
      const commType = fee.commissionType || trainer.commissionType || 'Percentage';
      const commVal = Number(
        fee.commissionValue !== undefined && fee.commissionValue !== null
          ? fee.commissionValue
          : (trainer.commissionValue !== undefined && trainer.commissionValue !== null ? trainer.commissionValue : 0)
      ) || 0;

      let netAmount = fee.netAmount;
      if (netAmount === undefined || netAmount === null || isNaN(netAmount)) {
        const commDeduction = commType === 'Fixed Amount' ? commVal : (feeAmountNum * commVal) / 100;
        netAmount = Math.max(0, Math.round(feeAmountNum - commDeduction));
      }
      
      return {
        _id: fee._id,
        trainer: fee.trainerId,
        feeAmount: fee.feeAmount,
        commissionType: commType,
        commissionValue: commVal,
        netAmount: netAmount,
        billingCycle: fee.billingCycle,
        dueDate: nextDueDate,
        amount: netAmount, // exact net payable amount after commission
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
    const gymId = (await resolveGymId(req)) || req.user?.gymId;
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    const branchId = (req.user as any)?.branchId;
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
    const gymId = (await resolveGymId(req)) || req.user?.gymId;
    const branchFilter = getBranchFilter(req);
    
    const query: any = { ...branchFilter };
    if (gymId) query.gymId = gymId;
    const payments = await TrainerPayment.find(query)
      .populate('trainerId', 'name email profilePhoto')
      .populate('trainerFeeId', 'trainingType feeAmount billingCycle commissionType commissionValue netAmount')
      .sort({ paymentDate: -1, createdAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error('Error in getPaymentHistoryGymOwner:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getTrainerEarningsGymOwner = async (req: AuthRequest, res: Response) => {
  try {
    const gymId = (await resolveGymId(req)) || req.user?.gymId;
    const branchFilter = getBranchFilter(req);
    
    const query: any = { paymentStatus: 'Paid', ...branchFilter };
    if (gymId) query.gymId = gymId;
    const payments = await TrainerPayment.find(query);
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

    const rawFees = await TrainerFee.find({ trainerId: trainer._id })
      .sort({ effectiveFrom: -1, createdAt: -1 });

    const fees = rawFees.map(f => {
      const feeObj: any = f.toObject ? f.toObject() : { ...f };
      const commType = feeObj.commissionType || trainer.commissionType || 'Percentage';
      const commVal = Number(
        feeObj.commissionValue !== undefined && feeObj.commissionValue !== null
          ? feeObj.commissionValue
          : (trainer.commissionValue !== undefined && trainer.commissionValue !== null ? trainer.commissionValue : 0)
      ) || 0;
      const baseFee = Number(feeObj.feeAmount) || 0;

      let netAmount = feeObj.netAmount;
      if (netAmount === undefined || netAmount === null || isNaN(netAmount)) {
        const deduction = commType === 'Fixed Amount' ? commVal : (baseFee * commVal) / 100;
        netAmount = Math.max(0, Math.round(baseFee - deduction));
      }

      return {
        ...feeObj,
        commissionType: commType,
        commissionValue: commVal,
        netAmount
      };
    });

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
      
      const feeAmountNum = Number(fee.feeAmount) || 0;
      const commType = fee.commissionType || trainer.commissionType || 'Percentage';
      const commVal = Number(
        fee.commissionValue !== undefined && fee.commissionValue !== null
          ? fee.commissionValue
          : (trainer.commissionValue !== undefined && trainer.commissionValue !== null ? trainer.commissionValue : 0)
      ) || 0;

      let netAmount = fee.netAmount;
      if (netAmount === undefined || netAmount === null || isNaN(netAmount)) {
        const deduction = commType === 'Fixed Amount' ? commVal : (feeAmountNum * commVal) / 100;
        netAmount = Math.max(0, Math.round(feeAmountNum - deduction));
      }

      return {
        _id: fee._id,
        gymId: fee.gymId,
        branchId: fee.branchId,
        amount: netAmount,
        feeAmount: fee.feeAmount,
        commissionType: commType,
        commissionValue: commVal,
        netAmount: netAmount,
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
    let sanitizedCurrentFee: any = null;
    if (currentFee) {
      const feeObj: any = currentFee.toObject ? currentFee.toObject() : { ...currentFee };
      const commType = feeObj.commissionType || trainer.commissionType || 'Percentage';
      const commVal = Number(
        feeObj.commissionValue !== undefined && feeObj.commissionValue !== null
          ? feeObj.commissionValue
          : (trainer.commissionValue !== undefined && trainer.commissionValue !== null ? trainer.commissionValue : 0)
      ) || 0;
      const baseFee = Number(feeObj.feeAmount) || 0;

      let netAmount = feeObj.netAmount;
      if (netAmount === undefined || netAmount === null || isNaN(netAmount)) {
        const deduction = commType === 'Fixed Amount' ? commVal : (baseFee * commVal) / 100;
        netAmount = Math.max(0, Math.round(baseFee - deduction));
      }

      sanitizedCurrentFee = {
        ...feeObj,
        commissionType: commType,
        commissionValue: commVal,
        netAmount
      };
    }

    res.status(200).json({ 
      success: true, 
      currentFee: sanitizedCurrentFee,
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
      .populate('trainerFeeId', 'trainingType feeAmount billingCycle commissionType commissionValue netAmount')
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
      branchId: trainer.branchId,
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
    const gymId = (await resolveGymId(req)) || req.user?.gymId;
    const branchFilter = getBranchFilter(req);
    
    const query: any = { ...branchFilter };
    if (gymId) query.gymId = gymId;

    const requests = await TrainerWithdrawal.find(query)
      .populate('trainerId', 'name email profilePhoto phone specialization availableBalance totalEarnings branchId')
      .sort({ requestedAt: -1, createdAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error('Error in getWithdrawalRequests:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createManualTrainerWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const gymId = (await resolveGymId(req)) || req.user?.gymId;
    const { trainerId, amount, withdrawalMethod, transactionId } = req.body;

    if (!trainerId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid trainer and amount are required' });
    }

    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    const numAmount = Number(amount);
    if (trainer.availableBalance < numAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Amount exceeds trainer's available balance of ₹${trainer.availableBalance.toLocaleString('en-IN')}` 
      });
    }

    const withdrawal = new TrainerWithdrawal({
      gymId: gymId || trainer.gymId,
      branchId: trainer.branchId,
      trainerId: trainer._id,
      amount: numAmount,
      withdrawalMethod: withdrawalMethod || 'Bank Transfer',
      status: 'Completed',
      transactionId: transactionId || undefined,
      requestedAt: new Date(),
      processedAt: new Date()
    });

    await withdrawal.save();

    trainer.availableBalance -= numAmount;
    trainer.withdrawnAmount += numAmount;
    await trainer.save();

    await Notification.create({
      recipientId: trainer.userId,
      recipientRole: 'TRAINER',
      gymId: trainer.gymId,
      title: 'Payout Disbursed',
      message: `A payout of ₹${numAmount.toLocaleString('en-IN')} has been disbursed by your Gym Owner.`,
      type: 'success',
      relatedRecordId: withdrawal._id
    });

    res.status(201).json({ success: true, message: 'Trainer payout recorded successfully', withdrawal });
  } catch (error: any) {
    console.error('Error in createManualTrainerWithdrawal:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getAllWithdrawalRequests = async (req: AuthRequest, res: Response) => {
  try {
    const requests = await TrainerWithdrawal.find()
      .populate('trainerId', 'name email profilePhoto phone specialization availableBalance totalEarnings')
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
    const { role } = req.user!;
    const gymId = (await resolveGymId(req)) || req.user?.gymId;
    const { id } = req.params;
    const { status, transactionId, rejectionReason, notes } = req.body;

    let query: any = { _id: id };
    if (role !== 'SUPER_ADMIN' && gymId) {
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

export const getGymCommissionData = async (req: AuthRequest, res: Response) => {
  try {
    const gymId = (await resolveGymId(req)) || req.user?.gymId;
    const branchFilter = getBranchFilter(req);
    const query: any = { ...branchFilter };
    if (gymId) query.gymId = gymId;

    const [payments, withdrawals, fees] = await Promise.all([
      TrainerPayment.find(query)
        .populate('trainerId', 'name email profilePhoto phone')
        .populate('trainerFeeId', 'trainingType feeAmount billingCycle commissionType commissionValue netAmount')
        .sort({ paymentDate: -1, createdAt: -1 }),
      GymCommissionWithdrawal.find(query).sort({ requestedAt: -1, createdAt: -1 }),
      TrainerFee.find({ ...query, status: 'Active' })
        .populate('trainerId', 'name email profilePhoto phone commissionType commissionValue')
    ]);

    let totalCommissionEarned = 0;
    const commissionLedger = payments.map((p: any) => {
      const baseFee = Number(p.trainerFeeId?.feeAmount) || Number(p.amount) || 0;
      const netPaid = Number(p.amount) || 0;
      const commissionTaken = Math.max(0, baseFee - netPaid);
      totalCommissionEarned += commissionTaken;

      return {
        _id: p._id,
        paymentDate: p.paymentDate,
        transactionId: p.transactionId,
        paymentMethod: p.paymentMethod,
        trainer: p.trainerId,
        baseFee,
        commissionType: p.trainerFeeId?.commissionType || 'Percentage',
        commissionValue: p.trainerFeeId?.commissionValue || 0,
        commissionEarned: commissionTaken,
        netDisbursed: netPaid,
        notes: p.notes
      };
    });

    const totalCommissionWithdrawn = withdrawals
      .filter((w: any) => w.status === 'Completed')
      .reduce((sum: number, w: any) => sum + (Number(w.amount) || 0), 0);

    const pendingWithdrawal = withdrawals
      .filter((w: any) => w.status === 'Pending' || w.status === 'Processing')
      .reduce((sum: number, w: any) => sum + (Number(w.amount) || 0), 0);

    const availableBalance = Math.max(0, totalCommissionEarned - totalCommissionWithdrawn - pendingWithdrawal);

    res.status(200).json({
      success: true,
      stats: {
        totalCommissionEarned,
        availableBalance,
        totalCommissionWithdrawn,
        pendingWithdrawal
      },
      commissionLedger,
      withdrawals,
      activeFees: fees
    });
  } catch (error) {
    console.error('Error in getGymCommissionData:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const requestGymCommissionWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    let gymId = (await resolveGymId(req)) || req.user?.gymId;
    if (!gymId) {
      const gym = await Gym.findOne();
      if (gym) gymId = gym._id.toString();
    }

    const userId = (req.user as any)?.id || (req.user as any)?._id;
    const { amount, withdrawalMethod, bankDetails, upiDetails, notes } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid withdrawal amount' });
    }

    if (!withdrawalMethod || !['Bank Transfer', 'UPI'].includes(withdrawalMethod)) {
      return res.status(400).json({ success: false, message: 'Valid withdrawal method is required (Bank Transfer or UPI)' });
    }

    const query: any = {};
    if (gymId) query.gymId = gymId;

    // Calculate current available balance with populated feeAmount
    const [payments, pastWithdrawals] = await Promise.all([
      TrainerPayment.find(query).populate('trainerFeeId', 'feeAmount commissionType commissionValue netAmount'),
      GymCommissionWithdrawal.find(query)
    ]);

    let totalCommissionEarned = 0;
    payments.forEach((p: any) => {
      const baseFee = Number(p.trainerFeeId?.feeAmount) || Number(p.amount) || 0;
      const netPaid = Number(p.amount) || 0;
      if (baseFee > netPaid) {
        totalCommissionEarned += (baseFee - netPaid);
      }
    });

    const totalDeducted = pastWithdrawals
      .filter((w: any) => ['Completed', 'Pending', 'Processing'].includes(w.status))
      .reduce((sum: number, w: any) => sum + (Number(w.amount) || 0), 0);

    const availableBalance = Math.max(0, totalCommissionEarned - totalDeducted);

    if (numAmount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: `Withdrawal amount (₹${numAmount.toLocaleString('en-IN')}) cannot exceed your available commission balance of ₹${availableBalance.toLocaleString('en-IN')}`
      });
    }

    const transactionId = `COMM-WD-${Date.now().toString().slice(-6)}`;

    const newWithdrawal = new GymCommissionWithdrawal({
      gymId,
      ownerId: userId,
      amount: numAmount,
      withdrawalMethod,
      bankDetails: withdrawalMethod === 'Bank Transfer' ? bankDetails : undefined,
      upiDetails: withdrawalMethod === 'UPI' ? upiDetails : undefined,
      transactionId,
      notes: notes || 'Gym owner commission withdrawal',
      status: 'Completed',
      requestedAt: new Date(),
      processedAt: new Date()
    });

    await newWithdrawal.save();

    if (userId) {
      try {
        await Notification.create({
          recipientId: userId,
          recipientRole: 'GYM_OWNER',
          gymId,
          title: 'Commission Withdrawn',
          message: `You successfully withdrew ₹${numAmount.toLocaleString('en-IN')} from your commission balance via ${withdrawalMethod}. Ref: ${transactionId}`,
          type: 'success',
          relatedRecordId: newWithdrawal._id
        });
      } catch (notifErr) {
        console.error('Notification error on withdrawal:', notifErr);
      }
    }

    res.status(201).json({
      success: true,
      message: `Commission withdrawal of ₹${numAmount.toLocaleString('en-IN')} processed successfully!`,
      withdrawal: newWithdrawal
    });
  } catch (error: any) {
    console.error('Error in requestGymCommissionWithdrawal:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

