import type { AuthUser } from '../contexts/AuthContext';

export const isSubscriptionActive = (status?: string): boolean => {
  if (!status) return false;
  const s = status.toUpperCase().trim();
  return s === 'ACTIVE' || s === 'FREE TRIAL' || s === 'FREE_TRIAL';
};

export const getDashboardRoute = (user: AuthUser): string => {
  const { role, approvalStatus, subscriptionStatus } = user;

  if (role === 'SUPER_ADMIN') return '/super-admin/dashboard';
  
  if (role === 'ADMIN' || role === 'GYM_OWNER') {
    if (approvalStatus === 'PENDING') return '/status?type=pending';
    if (approvalStatus === 'REJECTED') return '/status?type=rejected';
    if (approvalStatus === 'SUSPENDED') return '/status?type=suspended';
    
    if (approvalStatus === 'APPROVED') {
      if (!isSubscriptionActive(subscriptionStatus)) {
        return '/gym-owner/subscription';
      }
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
    if (!isSubscriptionActive(subscriptionStatus)) {
      return '/subscription-plans';
    }
    return '/member/dashboard';
  }

  return '/';
};

