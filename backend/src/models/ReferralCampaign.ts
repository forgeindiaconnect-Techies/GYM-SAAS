import mongoose, { Document, Schema } from 'mongoose';

export type CampaignStatus = 'Draft' | 'Active' | 'Paused' | 'Completed';
export type ReferrerRewardType = 'Wallet Points' | 'Membership Credit' | 'Free Membership Days' | 'Cash Payout';
export type RefereeRewardType = 'Membership Discount' | 'Wallet Points' | 'Free Membership Days';
export type DiscountType = 'Fixed' | 'Percentage';

export interface IReferralCampaign extends Document {
  gymId: mongoose.Types.ObjectId;
  campaignName: string;
  campaignDescription?: string;
  startDate: Date;
  endDate: Date;
  status: CampaignStatus;

  // Existing Customer (Referrer) Reward Configuration
  referrerRewardType: ReferrerRewardType;
  referrerRewardValue: number; // e.g. 300 (INR) or 200 (Points) or 7 (Days)

  // New Customer (Referee) Reward Configuration
  refereeRewardType: RefereeRewardType;
  refereeRewardValue: number; // e.g. 200 (INR) or 10 (%) or 100 (Points)
  refereeDiscountType: DiscountType; // 'Fixed' or 'Percentage'

  // Eligibility & Guardrails
  minMembershipPurchase: number; // Min plan cost to qualify (e.g. 500)
  eligiblePlans: string[]; // Plan names or empty array for all plans
  maxReferralsPerUser: number; // 0 for unlimited
  campaignReferralLimit: number; // 0 for unlimited
  rewardBudget: number; // Max total budget (0 for unlimited)
  budgetSpent: number;

  termsAndConditions?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const referralCampaignSchema = new Schema<IReferralCampaign>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    campaignName: { type: String, required: true, trim: true },
    campaignDescription: { type: String, trim: true, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Paused', 'Completed'],
      default: 'Active',
      index: true
    },
    referrerRewardType: {
      type: String,
      enum: ['Wallet Points', 'Membership Credit', 'Free Membership Days', 'Cash Payout'],
      default: 'Membership Credit'
    },
    referrerRewardValue: { type: Number, required: true, min: 0, default: 300 },
    refereeRewardType: {
      type: String,
      enum: ['Membership Discount', 'Wallet Points', 'Free Membership Days'],
      default: 'Membership Discount'
    },
    refereeRewardValue: { type: Number, required: true, min: 0, default: 200 },
    refereeDiscountType: {
      type: String,
      enum: ['Fixed', 'Percentage'],
      default: 'Fixed'
    },
    minMembershipPurchase: { type: Number, default: 0, min: 0 },
    eligiblePlans: [{ type: String, trim: true }],
    maxReferralsPerUser: { type: Number, default: 0, min: 0 },
    campaignReferralLimit: { type: Number, default: 0, min: 0 },
    rewardBudget: { type: Number, default: 0, min: 0 },
    budgetSpent: { type: Number, default: 0, min: 0 },
    termsAndConditions: {
      type: String,
      default: 'Referral rewards are issued upon verified payment of an eligible membership plan.'
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

referralCampaignSchema.index({ gymId: 1, status: 1 });
referralCampaignSchema.index({ gymId: 1, startDate: 1, endDate: 1 });

export default mongoose.model<IReferralCampaign>('ReferralCampaign', referralCampaignSchema);
