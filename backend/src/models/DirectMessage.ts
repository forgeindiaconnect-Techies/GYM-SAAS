import mongoose, { Document, Schema } from 'mongoose';

export interface IDirectMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  gymId?: mongoose.Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DirectMessageSchema = new Schema<IDirectMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym' },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DirectMessageSchema.index({ senderId: 1, receiverId: 1 });
DirectMessageSchema.index({ receiverId: 1, read: 1 });

export default mongoose.model<IDirectMessage>('DirectMessage', DirectMessageSchema);
