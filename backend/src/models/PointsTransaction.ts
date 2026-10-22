import mongoose, { Document, Schema } from 'mongoose';

export type PointsTransactionType = 'EARN_ACTIVITY' | 'EARN_BONUS' | 'REDEEM_REWARD' | 'ADMIN_ADJUST';

export interface IPointsTransaction extends Document {
  gymId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: PointsTransactionType;
  amount: number; // positive for earned, negative for redeemed
  balanceAfter: number;
  challengeId?: mongoose.Types.ObjectId;
  rewardId?: mongoose.Types.ObjectId;
  claimId?: mongoose.Types.ObjectId;
  description: string;
  sourceEvent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const pointsTransactionSchema = new Schema<IPointsTransaction>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['EARN_ACTIVITY', 'EARN_BONUS', 'REDEEM_REWARD', 'ADMIN_ADJUST'],
      required: true
    },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    challengeId: { type: Schema.Types.ObjectId, ref: 'FitnessChallenge' },
    rewardId: { type: Schema.Types.ObjectId, ref: 'RewardDefinition' },
    claimId: { type: Schema.Types.ObjectId, ref: 'RewardClaim' },
    description: { type: String, required: true, trim: true },
    sourceEvent: { type: String, trim: true }
  },
  { timestamps: true }
);

pointsTransactionSchema.index({ gymId: 1, userId: 1, createdAt: -1 });

export default mongoose.model<IPointsTransaction>('PointsTransaction', pointsTransactionSchema);
