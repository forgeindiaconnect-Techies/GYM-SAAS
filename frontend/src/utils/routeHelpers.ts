import type { AuthUser } from '../contexts/AuthContext';

export const getDashboardRoute = (user: AuthUser): string => {
  const { role, approvalStatus, subscriptionStatus } = user;

  if (role === 'SUPER_ADMIN') return '/super-admin/dashboard';
  
  if (role === 'ADMIN' || role === 'GYM_OWNER') {
    if (approvalStatus === 'PENDING') return '/status?type=pending';
    if (approvalStatus === 'REJECTED') return '/status?type=rejected';
    if (approvalStatus === 'SUSPENDED') return '/status?type=suspended';
    
    if (approvalStatus === 'APPROVED') {
      if (subscriptionStatus === 'NONE' || subscriptionStatus === 'EXPIRED') return '/gym-owner/subscription';
      return '/admin/dashboard';
    }
  }

  if (role === 'GYM_MANAGER') return '/manager/dashboard';
  if (role === 'RECEPTIONIST') return '/receptionist/dashboard';
  if (role === 'TRAINER') return '/trainer/dashboard';
  if (role === 'NUTRITIONIST') return '/nutritionist/dashboard';

  // MEMBER flow
  if (approvalStatus === 'PENDING') return '/status?type=pending';
  if (approvalStatus === 'REJECTED') return '/status?type=rejected';
  if (approvalStatus === 'APPROVED') {
    if (subscriptionStatus === 'NONE') return '/subscription-plans';
    return '/member/dashboard';
  }

  return '/';
};
