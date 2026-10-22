import mongoose, { Document, Schema } from 'mongoose';

export type ClaimStatus =
  | 'Not Eligible'
  | 'Eligible'
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Claimed'
  | 'Expired';

export interface IChallengeParticipant extends Document {
  challengeId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  enrolledAt: Date;
  currentProgress: number;
  targetValue: number;
  completed: boolean;
  completedAt?: Date;
  pointsEarned: number;
  bonusAwarded: boolean;
  badgeEarned: boolean;
  rewardClaimStatus: ClaimStatus;
  rewardClaimedAt?: Date;
  rewardRejectionReason?: string;
  claimCode?: string;
  lastActivityDate?: Date;
  streakDays: number;
  trainerFeedback?: string;
  trainerFeedbackAt?: Date;
  verifiedByTrainerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const challengeParticipantSchema = new Schema<IChallengeParticipant>(
  {
    challengeId: { type: Schema.Types.ObjectId, ref: 'FitnessChallenge', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    enrolledAt: { type: Date, default: Date.now },
    currentProgress: { type: Number, default: 0, min: 0 },
    targetValue: { type: Number, required: true, min: 1 },
    completed: { type: Boolean, default: false, index: true },
    completedAt: { type: Date },
    pointsEarned: { type: Number, default: 0, min: 0 },
    bonusAwarded: { type: Boolean, default: false },
    badgeEarned: { type: Boolean, default: false },
    rewardClaimStatus: {
      type: String,
      enum: ['Not Eligible', 'Eligible', 'Pending Approval', 'Approved', 'Rejected', 'Claimed', 'Expired'],
      default: 'Not Eligible',
      index: true
    },
    rewardClaimedAt: { type: Date },
    rewardRejectionReason: { type: String, trim: true },
    claimCode: { type: String, trim: true },
    lastActivityDate: { type: Date },
    streakDays: { type: Number, default: 0, min: 0 },
    trainerFeedback: { type: String, trim: true },
    trainerFeedbackAt: { type: Date },
    verifiedByTrainerId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Prevent duplicate enrollment in the same challenge
challengeParticipantSchema.index({ challengeId: 1, customerId: 1 }, { unique: true });
challengeParticipantSchema.index({ gymId: 1, completed: 1, currentProgress: -1 });

export default mongoose.model<IChallengeParticipant>('ChallengeParticipant', challengeParticipantSchema);
