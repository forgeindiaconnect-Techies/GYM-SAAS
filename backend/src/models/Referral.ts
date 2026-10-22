import mongoose, { Document, Schema } from 'mongoose';

export type ReferralStatus =
  | 'Invited'
  | 'Registered'
  | 'Membership Pending'
  | 'Payment Verified'
  | 'Reward Pending'
  | 'Reward Issued'
  | 'Expired'
  | 'Cancelled'
  | 'Rejected';

export type RewardStatus = 'Pending' | 'Issued' | 'Applied at Checkout' | 'Redeemed' | 'Reversed' | 'Cancelled';

export interface IReferral extends Document {
  gymId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  referrerId: mongoose.Types.ObjectId; // Existing Customer who invited
  referredId: mongoose.Types.ObjectId; // New Customer invited
  referralCode: string;

  // Membership & Payment Details
  membershipId?: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId;
  paymentReference?: string;
  membershipPlanName?: string;
  planAmount?: number;
  discountApplied?: number;
  finalPaymentAmount?: number;

  // Lifecycle Status
  status: ReferralStatus;

  // Referrer Reward Tracking
  referrerRewardStatus: RewardStatus;
  referrerRewardType: string;
  referrerRewardAmount: number;
  referrerRewardIssuedAt?: Date;

  // Referee Reward Tracking
  refereeRewardStatus: RewardStatus;
  refereeRewardType: string;
  refereeRewardAmount: number;
  refereeRewardIssuedAt?: Date;

  // Audit and notes
  ineligibilityReason?: string;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const referralSchema = new Schema<IReferral>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'ReferralCampaign', required: true, index: true },
    referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    referredId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    referralCode: { type: String, required: true, trim: true, index: true },

    membershipId: { type: Schema.Types.ObjectId, ref: 'CustomerMembership' },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    paymentReference: { type: String, trim: true },
    membershipPlanName: { type: String, trim: true },
    planAmount: { type: Number, default: 0 },
    discountApplied: { type: Number, default: 0 },
    finalPaymentAmount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: [
        'Invited',
        'Registered',
        'Membership Pending',
        'Payment Verified',
        'Reward Pending',
        'Reward Issued',
        'Expired',
        'Cancelled',
        'Rejected'
      ],
      default: 'Registered',
      index: true
    },

    referrerRewardStatus: {
      type: String,
      enum: ['Pending', 'Issued', 'Applied at Checkout', 'Redeemed', 'Reversed', 'Cancelled'],
      default: 'Pending',
      index: true
    },
    referrerRewardType: { type: String, default: 'Membership Credit' },
    referrerRewardAmount: { type: Number, default: 0 },
    referrerRewardIssuedAt: { type: Date },

    refereeRewardStatus: {
      type: String,
      enum: ['Pending', 'Issued', 'Applied at Checkout', 'Redeemed', 'Reversed', 'Cancelled'],
      default: 'Pending',
      index: true
    },
    refereeRewardType: { type: String, default: 'Membership Discount' },
    refereeRewardAmount: { type: Number, default: 0 },
    refereeRewardIssuedAt: { type: Date },

    ineligibilityReason: { type: String, trim: true },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

// Prevent duplicate referral record between same referrer and referee in same gym
referralSchema.index({ gymId: 1, referrerId: 1, referredId: 1 }, { unique: true });
referralSchema.index({ gymId: 1, referralCode: 1, status: 1 });

export default mongoose.model<IReferral>('Referral', referralSchema);
