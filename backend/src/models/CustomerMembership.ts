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
  packageId?: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId;
  membershipId?: string;
  receiptNumber?: string;
  orderId?: string;
  fitnessGoal?: string;
  billingPlan?: 'monthly' | 'annual';
  planName: string;
  packageDescription?: string;
  features: string[];
  duration: string;
  price: number;
  discount: number;
  tax: number;
  finalAmount: number;
  status: CustomerMembershipStatus;
  paymentMethod: string;
  paymentReference?: string;
  paymentProofUrl?: string;
  startDate?: Date;
  endDate?: Date;

  // Confirmation email delivery tracking
  confirmationEmailSent?: boolean;
  confirmationEmailSentAt?: Date;
  confirmationEmailStatus?: 'Sent' | 'Failed' | 'Pending';
  confirmationEmailError?: string;

  // Expiry notification reminder tracking
  reminder7DaysSent?: boolean;
  reminder3DaysSent?: boolean;
  reminderExpiryDaySent?: boolean;

  // Cancellation details
  cancelledAt?: Date;
  cancellationReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

const customerMembershipSchema = new Schema<ICustomerMembership>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    packageId: { type: Schema.Types.ObjectId, ref: 'GymPackage' },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    membershipId: { type: String, index: true },
    receiptNumber: { type: String, index: true },
    orderId: { type: String, index: true },
    fitnessGoal: { type: String },
    billingPlan: { type: String, enum: ['monthly', 'annual'] },
    planName: { type: String, required: true },
    packageDescription: { type: String },
    features: [{ type: String, trim: true }],
    duration: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(CustomerMembershipStatus),
      default: CustomerMembershipStatus.FREE_TRIAL,
      index: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentReference: { type: String },
    paymentProofUrl: { type: String },
    startDate: { type: Date },
    endDate: { type: Date, index: true },

    confirmationEmailSent: { type: Boolean, default: false },
    confirmationEmailSentAt: { type: Date },
    confirmationEmailStatus: { type: String, enum: ['Sent', 'Failed', 'Pending'], default: 'Pending' },
    confirmationEmailError: { type: String },

    reminder7DaysSent: { type: Boolean, default: false },
    reminder3DaysSent: { type: Boolean, default: false },
    reminderExpiryDaySent: { type: Boolean, default: false },

    cancelledAt: { type: Date },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ICustomerMembership>('CustomerMembership', customerMembershipSchema);

