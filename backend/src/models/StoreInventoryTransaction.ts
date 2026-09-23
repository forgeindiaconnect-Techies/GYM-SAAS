import mongoose, { Document, Schema } from 'mongoose';

export enum StoreInventoryTransactionType {
  STOCK_IN = 'stock_in',
  ONLINE_SALE = 'online_sale',
  OFFLINE_SALE = 'offline_sale',
  ADJUSTMENT = 'adjustment',
}

export interface IStoreInventoryTransaction extends Document {
  gymId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  type: StoreInventoryTransactionType;
  quantityChange: number;
  stockAfter: number;
  sourceType: 'online' | 'offline' | 'manual';
  referenceId?: mongoose.Types.ObjectId;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const storeInventoryTransactionSchema = new Schema<IStoreInventoryTransaction>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    productId: { type: Schema.Types.ObjectId, ref: 'StoreProduct', required: true },
    variantId: { type: Schema.Types.ObjectId },
    type: { type: String, enum: Object.values(StoreInventoryTransactionType), required: true },
    quantityChange: { type: Number, required: true },
    stockAfter: { type: Number, required: true },
    sourceType: { type: String, enum: ['online', 'offline', 'manual'], required: true },
    referenceId: { type: Schema.Types.ObjectId },
    note: { type: String },
  },
  { timestamps: true }
);

storeInventoryTransactionSchema.index({ gymId: 1, createdAt: -1 });
storeInventoryTransactionSchema.index({ productId: 1, createdAt: -1 });

export default mongoose.model<IStoreInventoryTransaction>('StoreInventoryTransaction', storeInventoryTransactionSchema);