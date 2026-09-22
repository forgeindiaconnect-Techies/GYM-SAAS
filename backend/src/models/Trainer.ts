import mongoose, { Document, Schema } from 'mongoose';

export interface ITrainer extends Document {
  gymId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  specialization?: string;
  experience?: number;
  trainingMode: 'online' | 'offline' | 'both';
  qualifications?: string;
  certifications?: string;
  expertise?: string;
  bio?: string;
  availability?: string;
  availableDays?: string;
  availableStartTime?: string;
  availableEndTime?: string;
  availableSlot?: number;
  fee?: number;
  paymentType?: 'Per Week' | 'Per Month' | 'Per Session';
  totalEarnings: number;
  availableBalance: number;
  withdrawnAmount: number;
  pendingWithdrawal: number;
  status: 'Pending' | 'Active' | 'Rejected' | 'Suspended';
  createdAt: Date;
  updatedAt: Date;
}

const trainerSchema = new Schema<ITrainer>({
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  profilePhoto: { type: String },
  specialization: { type: String },
  experience: { type: Number },
  trainingMode: { type: String, enum: ['online', 'offline', 'both'], required: true },
  qualifications: { type: String },
  certifications: { type: String },
  expertise: { type: String },
  bio: { type: String },
  availability: { type: String },
  availableDays: { type: String },
  availableStartTime: { type: String },
  availableEndTime: { type: String },
  availableSlot: { type: Number },
  fee: { type: Number },
  paymentType: { type: String, enum: ['Per Week', 'Per Month', 'Per Session'] },
  totalEarnings: { type: Number, default: 0 },
  availableBalance: { type: Number, default: 0 },
  withdrawnAmount: { type: Number, default: 0 },
  pendingWithdrawal: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Active', 'Rejected', 'Suspended'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model<ITrainer>('Trainer', trainerSchema);
