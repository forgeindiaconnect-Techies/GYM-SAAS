import mongoose, { Document, Schema } from 'mongoose';

export enum StorePaymentTransactionStatus {
  PENDING = 'Pending',
  SUCCESS = 'Success',
  FAILED = 'Failed',
  REFUNDED = 'Refunded',
}

export interface IStorePaymentTransaction extends Document {
  orderId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod?: string;
  transactionId: string;
  status: StorePaymentTransactionStatus;
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const storePaymentTransactionSchema = new Schema<IStorePaymentTransaction>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'StoreOrder', required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String },
    transactionId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: Object.values(StorePaymentTransactionStatus),
      default: StorePaymentTransactionStatus.SUCCESS,
    },
    paymentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

storePaymentTransactionSchema.index({ gymId: 1, createdAt: -1 });
storePaymentTransactionSchema.index({ orderId: 1 });

export default mongoose.model<IStorePaymentTransaction>('StorePaymentTransaction', storePaymentTransactionSchema);