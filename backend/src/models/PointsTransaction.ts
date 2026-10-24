import mongoose, { Document, Schema } from 'mongoose';

export type PointsTransactionType =
  | 'EARN_ACTIVITY'
  | 'EARN_BONUS'
  | 'EARN_REFERRAL'
  | 'REDEEM_REWARD'
  | 'REDEEM_MEMBERSHIP'
  | 'REDEEM_STORE'
  | 'ADMIN_ADJUST'
  | 'REFUND_POINTS';

export interface IPointsTransaction extends Document {
  gymId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: PointsTransactionType;
  amount: number; // positive for earned/refunded/added, negative for redeemed/deducted
  balanceAfter: number;
  challengeId?: mongoose.Types.ObjectId;
  rewardId?: mongoose.Types.ObjectId;
  claimId?: mongoose.Types.ObjectId;
  description: string;
  sourceEvent?: string;
  conversionRateUsed?: string; // e.g. "100 pts = ₹50"
  discountAmount?: number;     // ₹ equivalent discount generated
  reason?: string;             // Required for ADMIN_ADJUST
  adjustedBy?: mongoose.Types.ObjectId; // User ID of gym owner who made manual adjustment
  orderReference?: string;     // Membership receipt # or Store Order #
  createdAt: Date;
  updatedAt: Date;
}

const pointsTransactionSchema = new Schema<IPointsTransaction>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'EARN_ACTIVITY',
        'EARN_BONUS',
        'EARN_REFERRAL',
        'REDEEM_REWARD',
        'REDEEM_MEMBERSHIP',
        'REDEEM_STORE',
        'ADMIN_ADJUST',
        'REFUND_POINTS'
      ],
      required: true
    },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    challengeId: { type: Schema.Types.ObjectId, ref: 'FitnessChallenge' },
    rewardId: { type: Schema.Types.ObjectId, ref: 'RewardDefinition' },
    claimId: { type: Schema.Types.ObjectId, ref: 'RewardClaim' },
    description: { type: String, required: true, trim: true },
    sourceEvent: { type: String, trim: true },
    conversionRateUsed: { type: String, trim: true },
    discountAmount: { type: Number, default: 0 },
    reason: { type: String, trim: true },
    adjustedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    orderReference: { type: String, trim: true }
  },
  { timestamps: true }
);

pointsTransactionSchema.index({ gymId: 1, userId: 1, createdAt: -1 });

export default mongoose.model<IPointsTransaction>('PointsTransaction', pointsTransactionSchema);
