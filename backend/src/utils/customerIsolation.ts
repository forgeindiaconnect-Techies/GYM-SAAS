import crypto from 'crypto';
import mongoose from 'mongoose';
import User, { Role } from '../models/User';
import Gym from '../models/Gym';
import Trainer from '../models/Trainer';

const ACTIVE_GYM_STATUSES = new Set(['ACTIVE', 'APPROVED', 'ACTIVE_GYM']);

export const isGymActiveStatus = (status?: string | null): boolean => {
  if (!status) return false;
  const upper = String(status).trim().toUpperCase();
  return upper === 'ACTIVE' || upper === 'APPROVED' || ACTIVE_GYM_STATUSES.has(upper);
};

export const generateUniqueCustomerId = async (): Promise<string> => {
  for (let i = 0; i < 15; i += 1) {
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const candidate = `CUS-${suffix}`;
    const exists = await User.exists({ customerId: candidate });
    if (!exists) return candidate;
  }
  return `CUS-${Date.now().toString(36).toUpperCase().slice(-6)}`;
};

export const ensureCustomerHasId = async (userDoc: any): Promise<string | undefined> => {
  if (!userDoc || userDoc.role !== Role.MEMBER) return userDoc?.customerId;
  if (userDoc.customerId) return userDoc.customerId;
  const newCode = await generateUniqueCustomerId();
  await User.findByIdAndUpdate(userDoc._id, { $set: { customerId: newCode } });
  userDoc.customerId = newCode;
  return newCode;
};

export const verifyTrainerBelongsToCustomerGym = async (
  trainerIdOrUserId: string,
  customerGymId?: string | mongoose.Types.ObjectId | null
): Promise<{ valid: boolean; trainer: any | null; message?: string }> => {
  if (!customerGymId) {
    return { valid: false, trainer: null, message: 'Please select a gym first.' };
  }
  if (!trainerIdOrUserId || !mongoose.Types.ObjectId.isValid(String(trainerIdOrUserId))) {
    return { valid: false, trainer: null, message: 'Valid trainer identifier is required.' };
  }

  const trainer = await Trainer.findOne({
    $or: [{ _id: trainerIdOrUserId }, { userId: trainerIdOrUserId }]
  });

  if (!trainer) {
    return { valid: false, trainer: null, message: 'Trainer not found.' };
  }

  if (trainer.status !== 'Active') {
    return { valid: false, trainer, message: 'This trainer is currently inactive or unavailable.' };
  }

  if (!trainer.gymId || String(trainer.gymId) !== String(customerGymId)) {
    return {
      valid: false,
      trainer,
      message: 'Unauthorized: trainer does not belong to your selected gym.'
    };
  }

  return { valid: true, trainer };
};

export const verifyGymIsActive = async (gymId: string): Promise<{ valid: boolean; gym: any | null; message?: string }> => {
  if (!gymId || !mongoose.Types.ObjectId.isValid(String(gymId))) {
    return { valid: false, gym: null, message: 'Valid Gym ID is required.' };
  }
  const gym = await Gym.findById(gymId).populate('ownerId', 'firstName lastName email mobile');
  if (!gym) {
    return { valid: false, gym: null, message: 'Gym not found.' };
  }
  if (!isGymActiveStatus(gym.status)) {
    return { valid: false, gym, message: 'Selected gym is not currently active.' };
  }
  return { valid: true, gym };
};

