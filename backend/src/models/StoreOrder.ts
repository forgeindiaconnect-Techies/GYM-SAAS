import mongoose, { Document, Schema } from 'mongoose';

export enum StoreOrderStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  PREPARING = 'Preparing',
  READY_FOR_PICKUP = 'Ready for Pickup',
  OUT_FOR_DELIVERY = 'Out for Delivery',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  REFUNDED = 'Refunded',
}

export enum StoreOrderPaymentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  FAILED = 'Failed',
  REFUNDED = 'Refunded',
}

export interface IStoreOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  image?: string;
  sku?: string;
  quantity: number;
  sellingPrice: number;
  discountPrice?: number;
  unitPrice: number;
  total: number;
}

export interface IStoreOrderStatusEvent {
  status: StoreOrderStatus;
  note?: string;
  at: Date;
}

export interface IStoreOrder extends Document {
  orderNumber: string;
  gymId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  items: IStoreOrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentStatus: StoreOrderPaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  paymentDate?: Date;
  fulfilmentType: 'Gym Pickup' | 'Delivery';
  deliveryDetails?: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
  };
  status: StoreOrderStatus;
  statusHistory: IStoreOrderStatusEvent[];
  cancellationReason?: string;
  refundDetails?: {
    amount: number;
    reason: string;
    refundedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const storeOrderSchema = new Schema<IStoreOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'StoreProduct', required: true },
        name: { type: String, required: true },
        image: { type: String },
        sku: { type: String },
        quantity: { type: Number, required: true, min: 1 },
        sellingPrice: { type: Number, required: true, min: 0 },
        discountPrice: { type: Number, min: 0 },
        unitPrice: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 },
        _id: false,
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: Object.values(StoreOrderPaymentStatus),
      default: StoreOrderPaymentStatus.PENDING,
    },
    paymentMethod: { type: String },
    transactionId: { type: String },
    paymentDate: { type: Date },
    fulfilmentType: { type: String, enum: ['Gym Pickup', 'Delivery'], required: true },
    deliveryDetails: {
      name: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      pinCode: { type: String },
    },
    status: { type: String, enum: Object.values(StoreOrderStatus), default: StoreOrderStatus.PENDING },
    statusHistory: [
      {
        status: { type: String, enum: Object.values(StoreOrderStatus), required: true },
        note: { type: String },
        at: { type: Date, default: Date.now },
        _id: false,
      },
    ],
    cancellationReason: { type: String },
    refundDetails: {
      amount: { type: Number },
      reason: { type: String },
      refundedAt: { type: Date },
    },
  },
  { timestamps: true }
);

storeOrderSchema.index({ gymId: 1, createdAt: -1 });
storeOrderSchema.index({ gymId: 1, status: 1 });
storeOrderSchema.index({ customerId: 1, createdAt: -1 });
storeOrderSchema.index({ gymId: 1, paymentStatus: 1 });

export default mongoose.model<IStoreOrder>('StoreOrder', storeOrderSchema);