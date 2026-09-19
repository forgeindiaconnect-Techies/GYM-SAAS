import mongoose, { Document, Schema } from 'mongoose';

export enum EnquiryStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  FOLLOW_UP = 'FOLLOW_UP',
  CONVERTED = 'CONVERTED',
  CLOSED = 'CLOSED',
}

export interface IEnquiry extends Document {
  enquiryId: string;
  customerName: string;
  mobileNumber: string;
  email: string;
  address?: string;
  city?: string;
  gymId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  gymOwnerId: mongoose.Types.ObjectId;
  enquiryType: string;
  message: string;
  preferredContactMethod: 'Phone Call' | 'Email' | 'WhatsApp';
  status: EnquiryStatus;
  ownerNotes?: string;
  contactedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const enquirySchema = new Schema<IEnquiry>(
  {
    enquiryId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    gymOwnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    enquiryType: { type: String, required: true },
    message: { type: String, required: true },
    preferredContactMethod: { type: String, enum: ['Phone Call', 'Email', 'WhatsApp'], default: 'Phone Call' },
    status: { type: String, enum: Object.values(EnquiryStatus), default: EnquiryStatus.NEW },
    ownerNotes: { type: String },
    contactedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IEnquiry>('Enquiry', enquirySchema);
