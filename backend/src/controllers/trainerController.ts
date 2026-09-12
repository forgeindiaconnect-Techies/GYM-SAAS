import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User, { Role, ApprovalStatus } from '../models/User';

export const createTrainer = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      firstName, lastName, email, mobile, dateOfBirth, gender,
      specialization, experienceYears, qualification, certifications,
      previousGym, joiningDate, employmentType, workingDays, workingHours,
      salary, bio, profilePhoto, resumeUrl, certificationUrl,
      approvalStatus, isActive
    } = req.body;

    if (!firstName || !lastName || !email || !mobile || !specialization || experienceYears === undefined) {
      res.status(400).json({ success: false, message: 'Required fields missing', errorCode: 'MISSING_FIELDS' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email already in use', errorCode: 'EMAIL_IN_USE' });
      return;
    }

    // Auto-generate a default password for the new trainer
    const defaultPassword = 'WelcomeTrainer123!';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    const user = new User({
      firstName, lastName, email, mobile, passwordHash,
      role: Role.TRAINER,
      dateOfBirth, gender, profilePhoto,
      specialization, experienceYears, qualification, certifications,
      previousGym, joiningDate, employmentType, workingDays, workingHours,
      salary, bio, resumeUrl, certificationUrl,
      approvalStatus: approvalStatus || ApprovalStatus.PENDING,
      isActive: isActive !== undefined ? isActive : false
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Trainer created successfully.',
      trainer: user
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getTrainers = async (req: Request, res: Response): Promise<void> => {
  try {
    const trainers = await User.find({ role: Role.TRAINER }).sort({ createdAt: -1 }).select('-passwordHash');
    res.status(200).json({ success: true, trainers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getTrainerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const trainer = await User.findOne({ _id: req.params.id, role: Role.TRAINER }).select('-passwordHash');
    if (!trainer) {
      res.status(404).json({ success: false, message: 'Trainer not found' });
      return;
    }
    res.status(200).json({ success: true, trainer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateTrainerStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { approvalStatus, isActive } = req.body;
    
    const trainer = await User.findOne({ _id: id, role: Role.TRAINER });
    if (!trainer) {
      res.status(404).json({ success: false, message: 'Trainer not found' });
      return;
    }

    if (approvalStatus) trainer.approvalStatus = approvalStatus;
    if (isActive !== undefined) trainer.isActive = isActive;

    await trainer.save();

    res.status(200).json({ success: true, message: 'Trainer status updated', trainer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const deleteTrainer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const trainer = await User.findOneAndDelete({ _id: id, role: Role.TRAINER });
    if (!trainer) {
      res.status(404).json({ success: false, message: 'Trainer not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Trainer deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
