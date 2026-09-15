import mongoose, { Document, Schema } from 'mongoose';

export enum CustomerMembershipStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}


export interface ICustomerMembership extends Document {
  userId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  planName: string;
  duration: string;
  price: number;
  discount: number;
  finalAmount: number;
  status: CustomerMembershipStatus;
  paymentMethod: string;
  paymentReference?: string;
  paymentProofUrl?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const customerMembershipSchema = new Schema<ICustomerMembership>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    planName: { type: String, required: true },
    duration: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(CustomerMembershipStatus),
      default: CustomerMembershipStatus.PENDING_VERIFICATION,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentReference: { type: String },
    paymentProofUrl: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ICustomerMembership>('CustomerMembership', customerMembershipSchema);
