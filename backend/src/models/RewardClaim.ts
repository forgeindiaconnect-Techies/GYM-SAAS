import mongoose, { Document, Schema } from 'mongoose';

export type ClaimStatusType = 'Pending' | 'Approved' | 'Rejected' | 'Redeemed' | 'Expired';
export type FinancialPayoutStatusType = 'Not Applicable' | 'Pending Approval' | 'Approved' | 'Payment Pending' | 'Paid' | 'Pending';

export interface IRewardClaim extends Document {
  gymId: mongoose.Types.ObjectId;
  rewardId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userRole: 'MEMBER' | 'TRAINER';
  challengeId?: mongoose.Types.ObjectId;
  claimCode: string;
  pointsDeducted: number;
  claimStatus: ClaimStatusType;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  redeemedAt?: Date;
  financialPayoutStatus: FinancialPayoutStatusType;
  financialPayoutReference?: string;
  financialPayoutDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const rewardClaimSchema = new Schema<IRewardClaim>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    rewardId: { type: Schema.Types.ObjectId, ref: 'RewardDefinition', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userRole: {
      type: String,
      enum: ['MEMBER', 'TRAINER'],
      required: true
    },
    challengeId: { type: Schema.Types.ObjectId, ref: 'FitnessChallenge' },
    claimCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    pointsDeducted: { type: Number, default: 0, min: 0 },
    claimStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Redeemed', 'Expired'],
      default: 'Pending',
      index: true
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
    redeemedAt: { type: Date },
    financialPayoutStatus: {
      type: String,
      enum: ['Not Applicable', 'Pending Approval', 'Approved', 'Payment Pending', 'Paid', 'Pending'],
      default: 'Not Applicable'
    },
    financialPayoutReference: { type: String, trim: true },
    financialPayoutDate: { type: Date },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

rewardClaimSchema.index({ gymId: 1, userId: 1, createdAt: -1 });
rewardClaimSchema.index({ gymId: 1, claimStatus: 1 });

export default mongoose.model<IRewardClaim>('RewardClaim', rewardClaimSchema);
