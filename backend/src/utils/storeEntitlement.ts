import { IUser } from '../models/User';
import { IGym } from '../models/Gym';

export interface StoreEntitlementResult {
  enabled: boolean;
  plan?: string;
  status?: string;
  expiry?: Date;
}

const ACTIVE_STATUSES = ['Active', 'ACTIVE'];

export const isStoreEnabledForUser = (user: IUser): StoreEntitlementResult => {
  const plan = user?.subscriptionPlan;
  const status = user?.subscriptionStatus;
  return {
    enabled: plan === 'PREMIUM' && !!status && ACTIVE_STATUSES.includes(String(status)),
    plan: plan || undefined,
    status: status ? String(status) : undefined,
    expiry: user?.subscriptionExpiry,
  };
};

export const isStoreEnabledForGym = (gym: IGym | null): StoreEntitlementResult => {
  const subscription = gym?.subscription;
  const plan = subscription?.plan;
  const status = subscription?.status;
  return {
    enabled: plan === 'PREMIUM' && !!status && ACTIVE_STATUSES.includes(String(status)),
    plan: plan || undefined,
    status: status || undefined,
    expiry: subscription?.endDate,
  };
};

export const ACTIVE_ORDER_STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery'] as const;
export const CANCELLED_ORDER_STATUSES = ['Cancelled', 'Refunded'] as const;