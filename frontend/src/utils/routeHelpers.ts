import type { AuthUser } from '../contexts/AuthContext';

export const isSubscriptionActive = (status?: string): boolean => {
  if (!status) return false;
  const s = status.toUpperCase().trim();
  return s === 'ACTIVE' || s === 'FREE TRIAL' || s === 'FREE_TRIAL' || s === 'TRIAL';
};

export const getDashboardRoute = (user: AuthUser): string => {
  const { role, approvalStatus, subscriptionStatus } = user;
  const statusUpper = (approvalStatus || '').toUpperCase().trim();
  const detailUpper = ((user.statusDetail || '') as string).toUpperCase().trim();

  if (role === 'SUPER_ADMIN') return '/super-admin/dashboard';
  
  if (role === 'ADMIN' || role === 'GYM_OWNER') {
    if (detailUpper === 'REJECTED' || statusUpper === 'REJECTED') return '/status?type=rejected';
    if (detailUpper === 'INACTIVE' || statusUpper === 'INACTIVE' || statusUpper === 'SUSPENDED') return '/status?type=inactive';
    if (statusUpper === 'DELETED') return '/status?type=inactive';
    
    if (!isSubscriptionActive(subscriptionStatus)) {
      return '/subscription-plans';
    }
    if (statusUpper === 'PENDING') return '/status?type=pending';
    return '/admin/dashboard';
  }

  if (role === 'GYM_MANAGER') return '/manager/dashboard';
  if (role === 'RECEPTIONIST') return '/receptionist/dashboard';
  if (role === 'TRAINER') return '/trainer/dashboard';
  if (role === 'NUTRITIONIST') return '/nutritionist/dashboard';

  // MEMBER flow
  if (detailUpper === 'INACTIVE' || statusUpper === 'INACTIVE' || statusUpper === 'SUSPENDED' || user.isActive === false) {
    return '/status?type=inactive';
  }
  if (detailUpper === 'REJECTED' || statusUpper === 'REJECTED') return '/status?type=rejected';
  if (detailUpper === 'PENDING' || detailUpper === 'NEW' || statusUpper === 'PENDING') return '/status?type=pending';
  if (statusUpper === 'DELETED') return '/status?type=inactive';

  if (!isSubscriptionActive(subscriptionStatus)) {
    return '/member/dashboard';
  }
  return '/member/dashboard';
};

