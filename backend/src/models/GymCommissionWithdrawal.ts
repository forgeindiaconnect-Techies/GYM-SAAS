import mongoose, { Document, Schema } from 'mongoose';

export interface IGymCommissionWithdrawal extends Document {
  gymId: mongoose.Types.ObjectId;
  ownerId?: mongoose.Types.ObjectId;
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
    upiName?: string;
  };
  transactionId?: string;
  notes?: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Rejected';
  requestedAt: Date;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const gymCommissionWithdrawalSchema = new Schema<IGymCommissionWithdrawal>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true, min: 1 },
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
    transactionId: { type: String },
    notes: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Completed', 'Rejected'],
      default: 'Completed'
    },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model<IGymCommissionWithdrawal>(
  'GymCommissionWithdrawal',
  gymCommissionWithdrawalSchema
);
