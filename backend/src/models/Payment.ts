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
  planName: string;
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
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    planName: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String },
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
    },
    rejectionReason: { type: String },
    paymentDate: { type: Date },
    notes: { type: String },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', paymentSchema);
