import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    gymId?: string;
    branchId?: string;
    customerId?: string;
    trainerId?: string;
    trainerCode?: string;
    approvalStatus?: string;
    subscriptionStatus?: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Unauthorized', errorCode: 'MISSING_TOKEN' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { default: User, ApprovalStatus, Role } = await import('../models/User');
    const { default: Trainer } = await import('../models/Trainer');
    const { isTrainerStatusActive } = await import('../utils/trainerIsolation');

    const dbUser: any = await User.findById(decoded.id)
      .select('role gymId branchId customerId isActive approvalStatus subscriptionStatus')
      .lean();

    if (!dbUser || dbUser.approvalStatus === ApprovalStatus.DELETED) {
      res.status(401).json({ success: false, message: 'Account not found or deleted', errorCode: 'ACCOUNT_NOT_FOUND' });
      return;
    }

    if (
      dbUser.isActive === false ||
      dbUser.approvalStatus === ApprovalStatus.SUSPENDED ||
      dbUser.approvalStatus === ApprovalStatus.REJECTED
    ) {
      res.status(403).json({
        success: false,
        message: 'Your account has been deactivated or suspended. Please contact your administrator.',
        errorCode: 'ACCOUNT_INACTIVE'
      });
      return;
    }

    let resolvedGymId = dbUser.gymId ? String(dbUser.gymId) : decoded.gymId;
    let resolvedTrainerId = decoded.trainerId;
    let resolvedTrainerCode = decoded.trainerCode;

    if (dbUser.role === Role.TRAINER) {
      const requestedGymId = (req.headers['x-gym-id'] as string) || (req.query?.gymId as string);
      let trainerDoc: any = null;

      if (requestedGymId) {
        trainerDoc = await Trainer.findOne({ userId: dbUser._id, gymId: requestedGymId }).lean();
      } else if (decoded.trainerId) {
        trainerDoc = await Trainer.findOne({ _id: decoded.trainerId, userId: dbUser._id }).lean();
      }

      if (!trainerDoc) {
        trainerDoc = await Trainer.findOne({ userId: dbUser._id }).sort({ createdAt: -1 }).lean();
      }

      if (!trainerDoc) {
        res.status(403).json({
          success: false,
          message: 'Trainer profile not found for this account.',
          errorCode: 'TRAINER_NOT_FOUND'
        });
        return;
      }

      if (!isTrainerStatusActive(trainerDoc.status)) {
        res.status(403).json({
          success: false,
          message: `Your trainer account is currently ${trainerDoc.status}. Access restricted.`,
          errorCode: 'TRAINER_INACTIVE'
        });
        return;
      }

      resolvedGymId = trainerDoc.gymId ? String(trainerDoc.gymId) : resolvedGymId;
      resolvedTrainerId = String(trainerDoc._id);
      resolvedTrainerCode = trainerDoc.trainerId || resolvedTrainerCode;
    }

    req.user = {
      ...decoded,
      id: String(dbUser._id),
      role: dbUser.role,
      gymId: resolvedGymId,
      branchId: dbUser.branchId ? String(dbUser.branchId) : decoded.branchId,
      customerId: dbUser.customerId || decoded.customerId,
      approvalStatus: dbUser.approvalStatus,
      subscriptionStatus: dbUser.subscriptionStatus,
      ...(resolvedTrainerId ? { trainerId: resolvedTrainerId } : {}),
      ...(resolvedTrainerCode ? { trainerCode: resolvedTrainerCode } : {}),
    };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token', errorCode: 'INVALID_TOKEN' });
  }
};

export const optionalAuthenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
  } catch (error) {
    // Continue unauthenticated
  }
  next();
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized', errorCode: 'NOT_AUTHENTICATED' });
      return;
    }

    const userRole = (req.user.role || '').toUpperCase().trim();
    const normalizedRoles = roles.map(r => r.toUpperCase().trim());

    // Only SUPER_ADMIN has master override across routes
    if (userRole === 'SUPER_ADMIN') {
      return next();
    }

    if (!normalizedRoles.includes(userRole)) {
      console.warn(`[AUTHORIZE 403] Required: [${normalizedRoles.join(', ')}], actual: '${userRole}' on ${req.method} ${req.originalUrl}`);
      res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges', errorCode: 'INSUFFICIENT_PRIVILEGES' });
      return;
    }
    next();
  };
};

export const requireActiveGymOwner = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role?.toUpperCase() !== 'GYM_OWNER') {
    res.status(403).json({ success: false, message: 'Forbidden: Only gym owners are allowed', errorCode: 'NOT_GYM_OWNER' });
    return;
  }
  
  const approvalStatus = (req.user.approvalStatus || '').toUpperCase();
  if (approvalStatus !== 'APPROVED') {
    res.status(403).json({ success: false, message: 'Gym registration is not approved yet', errorCode: 'NOT_APPROVED' });
    return;
  }
  
  const subStatus = (req.user.subscriptionStatus || '').toUpperCase().replace(/\s+/g, '_');
  // Allow: ACTIVE, FREE_TRIAL, FREE TRIAL
  if (!['ACTIVE', 'FREE_TRIAL'].includes(subStatus)) {
    res.status(402).json({ success: false, message: 'Active subscription required', errorCode: 'PAYMENT_REQUIRED' });
    return;
  }
  
  next();
};
