import mongoose, { Document, Schema } from 'mongoose';

export interface IEarnedBadge {
  badgeName: string;
  badgeIcon: string;
  challengeTitle?: string;
  challengeId?: mongoose.Types.ObjectId;
  earnedAt: Date;
}

export interface ICustomerPointsWallet extends Document {
  gymId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  currentBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  badges: IEarnedBadge[];
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const earnedBadgeSchema = new Schema<IEarnedBadge>(
  {
    badgeName: { type: String, required: true, trim: true },
    badgeIcon: { type: String, default: 'Award', trim: true },
    challengeTitle: { type: String, trim: true },
    challengeId: { type: Schema.Types.ObjectId, ref: 'FitnessChallenge' },
    earnedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const customerPointsWalletSchema = new Schema<ICustomerPointsWallet>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    currentBalance: { type: Number, default: 0, min: 0 },
    totalEarned: { type: Number, default: 0, min: 0 },
    totalRedeemed: { type: Number, default: 0, min: 0 },
    badges: [earnedBadgeSchema],
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

customerPointsWalletSchema.index({ gymId: 1, userId: 1 }, { unique: true });

export default mongoose.model<ICustomerPointsWallet>('CustomerPointsWallet', customerPointsWalletSchema);
