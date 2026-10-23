import mongoose, { Document, Schema } from 'mongoose';

export enum PaymentStatus {
  PENDING_VERIFICATION = 'Pending Verification',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  REFUNDED = 'Refunded',
}

export interface IPayment extends Document {
  customerId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  membershipId?: mongoose.Types.ObjectId;
  orderId?: string;
  receiptNumber?: string;
  planName: string;
  packagePrice?: number;
  discount?: number;
  tax?: number;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  paymentProofUrl?: string;
  customerBankDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  status: PaymentStatus;
  rejectionReason?: string;
  paymentDate?: Date;
  notes?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    membershipId: { type: Schema.Types.ObjectId, ref: 'CustomerMembership' },
    orderId: { type: String, index: true },
    receiptNumber: { type: String, index: true },
    planName: { type: String, required: true },
    packagePrice: { type: Number },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String, index: true },
    paymentProofUrl: { type: String },
    customerBankDetails: {
      bankName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String }
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING_VERIFICATION,
      index: true,
    },
    rejectionReason: { type: String },
    paymentDate: { type: Date },
    notes: { type: String },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', paymentSchema);
