import mongoose, { Document, Schema } from 'mongoose';

export interface IAwardCertificate extends Document {
  certificateId: string;
  gymId: mongoose.Types.ObjectId;
  awardId: mongoose.Types.ObjectId;
  winnerUserId: mongoose.Types.ObjectId;
  gymOwnerId: mongoose.Types.ObjectId;
  gymName: string;
  gymLogo?: string;
  winnerName: string;
  winnerRole: 'MEMBER' | 'TRAINER';
  awardTitle: string;
  awardCategory: string;
  awardDescription: string;
  awardPeriod: string;
  achievementDate: Date;
  metricAchieved?: string;
  ownerName: string;
  ownerDesignation: string;
  ownerSignatureImage?: string;
  signatureType: 'DIGITAL' | 'MANUAL';
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const awardCertificateSchema = new Schema<IAwardCertificate>(
  {
    certificateId: { type: String, required: true, unique: true, index: true, trim: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    awardId: { type: Schema.Types.ObjectId, ref: 'AwardRecognition', required: true, index: true },
    winnerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gymOwnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gymName: { type: String, required: true, trim: true },
    gymLogo: { type: String, trim: true },
    winnerName: { type: String, required: true, trim: true },
    winnerRole: { type: String, enum: ['MEMBER', 'TRAINER'], required: true },
    awardTitle: { type: String, required: true, trim: true },
    awardCategory: { type: String, required: true, trim: true },
    awardDescription: { type: String, required: true, trim: true },
    awardPeriod: { type: String, required: true, trim: true },
    achievementDate: { type: Date, required: true },
    metricAchieved: { type: String, trim: true },
    ownerName: { type: String, required: true, trim: true },
    ownerDesignation: { type: String, default: 'Gym Owner', trim: true },
    ownerSignatureImage: { type: String },
    signatureType: { type: String, enum: ['DIGITAL', 'MANUAL'], default: 'DIGITAL' },
    issuedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Prevent duplicate certificates for the same award winner
awardCertificateSchema.index({ awardId: 1, winnerUserId: 1 }, { unique: true });

export default mongoose.model<IAwardCertificate>('AwardCertificate', awardCertificateSchema);

