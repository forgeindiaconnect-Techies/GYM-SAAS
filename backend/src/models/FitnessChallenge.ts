import mongoose, { Document, Schema } from 'mongoose';

export type ChallengeType = 'Attendance' | 'Workout Completion' | 'Consistency Streak';
export type ChallengeStatus = 'Draft' | 'Published' | 'Paused' | 'Completed';

export interface IFitnessChallenge extends Document {
  gymId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  title: string;
  description: string;
  challengeType: ChallengeType;
  startDate: Date;
  endDate: Date;
  targetValue: number;
  targetUnit: string;
  pointsPerActivity: number;
  completionBonusPoints: number;
  badgeName: string;
  badgeIcon: string;
  eligiblePackageIds: mongoose.Types.ObjectId[];
  rewardId?: mongoose.Types.ObjectId;
  rewardQuantity?: number;
  rewardClaimedCount: number;
  rewardExpiryDate?: Date;
  requireApproval: boolean;
  isLeaderboardEnabled: boolean;
  status: ChallengeStatus;
  participantCount: number;
  completionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const fitnessChallengeSchema = new Schema<IFitnessChallenge>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    challengeType: {
      type: String,
      enum: ['Attendance', 'Workout Completion', 'Consistency Streak'],
      required: true,
      index: true
    },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    targetValue: { type: Number, required: true, min: 1 },
    targetUnit: { type: String, required: true, default: 'Visits' },
    pointsPerActivity: { type: Number, default: 10, min: 0 },
    completionBonusPoints: { type: Number, default: 50, min: 0 },
    badgeName: { type: String, default: 'Fitness Champion', trim: true },
    badgeIcon: { type: String, default: 'Award', trim: true },
    eligiblePackageIds: [{ type: Schema.Types.ObjectId, ref: 'GymPackage' }],
    rewardId: { type: Schema.Types.ObjectId, ref: 'RewardDefinition' },
    rewardQuantity: { type: Number, default: 0, min: 0 },
    rewardClaimedCount: { type: Number, default: 0, min: 0 },
    rewardExpiryDate: { type: Date },
    requireApproval: { type: Boolean, default: false },
    isLeaderboardEnabled: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Paused', 'Completed'],
      default: 'Published',
      index: true
    },
    participantCount: { type: Number, default: 0, min: 0 },
    completionCount: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

fitnessChallengeSchema.index({ gymId: 1, status: 1, startDate: 1 });

export default mongoose.model<IFitnessChallenge>('FitnessChallenge', fitnessChallengeSchema);
