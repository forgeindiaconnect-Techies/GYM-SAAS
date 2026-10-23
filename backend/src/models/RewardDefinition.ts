import mongoose, { Document, Schema } from 'mongoose';

export type RecipientType = 'Customer' | 'Trainer' | 'Both';
export type RewardStatus = 'Draft' | 'Active' | 'Paused' | 'Expired';
export type AssignmentMethod = 'Direct' | 'Achievement' | 'Points';

export interface IRewardDefinition extends Document {
  gymId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  title: string;
  description: string;
  recipientType: RecipientType;
  assignmentMethod: AssignmentMethod;
  category: string;
  rewardType: string;
  icon?: string;
  imageUrl?: string;

  // Direct Assignment Recipients
  assignedUserId?: mongoose.Types.ObjectId;
  assignedUserIds?: mongoose.Types.ObjectId[];

  // Dynamic Category Details
  // A. Personal Training
  trainerId?: mongoose.Types.ObjectId;
  sessionCount?: number;
  sessionDuration?: string;

  // B. Discount Coupon
  discountType?: 'Percentage' | 'Fixed';
  discountValue?: number;
  applicableService?: 'Membership' | 'Personal Training' | 'Products' | 'All Services';
  minPurchaseAmount?: number;

  // C. Free Product / Gift
  productId?: mongoose.Types.ObjectId;
  productName?: string;
  productQuantity?: number;

  // D. Free Membership / Extension
  membershipDuration?: string;
  packageId?: mongoose.Types.ObjectId;
  packageName?: string;

  // E. Performance Award
  awardReason?: string;
  achievementPeriod?: string;
  hasCertificate?: boolean;
  badgeIcon?: string;

  // F. Points-Based Reward & Eligibility Condition
  requiredPoints?: number;
  redemptionBenefit?: string;
  eligibilityCondition?: 'visits' | 'workouts' | 'streak' | 'goals' | 'milestone' | 'free' | 'points';
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
    assignmentMethod: {
      type: String,
      enum: ['Direct', 'Achievement', 'Points'],
      default: 'Points',
      index: true
    },
    category: { type: String, required: true, trim: true },
    rewardType: { type: String, required: true, trim: true },
    icon: { type: String, default: 'Gift', trim: true },
    imageUrl: { type: String, trim: true },

    // Direct Assignment
    assignedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedUserIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    // Category Specifics
    trainerId: { type: Schema.Types.ObjectId, ref: 'User' },
    sessionCount: { type: Number, default: 0 },
    sessionDuration: { type: String, trim: true },

    discountType: { type: String, enum: ['Percentage', 'Fixed'], default: 'Percentage' },
    discountValue: { type: Number, default: 0 },
    applicableService: {
      type: String,
      enum: ['Membership', 'Personal Training', 'Products', 'All Services'],
      default: 'All Services'
    },
    minPurchaseAmount: { type: Number, default: 0 },

    productId: { type: Schema.Types.ObjectId, ref: 'StoreProduct' },
    productName: { type: String, trim: true },
    productQuantity: { type: Number, default: 1 },

    membershipDuration: { type: String, trim: true },
    packageId: { type: Schema.Types.ObjectId, ref: 'GymPackage' },
    packageName: { type: String, trim: true },

    awardReason: { type: String, trim: true },
    achievementPeriod: { type: String, trim: true },
    hasCertificate: { type: Boolean, default: false },
    badgeIcon: { type: String, trim: true },

    requiredPoints: { type: Number, default: 0, min: 0 },
    redemptionBenefit: { type: String, trim: true },
    eligibilityCondition: {
      type: String,
      enum: ['visits', 'workouts', 'streak', 'goals', 'milestone', 'free', 'points'],
      default: 'points'
    },
    requiredChallengeId: { type: Schema.Types.ObjectId, ref: 'FitnessChallenge' },

    // Criteria
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
rewardDefinitionSchema.index({ gymId: 1, assignmentMethod: 1 });

export default mongoose.model<IRewardDefinition>('RewardDefinition', rewardDefinitionSchema);
