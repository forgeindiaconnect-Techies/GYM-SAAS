import mongoose, { Document, Schema } from 'mongoose';

export interface ITrainerWithdrawal extends Document {
  gymId: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: Date;
  processedAt?: Date;
}

const trainerWithdrawalSchema = new Schema<ITrainerWithdrawal>({
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
  trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model<ITrainerWithdrawal>('TrainerWithdrawal', trainerWithdrawalSchema);
