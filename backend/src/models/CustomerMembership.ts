import mongoose, { Document, Schema } from 'mongoose';

export enum CustomerMembershipStatus {
  FREE_TRIAL = 'Free Trial',
  ACTIVE = 'Active',
  PAYMENT_VERIFICATION_PENDING = 'Payment Verification Pending',
  EXPIRED = 'Expired',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled',
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
      default: CustomerMembershipStatus.FREE_TRIAL,
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
