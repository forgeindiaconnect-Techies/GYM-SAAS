import mongoose, { Document, Schema } from 'mongoose';

export interface IStoreProduct extends Document {
  gymId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  categoryName: string;
  name: string;
  description?: string;
  brand?: string;
  sku?: string;
  image?: string;
  sellingPrice: number;
  discountPrice?: number;
  stock: number;
  status: 'Active' | 'Inactive';
  availability: 'Online' | 'Offline' | 'Both';
  fulfilmentType: 'Gym Pickup' | 'Delivery' | 'Both';
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const storeProductSchema = new Schema<IStoreProduct>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'StoreProductCategory' },
    categoryName: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    brand: { type: String, trim: true },
    sku: { type: String, trim: true },
    image: { type: String },
    sellingPrice: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    availability: { type: String, enum: ['Online', 'Offline', 'Both'], default: 'Both' },
    fulfilmentType: { type: String, enum: ['Gym Pickup', 'Delivery', 'Both'], default: 'Gym Pickup' },
    lowStockThreshold: { type: Number, min: 0, default: 5 },
  },
  { timestamps: true }
);

storeProductSchema.index({ gymId: 1 });
storeProductSchema.index({ gymId: 1, sku: 1 }, { unique: true, sparse: true });
storeProductSchema.index({ gymId: 1, categoryName: 1 });
storeProductSchema.index({ name: 'text', description: 'text', brand: 'text' });

export default mongoose.model<IStoreProduct>('StoreProduct', storeProductSchema);