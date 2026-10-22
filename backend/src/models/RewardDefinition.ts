import mongoose, { Document, Schema } from 'mongoose';

export type RecipientType = 'Customer' | 'Trainer' | 'Both';
export type RewardStatus = 'Draft' | 'Active' | 'Paused' | 'Expired';

export interface IRewardDefinition extends Document {
  gymId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  title: string;
  description: string;
  recipientType: RecipientType;
  category: string; // e.g. 'Discount Coupon', 'Free PT Session', 'Merchandise', 'Certificate', 'Performance Bonus', 'Badge'
  rewardType: string;
  requiredPoints?: number;
  requiredChallengeId?: mongoose.Types.ObjectId;
  // Customer performance evaluation criteria
  minVerifiedVisits?: number;
  minWorkoutCompletions?: number;
  minStreakDays?: number;
  minDietAdherenceDays?: number;
  // Trainer performance evaluation criteria
  minCompletedSessions?: number;
  minAverageRating?: number;
  minReviewedPlans?: number;
  bonusAmount?: number;
  currency?: string;
  startDate?: Date;
  expiryDate?: Date;
  totalQuantity: number; // 0 for unlimited
  claimedCount: number;
  maxClaimsPerUser: number;
  requireApproval: boolean;
  termsAndConditions?: string;
  status: RewardStatus;
  createdAt: Date;
  updatedAt: Date;
}

const rewardDefinitionSchema = new Schema<IRewardDefinition>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    recipientType: {
      type: String,
      enum: ['Customer', 'Trainer', 'Both'],
      default: 'Customer',
      required: true,
      index: true
    },
    category: { type: String, required: true, trim: true },
    rewardType: { type: String, required: true, trim: true },
    requiredPoints: { type: Number, default: 0, min: 0 },
    requiredChallengeId: { type: Schema.Types.ObjectId, ref: 'FitnessChallenge' },
    minVerifiedVisits: { type: Number, default: 0, min: 0 },
    minWorkoutCompletions: { type: Number, default: 0, min: 0 },
    minStreakDays: { type: Number, default: 0, min: 0 },
    minDietAdherenceDays: { type: Number, default: 0, min: 0 },
    minCompletedSessions: { type: Number, default: 0, min: 0 },
    minAverageRating: { type: Number, default: 0, min: 0, max: 5 },
    minReviewedPlans: { type: Number, default: 0, min: 0 },
    bonusAmount: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR', trim: true },
    startDate: { type: Date },
    expiryDate: { type: Date },
    totalQuantity: { type: Number, default: 0, min: 0 }, // 0 = unlimited
    claimedCount: { type: Number, default: 0, min: 0 },
    maxClaimsPerUser: { type: Number, default: 1, min: 1 },
    requireApproval: { type: Boolean, default: false },
    termsAndConditions: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Paused', 'Expired'],
      default: 'Active',
      index: true
    }
  },
  { timestamps: true }
);

rewardDefinitionSchema.index({ gymId: 1, recipientType: 1, status: 1 });

export default mongoose.model<IRewardDefinition>('RewardDefinition', rewardDefinitionSchema);
