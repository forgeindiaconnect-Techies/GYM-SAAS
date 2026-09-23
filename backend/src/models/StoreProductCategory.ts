import mongoose, { Document, Schema } from 'mongoose';

export interface IStoreProductCategory extends Document {
  gymId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  productType: string;
  name: string;
  description?: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const storeProductCategorySchema = new Schema<IStoreProductCategory>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    productType: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

storeProductCategorySchema.index({ gymId: 1, productType: 1, name: 1 }, { unique: true });

export default mongoose.model<IStoreProductCategory>('StoreProductCategory', storeProductCategorySchema);