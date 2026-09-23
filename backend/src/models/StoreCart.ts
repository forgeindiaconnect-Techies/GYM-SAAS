import mongoose, { Document, Schema } from 'mongoose';

export interface IStoreCartItem {
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IStoreCart extends Document {
  customerId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  items: IStoreCartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const storeCartSchema = new Schema<IStoreCart>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'StoreProduct', required: true },
        variantId: { type: Schema.Types.ObjectId },
        quantity: { type: Number, required: true, min: 1 },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

storeCartSchema.index({ customerId: 1, gymId: 1 }, { unique: true });

export default mongoose.model<IStoreCart>('StoreCart', storeCartSchema);