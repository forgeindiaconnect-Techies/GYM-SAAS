import mongoose, { Document, Schema } from 'mongoose';

export interface ITrainerPayment extends Document {
  gymId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  trainerFeeId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: 'Bank Transfer' | 'UPI' | 'Manual Payment' | 'Other';
  transactionId?: string;
  paymentDate: Date;
  paymentProof?: string;
  notes?: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Cancelled';
  paidBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const trainerPaymentSchema = new Schema<ITrainerPayment>({
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
  trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true },
  trainerFeeId: { type: Schema.Types.ObjectId, ref: 'TrainerFee', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Bank Transfer', 'UPI', 'Manual Payment', 'Other'], required: true },
  transactionId: { type: String },
  paymentDate: { type: Date, required: true },
  paymentProof: { type: String },
  notes: { type: String },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Cancelled'], default: 'Pending' },
  paidBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<ITrainerPayment>('TrainerPayment', trainerPaymentSchema);
