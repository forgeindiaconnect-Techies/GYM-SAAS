import mongoose, { Document, Schema } from 'mongoose';

export type HiringRequestStatus = 
  | 'Pending' 
  | 'Negotiating' 
  | 'Accepted' 
  | 'Rejected' 
  | 'Confirmed' 
  | 'Withdrawn';

export interface INegotiationMessage {
  senderRole: 'GYM_OWNER' | 'TRAINER';
  senderId: mongoose.Types.ObjectId;
  proposedSalary?: number;
  proposedPtFee?: number;
  proposedTerms?: string;
  message?: string;
  timestamp: Date;
}

export interface IHiringRequest extends Document {
  gymId: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId; // Trainer doc or User doc
  trainerUserId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId; // Gym Owner User ID
  gymName: string;
  gymLocation: string;
  trainerName: string;
  trainerEmail?: string;
  trainerPhone?: string;
  role: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract';
  offeredCompensation: number; // Monthly salary or contract pay
  personalTrainingFee?: number; // Per session fee
  workingHours?: string;
  jobResponsibilities: string;
  requiredExpertise?: string;
  expectedJoiningDate: string;
  additionalTerms?: string;
  message?: string;
  status: HiringRequestStatus;
  negotiationHistory: INegotiationMessage[];
  declineReason?: string;
  confirmedAt?: Date;
  confirmedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const negotiationMessageSchema = new Schema<INegotiationMessage>({
  senderRole: { type: String, enum: ['GYM_OWNER', 'TRAINER'], required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  proposedSalary: { type: Number },
  proposedPtFee: { type: Number },
  proposedTerms: { type: String },
  message: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const hiringRequestSchema = new Schema<IHiringRequest>({
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
  trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true, index: true },
  trainerUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  gymName: { type: String, required: true },
  gymLocation: { type: String, required: true },
  trainerName: { type: String, required: true },
  trainerEmail: { type: String },
  trainerPhone: { type: String },
  role: { type: String, required: true },
  employmentType: { 
    type: String, 
    enum: ['Full-time', 'Part-time', 'Contract'], 
    required: true 
  },
  offeredCompensation: { type: Number, required: true },
  personalTrainingFee: { type: Number, default: 0 },
  workingHours: { type: String },
  jobResponsibilities: { type: String, required: true },
  requiredExpertise: { type: String },
  expectedJoiningDate: { type: String, required: true },
  additionalTerms: { type: String },
  message: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Negotiating', 'Accepted', 'Rejected', 'Confirmed', 'Withdrawn'], 
    default: 'Pending',
    index: true 
  },
  negotiationHistory: [negotiationMessageSchema],
  declineReason: { type: String },
  confirmedAt: { type: Date },
  confirmedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Prevent duplicate active hiring requests from same gym to same trainer for the same role
hiringRequestSchema.index(
  { gymId: 1, trainerId: 1, role: 1, status: 1 }
);

export default mongoose.model<IHiringRequest>('HiringRequest', hiringRequestSchema);
