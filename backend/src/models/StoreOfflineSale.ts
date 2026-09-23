import mongoose, { Document, Schema } from 'mongoose';

export interface IStoreOfflineSaleItem {
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  name: string;
  image?: string;
  sku?: string;
  attributes?: Record<string, any>;
  quantity: number;
  sellingPrice: number;
  discountPrice?: number;
  unitPrice: number;
  total: number;
}

export interface IStoreOfflineSale extends Document {
  saleNumber: string;
  gymId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  items: IStoreOfflineSaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentDate: Date;
  createdBy: mongoose.Types.ObjectId;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const storeOfflineSaleSchema = new Schema<IStoreOfflineSale>(
  {
    saleNumber: { type: String, required: true, unique: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    customerId: { type: Schema.Types.ObjectId, ref: 'User' },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'StoreProduct', required: true },
        variantId: { type: Schema.Types.ObjectId },
        name: { type: String, required: true },
        image: { type: String },
        sku: { type: String },
        attributes: { type: Schema.Types.Mixed },
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
    paymentMethod: { type: String, required: true },
    paymentDate: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String },
  },
  { timestamps: true }
);

storeOfflineSaleSchema.index({ gymId: 1, createdAt: -1 });
storeOfflineSaleSchema.index({ gymId: 1, paymentDate: -1 });

export default mongoose.model<IStoreOfflineSale>('StoreOfflineSale', storeOfflineSaleSchema);