import mongoose, { Document, Schema } from 'mongoose';

export interface ITrainerFee extends Document {
  gymId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  trainingType: string;
  feeAmount: number;
  billingCycle: 'Per Session' | 'Weekly' | 'Monthly' | 'Custom';
  effectiveFrom: Date;
  effectiveUntil?: Date;
  paymentMethod: 'Bank Transfer' | 'UPI' | 'Manual Payment' | 'Other';
  bankDetails?: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
  };
  upiDetails?: {
    upiId: string;
    upiName: string;
  };
  status: 'Active' | 'Inactive' | 'Pending' | 'Rejected';
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const trainerFeeSchema = new Schema<ITrainerFee>({
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
  trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true },
  trainingType: { type: String, required: true },
  feeAmount: { type: Number, required: true },
  billingCycle: { type: String, enum: ['Per Session', 'Weekly', 'Monthly', 'Custom'], required: true },
  effectiveFrom: { type: Date, required: true },
  effectiveUntil: { type: Date },
  paymentMethod: { type: String, enum: ['Bank Transfer', 'UPI', 'Manual Payment', 'Other'], required: true },
  bankDetails: {
    accountHolder: { type: String },
    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String }
  },
  upiDetails: {
    upiId: { type: String },
    upiName: { type: String }
  },
  status: { type: String, enum: ['Active', 'Inactive', 'Pending', 'Rejected'], default: 'Active' },
  notes: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<ITrainerFee>('TrainerFee', trainerFeeSchema);
