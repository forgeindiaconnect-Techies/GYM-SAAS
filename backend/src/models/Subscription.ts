import mongoose, { Document, Schema } from 'mongoose';

export enum SubscriptionPlan {
  FREE_TRIAL = 'FREE_TRIAL',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
  TRIAL = 'trial',
}

export enum SubscriptionPaymentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  status: SubscriptionPaymentStatus;
  startDate: Date;
  endDate: Date;
  amount: number;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: Object.values(SubscriptionPlan), required: true },
    billingCycle: { type: String, enum: Object.values(BillingCycle), required: true },
    status: {
      type: String,
      enum: Object.values(SubscriptionPaymentStatus),
      default: SubscriptionPaymentStatus.ACTIVE,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Manual' },
    transactionId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);
