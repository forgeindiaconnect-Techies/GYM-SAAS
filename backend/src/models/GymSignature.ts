import mongoose, { Document, Schema } from 'mongoose';

export interface IGymSignature extends Document {
  gymId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  signatureImage: string;
  signatoryName: string;
  designation: string;
  createdAt: Date;
  updatedAt: Date;
}

const gymSignatureSchema = new Schema<IGymSignature>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, unique: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    signatureImage: { type: String, required: true },
    signatoryName: { type: String, required: true, trim: true },
    designation: { type: String, default: 'Gym Owner', trim: true }
  },
  { timestamps: true }
);

export default mongoose.model<IGymSignature>('GymSignature', gymSignatureSchema);

