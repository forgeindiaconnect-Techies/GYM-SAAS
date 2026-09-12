import mongoose, { Document, Schema } from 'mongoose';

export interface ITrainerInvitation extends Document {
  gymId: mongoose.Types.ObjectId;
  invitedBy: mongoose.Types.ObjectId;
  email: string;
  trainerName: string;
  tokenHash: string;
  expiresAt: Date;
  status: 'Pending' | 'Accepted' | 'Expired' | 'Declined' | 'Cancelled';
  acceptedAt?: Date;
  trainingMode: 'online' | 'offline' | 'both';
  personalMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const trainerInvitationSchema = new Schema<ITrainerInvitation>({
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
  invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  trainerName: { type: String, required: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Expired', 'Declined', 'Cancelled'], default: 'Pending' },
  acceptedAt: { type: Date },
  trainingMode: { type: String, enum: ['online', 'offline', 'both'], required: true },
  personalMessage: { type: String }
}, { timestamps: true });

export default mongoose.model<ITrainerInvitation>('TrainerInvitation', trainerInvitationSchema);
