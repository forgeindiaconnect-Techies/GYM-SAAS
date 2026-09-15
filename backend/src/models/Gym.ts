import mongoose, { Document, Schema } from 'mongoose';

export enum GymStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
  REJECTED = 'REJECTED',
}

export interface IGymEquipment {
  branchId?: mongoose.Types.ObjectId;
  category: string;
  name: string;
  quantity: number;
  brand?: string;
  condition: 'New' | 'Good' | 'Maintenance Required';
  availability: string;
  image?: string;
}

export interface IGymACDetails {
  type: 'Fully AC' | 'Partially AC' | 'Non-AC' | 'AC + Non-AC Sections';
  areas: string[];
}

export interface IGymOffer {
  name: string;
  type: 'Percentage Discount' | 'Flat Discount' | 'Free Days' | 'Special Package';
  description?: string;
  originalPrice: number;
  offerPrice: number;
  discountPercentage?: number;
  validFrom: Date;
  validUntil: Date;
  applicablePlan?: string;
  terms: string;
  status: 'Active' | 'Inactive';
}

export interface IGym extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  establishedYear?: number;
  gymType?: string;
  trainingMode: 'online' | 'offline' | 'both';
  services: string[];
  logo?: string;
  images?: string[];
  email?: string;
  phone?: string;
  website?: string;
  subscription?: {
    plan: string;
    startDate: Date;
    endDate?: Date;
    status: string;
  };
  subscriptionPlans?: {
    name: string;
    price: string | number;
    duration: string;
    features: string;
  }[];
  location: {
    address: string;
    area?: string;
    city: string;
    state: string;
    country?: string;
    pinCode: string;
    latitude?: number;
    longitude?: number;
  };
  memberCapacity?: number;
  trainerCapacity?: number;
  equipment?: IGymEquipment[];
  acDetails?: IGymACDetails;
  facilities: string[];
  offers?: IGymOffer[];
  status: GymStatus;
  rejectionReason?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const gymSchema = new Schema<IGym>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    establishedYear: { type: Number },
    gymType: { type: String },
    trainingMode: { type: String, enum: ['online', 'offline', 'both'], required: true, default: 'offline' },
    services: [{ type: String }],
    logo: { type: String },
    images: [{ type: String }],
    email: { type: String },
    phone: { type: String },
    website: { type: String },
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
    subscription: {
      plan: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      status: { type: String },
    },
    subscriptionPlans: [{
      name: { type: String },
      price: { type: Schema.Types.Mixed },
      duration: { type: String },
      features: { type: String },
    }],
    location: {
      address: { type: String, required: true },
      area: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String },
      pinCode: { type: String, required: true },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    memberCapacity: { type: Number },
    trainerCapacity: { type: Number },
    equipment: [{
      branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
      category: { type: String, required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      brand: { type: String },
      condition: { type: String, enum: ['New', 'Good', 'Maintenance Required'], required: true },
      availability: { type: String, required: true },
      image: { type: String },
    }],
    acDetails: {
      type: { type: String, enum: ['Fully AC', 'Partially AC', 'Non-AC', 'AC + Non-AC Sections'] },
      areas: [{ type: String }],
    },
    facilities: [{ type: String }],
    offers: [{
      name: { type: String, required: true },
      type: { type: String, enum: ['Percentage Discount', 'Flat Discount', 'Free Days', 'Special Package'], required: true },
      description: { type: String },
      originalPrice: { type: Number, required: true },
      offerPrice: { type: Number, required: true },
      discountPercentage: { type: Number },
      validFrom: { type: Date, required: true },
      validUntil: { type: Date, required: true },
      applicablePlan: { type: String },
      terms: { type: String, required: true },
      status: { type: String, enum: ['Active', 'Inactive'], required: true, default: 'Active' },
    }],
    status: { type: String, enum: Object.values(GymStatus), default: GymStatus.PENDING },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IGym>('Gym', gymSchema);
