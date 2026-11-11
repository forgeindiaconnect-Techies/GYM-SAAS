import crypto from 'crypto';
import mongoose from 'mongoose';
import User, { ApprovalStatus, Role } from '../models/User';
import Trainer from '../models/Trainer';
import TrainerSession from '../models/TrainerSession';
import WorkoutPlan from '../models/WorkoutPlan';
import TrainerPlanRequest from '../models/TrainerPlanRequest';

export const INACTIVE_TRAINER_STATUSES = ['Pending', 'Inactive', 'Rejected', 'Suspended'] as const;

export interface TrainerContext {
  user: any;
  trainer: any;
  userId: string;
  trainerDocId: string;
  trainerCode?: string;
  gymId: string;
  trainerObjectIds: mongoose.Types.ObjectId[];
  trainerIdStrings: string[];
}

export const isTrainerStatusActive = (status?: string | null): boolean => {
  return String(status || '').trim().toLowerCase() === 'active';
};

export const normalizeTrainerStatus = (
  status?: string | null
): 'Pending' | 'Active' | 'Inactive' | 'Rejected' | 'Suspended' | null => {
  const s = String(status || '').trim().toLowerCase();
  if (s === 'active') return 'Active';
  if (s === 'pending') return 'Pending';
  if (s === 'inactive') return 'Inactive';
  if (s === 'suspended') return 'Suspended';
  if (s === 'rejected') return 'Rejected';
  return null;
};

/**
 * Generates a collision-checked, human-readable unique Trainer ID (e.g. TRN-48291A).
 */
export const generateUniqueTrainerId = async (): Promise<string> => {
  for (let attempt = 0; attempt < 15; attempt++) {
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const candidate = `TRN-${suffix}`;
    const existing = await Trainer.exists({ trainerId: candidate });
    if (!existing) {
      return candidate;
    }
  }
  return `TRN-${Date.now().toString(36).toUpperCase()}`;
};

/**
 * Resolves and authorizes the authenticated trainer against MongoDB:
 * - Verifies User exists, is active, and has Role.TRAINER
 * - Verifies Trainer profile exists, is Active, and belongs to a valid Gym
 * - Respects multi-gym trainer selection if trainerId or requestedGymId is provided
 */
export const resolveTrainerContext = async (
  reqUser: { id?: string; trainerId?: string; gymId?: string } | undefined,
  options?: { requestedGymId?: string; allowInactive?: boolean }
): Promise<TrainerContext | null> => {
  if (!reqUser?.id || !mongoose.Types.ObjectId.isValid(reqUser.id)) {
    return null;
  }

  const user: any = await User.findById(reqUser.id).lean();
  if (!user || user.role !== Role.TRAINER) {
    return null;
  }

  if (!options?.allowInactive) {
    if (
      user.isActive === false ||
      user.approvalStatus === ApprovalStatus.DELETED ||
      user.approvalStatus === ApprovalStatus.REJECTED ||
      user.approvalStatus === ApprovalStatus.SUSPENDED
    ) {
      return null;
    }
  }

  const targetGymId = options?.requestedGymId || reqUser.gymId || (user.gymId ? String(user.gymId) : undefined);

  let trainer: any = null;
  if (reqUser.trainerId && mongoose.Types.ObjectId.isValid(reqUser.trainerId)) {
    trainer = await Trainer.findOne({ _id: reqUser.trainerId, userId: user._id }).lean();
  }
  if (!trainer && targetGymId && mongoose.Types.ObjectId.isValid(targetGymId)) {
    trainer = await Trainer.findOne({ userId: user._id, gymId: targetGymId }).lean();
  }
  if (!trainer) {
    trainer = await Trainer.findOne({ userId: user._id }).sort({ createdAt: -1 }).lean();
  }

  if (!trainer) {
    return null;
  }

  if (!options?.allowInactive && !isTrainerStatusActive(trainer.status)) {
    return null;
  }

  const resolvedGymId = trainer.gymId ? String(trainer.gymId) : user.gymId ? String(user.gymId) : '';
  if (!resolvedGymId || !mongoose.Types.ObjectId.isValid(resolvedGymId)) {
    return null;
  }

  if (options?.requestedGymId && String(options.requestedGymId) !== resolvedGymId) {
    return null;
  }

  const userObjId = new mongoose.Types.ObjectId(String(user._id));
  const trainerObjId = new mongoose.Types.ObjectId(String(trainer._id));

  return {
    user,
    trainer,
    userId: String(user._id),
    trainerDocId: String(trainer._id),
    trainerCode: trainer.trainerId || undefined,
    gymId: resolvedGymId,
    trainerObjectIds: [userObjId, trainerObjId],
    trainerIdStrings: [String(user._id), String(trainer._id)],
  };
};

/**
 * Returns strictly the distinct customer User IDs assigned to or working with THIS trainer
 * inside THIS trainer's gym. Never falls back to gym-wide or cross-gym members.
 */
export const getTrainerAssignedCustomerIds = async (ctx: TrainerContext): Promise<string[]> => {
  const customerIdSet = new Set<string>();
  const gymObjectId = new mongoose.Types.ObjectId(ctx.gymId);

  const [directlyAssigned, sessions, workoutPlans, planRequests] = await Promise.all([
    User.find({
      role: Role.MEMBER,
      gymId: gymObjectId,
      assignedTrainer: { $in: ctx.trainerObjectIds },
      approvalStatus: { $ne: ApprovalStatus.DELETED },
    } as any)
      .select('_id')
      .lean(),
    TrainerSession.find({
      gymId: gymObjectId,
      trainerId: { $in: ctx.trainerObjectIds },
    })
      .select('customerId')
      .lean(),
    WorkoutPlan.find({
      gymId: gymObjectId,
      trainerId: { $in: ctx.trainerObjectIds },
    })
      .select('customerId')
      .lean(),
    TrainerPlanRequest.find({
      gymId: gymObjectId,
      trainerId: { $in: ctx.trainerObjectIds },
    })
      .select('customerId')
      .lean(),
  ]);

  directlyAssigned.forEach((u: any) => u?._id && customerIdSet.add(String(u._id)));
  sessions.forEach((s: any) => s?.customerId && customerIdSet.add(String(s.customerId)));
  workoutPlans.forEach((wp: any) => wp?.customerId && customerIdSet.add(String(wp.customerId)));
  planRequests.forEach((pr: any) => pr?.customerId && customerIdSet.add(String(pr.customerId)));

  // Filter out non-member or cross-gym customer IDs defensively
  if (customerIdSet.size === 0) {
    return [];
  }

  const validMembers = await User.find({
    _id: { $in: Array.from(customerIdSet).map((id) => new mongoose.Types.ObjectId(id)) },
    role: Role.MEMBER,
    gymId: gymObjectId,
    approvalStatus: { $ne: ApprovalStatus.DELETED },
  } as any)
    .select('_id')
    .lean();

  return validMembers.map((m: any) => String(m._id));
};

/**
 * Checks whether a given customer belongs to THIS trainer within THIS trainer's gym.
 */
export const isCustomerAssignedToTrainer = async (
  ctx: TrainerContext,
  customerId: string
): Promise<boolean> => {
  if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
    return false;
  }

  const gymObjectId = new mongoose.Types.ObjectId(ctx.gymId);
  const custObjectId = new mongoose.Types.ObjectId(customerId);

  const member: any = await User.findOne({
    _id: custObjectId,
    role: Role.MEMBER,
    gymId: gymObjectId,
    approvalStatus: { $ne: ApprovalStatus.DELETED },
  } as any)
    .select('_id assignedTrainer')
    .lean();

  if (!member) {
    return false;
  }

  if (member.assignedTrainer && ctx.trainerIdStrings.includes(String(member.assignedTrainer))) {
    return true;
  }

  const [hasSession, hasPlan, hasPlanReq] = await Promise.all([
    TrainerSession.exists({
      gymId: gymObjectId,
      customerId: custObjectId,
      trainerId: { $in: ctx.trainerObjectIds },
    }),
    WorkoutPlan.exists({
      gymId: gymObjectId,
      customerId: custObjectId,
      trainerId: { $in: ctx.trainerObjectIds },
    }),
    TrainerPlanRequest.exists({
      gymId: gymObjectId,
      customerId: custObjectId,
      trainerId: { $in: ctx.trainerObjectIds },
    }),
  ]);

  return Boolean(hasSession || hasPlan || hasPlanReq);
};

/**
 * Verifies a Trainer ID string matches either the trainer's User._id or Trainer._id.
 */
export const matchesTrainerContext = (ctx: TrainerContext, targetTrainerId: any): boolean => {
  if (!targetTrainerId) return false;
  const raw = typeof targetTrainerId === 'object' && targetTrainerId._id ? targetTrainerId._id : targetTrainerId;
  return ctx.trainerIdStrings.includes(String(raw));
};

