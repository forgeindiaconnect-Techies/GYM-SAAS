import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    gymId?: string;
    approvalStatus?: string;
    subscriptionStatus?: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Unauthorized', errorCode: 'MISSING_TOKEN' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token', errorCode: 'INVALID_TOKEN' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges', errorCode: 'INSUFFICIENT_PRIVILEGES' });
      return;
    }
    next();
  };
};

export const requireActiveGymOwner = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'GYM_OWNER') {
    res.status(403).json({ success: false, message: 'Forbidden: Only gym owners are allowed', errorCode: 'NOT_GYM_OWNER' });
    return;
  }
  
  if (req.user.approvalStatus !== 'APPROVED') {
    res.status(403).json({ success: false, message: 'Gym registration is not approved yet', errorCode: 'NOT_APPROVED' });
    return;
  }
  
  if (req.user.subscriptionStatus !== 'ACTIVE') {
    res.status(402).json({ success: false, message: 'Active subscription required', errorCode: 'PAYMENT_REQUIRED' });
    return;
  }
  
  next();
};
