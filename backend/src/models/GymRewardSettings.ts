import mongoose, { Document, Schema } from 'mongoose';

export interface IGymRewardSettings extends Document {
  gymId: mongoose.Types.ObjectId;
  // Conversion Rate: default 100 points = ₹50
  pointsPerConversionUnit: number; // default: 100
  currencyValuePerUnit: number;    // default: 50 (₹)

  // Guardrails
  minPointsForRedemption: number;  // default: 100
  maxDiscountPerTransaction: number; // 0 for unlimited (₹)

  // Redemption Options
  enableMembershipDiscount: boolean; // default: true
  enableStorePurchase: boolean;      // default: true
  enableCustomRewards: boolean;      // default: true

  // Eligibility Filters
  eligibleMembershipPlans: string[]; // empty array = all plans
  eligibleStoreProducts: string[];   // empty array = all products
  storeRedemptionScope: 'ALL' | 'SELECTED'; // default: 'ALL'

  // Validity & Instructions
  pointsExpiryDays: number; // 0 for no expiry
  rewardInstructions: string;
  termsAndConditions?: string;

  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const gymRewardSettingsSchema = new Schema<IGymRewardSettings>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, unique: true, index: true },
    pointsPerConversionUnit: { type: Number, default: 100, min: 1 },
    currencyValuePerUnit: { type: Number, default: 50, min: 1 },
    minPointsForRedemption: { type: Number, default: 100, min: 0 },
    maxDiscountPerTransaction: { type: Number, default: 0, min: 0 },

    enableMembershipDiscount: { type: Boolean, default: true },
    enableStorePurchase: { type: Boolean, default: true },
    enableCustomRewards: { type: Boolean, default: true },

    eligibleMembershipPlans: [{ type: String, trim: true }],
    eligibleStoreProducts: [{ type: String, trim: true }],
    storeRedemptionScope: { type: String, enum: ['ALL', 'SELECTED'], default: 'ALL' },

    pointsExpiryDays: { type: Number, default: 0, min: 0 },
    rewardInstructions: {
      type: String,
      default: 'Earn points by referring your friends to join our gym! Redeem your points for Membership Plan Discounts, Gym Store Purchases, or Custom Rewards.'
    },
    termsAndConditions: {
      type: String,
      default: 'Points cannot be converted into cash. Points are deducted upon verified checkout. Standard gym cancellation and refund policies apply.'
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model<IGymRewardSettings>('GymRewardSettings', gymRewardSettingsSchema);
