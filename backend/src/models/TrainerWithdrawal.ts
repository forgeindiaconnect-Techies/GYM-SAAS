import mongoose, { Document, Schema } from 'mongoose';

export interface ITrainerWithdrawal extends Document {
  gymId: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  amount: number;
  withdrawalMethod: 'Bank Transfer' | 'UPI';
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
  rejectionReason?: string;
  transactionId?: string;
  status: 'Pending' | 'Approved' | 'Processing' | 'Completed' | 'Rejected' | 'Cancelled';
  requestedAt: Date;
  processedAt?: Date;
}

const trainerWithdrawalSchema = new Schema<ITrainerWithdrawal>({
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
  trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true },
  amount: { type: Number, required: true },
  withdrawalMethod: { type: String, enum: ['Bank Transfer', 'UPI'], required: true },
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
  rejectionReason: { type: String },
  transactionId: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Processing', 'Completed', 'Rejected', 'Cancelled'], default: 'Pending' },
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model<ITrainerWithdrawal>('TrainerWithdrawal', trainerWithdrawalSchema);
