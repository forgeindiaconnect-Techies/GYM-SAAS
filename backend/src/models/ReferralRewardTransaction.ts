import mongoose, { Document, Schema } from 'mongoose';

export type ReferralRewardTransactionType =
  | 'Membership Credit'
  | 'Wallet Points'
  | 'Free Membership Days'
  | 'Membership Discount'
  | 'Cash Payout';

export type ReferralRewardTransactionStatus =
  | 'Available'
  | 'Pending'
  | 'Redeemed'
  | 'Expired'
  | 'Reversed';

export interface IReferralRewardTransaction extends Document {
  gymId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  referralId?: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  rewardType: ReferralRewardTransactionType;
  amount: number;
  status: ReferralRewardTransactionStatus;
  sourceEvent: string;
  issuedAt: Date;
  redeemedAt?: Date;
  expiryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const referralRewardTransactionSchema = new Schema<IReferralRewardTransaction>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    referralId: { type: Schema.Types.ObjectId, ref: 'Referral' },
    campaignId: { type: Schema.Types.ObjectId, ref: 'ReferralCampaign' },
    rewardType: {
      type: String,
      enum: [
        'Membership Credit',
        'Wallet Points',
        'Free Membership Days',
        'Membership Discount',
        'Cash Payout'
      ],
      required: true
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Available', 'Pending', 'Redeemed', 'Expired', 'Reversed'],
      default: 'Available',
      index: true
    },
    sourceEvent: { type: String, required: true, trim: true },
    issuedAt: { type: Date, default: Date.now },
    redeemedAt: { type: Date },
    expiryDate: { type: Date },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

referralRewardTransactionSchema.index({ gymId: 1, userId: 1, status: 1 });
referralRewardTransactionSchema.index({ gymId: 1, userId: 1, createdAt: -1 });

export default mongoose.model<IReferralRewardTransaction>(
  'ReferralRewardTransaction',
  referralRewardTransactionSchema
);
