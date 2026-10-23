import mongoose, { Document, Schema } from 'mongoose';

export type AwardRecipientType = 'Customer' | 'Trainer';
export type AwardPeriodType = 'Monthly' | 'Quarterly' | 'Annual' | 'Custom';
export type AwardStatusType = 'Draft' | 'Active' | 'Under Review' | 'Published' | 'Archived';
export type WinnerSelectionType = 'AUTOMATIC_TOP_PERFORMER' | 'OWNER_CONFIRMATION';

export interface IAwardRecognition extends Document {
  gymId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  title: string;
  recipientType: AwardRecipientType;
  category: string;
  description: string;
  badgeIcon: string;
  awardPeriod: AwardPeriodType;
  startDate?: Date;
  endDate?: Date;
  announcementDate?: Date;
  criteriaMetric: string;
  minCriteriaValue?: number;
  winnerSelectionMethod: WinnerSelectionType;
  prizeBonusAmount?: number;
  prizeDescription?: string;
  status: AwardStatusType;
  winnerUserId?: mongoose.Types.ObjectId;
  winnerName?: string;
  winnerRole?: 'MEMBER' | 'TRAINER';
  winnerMetricAchieved?: string;
  certificateId?: string;
  certificateIssuedAt?: Date;
  publishedAt?: Date;
  publicConsent: boolean;
  allowDuplicateWinner: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const awardRecognitionSchema = new Schema<IAwardRecognition>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    recipientType: {
      type: String,
      enum: ['Customer', 'Trainer'],
      required: true,
      index: true
    },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    badgeIcon: { type: String, default: 'Trophy', trim: true },
    awardPeriod: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Annual', 'Custom'],
      default: 'Monthly'
    },
    startDate: { type: Date },
    endDate: { type: Date },
    announcementDate: { type: Date },
    criteriaMetric: {
      type: String,
      default: 'workout_completions',
      trim: true
    },
    minCriteriaValue: { type: Number, default: 0 },
    winnerSelectionMethod: {
      type: String,
      enum: ['AUTOMATIC_TOP_PERFORMER', 'OWNER_CONFIRMATION'],
      default: 'OWNER_CONFIRMATION'
    },
    prizeBonusAmount: { type: Number, default: 0, min: 0 },
    prizeDescription: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Under Review', 'Published', 'Archived'],
      default: 'Draft',
      index: true
    },
    winnerUserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    winnerName: { type: String, trim: true },
    winnerRole: { type: String, enum: ['MEMBER', 'TRAINER'] },
    winnerMetricAchieved: { type: String, trim: true },
    certificateId: { type: String, trim: true, index: true },
    certificateIssuedAt: { type: Date },
    publishedAt: { type: Date },
    publicConsent: { type: Boolean, default: false },
    allowDuplicateWinner: { type: Boolean, default: false }
  },
  { timestamps: true }
);

awardRecognitionSchema.index({ gymId: 1, recipientType: 1, status: 1 });
awardRecognitionSchema.index({ gymId: 1, winnerUserId: 1, awardPeriod: 1 });

export default mongoose.model<IAwardRecognition>('AwardRecognition', awardRecognitionSchema);
