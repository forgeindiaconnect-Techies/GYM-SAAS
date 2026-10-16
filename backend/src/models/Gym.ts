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
  _id?: mongoose.Types.ObjectId | string;
  id?: string;
  branchId?: mongoose.Types.ObjectId;
  category: string;
  name: string;
  quantity: number;
  brand?: string;
  condition: 'New' | 'Good' | 'Maintenance Required' | string;
  availability: string;
  image?: string;
  status?: string;
  nextService?: string;
  isApproved?: boolean;
  approvedBy?: mongoose.Types.ObjectId | string;
  approvedByName?: string;
  approvedAt?: Date;
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
  operatingHours?: string;
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
  reviews?: {
    _id?: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    userName: string;
    userPhoto?: string;
    rating: number;
    review: string;
    type?: 'gym' | 'trainer';
    trainerName?: string;
    createdAt?: Date;
  }[];
  paymentSettings?: {
    upiId?: string;
    qrCodeUrl?: string;
    accountName?: string;
    instructions?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    isQrPaymentEnabled?: boolean;
  };
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
    operatingHours: { type: String },
    trainingMode: { type: String, enum: ['online', 'offline', 'both'], required: true, default: 'offline' },
    services: [{ type: String }],
    logo: { type: String },
    images: [{ type: String }],
    email: { type: String },
    phone: { type: String },
    website: { type: String },
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
    reviews: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      userName: { type: String, required: true },
      userPhoto: { type: String },
      rating: { type: Number, required: true, min: 1, max: 5 },
      review: { type: String, required: true },
      type: { type: String, enum: ['gym', 'trainer'], default: 'gym' },
      trainerName: { type: String },
      createdAt: { type: Date, default: Date.now }
    }],
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
      quantity: { type: Number, required: true, default: 1 },
      brand: { type: String },
      condition: { type: String, default: 'Good' },
      availability: { type: String, default: 'Available' },
      status: { type: String, default: 'Active' },
      nextService: { type: String },
      image: { type: String },
      isApproved: { type: Boolean, default: false },
      approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      approvedByName: { type: String },
      approvedAt: { type: Date },
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
    paymentSettings: {
      upiId: { type: String },
      qrCodeUrl: { type: String },
      accountName: { type: String },
      instructions: { type: String },
      bankName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      isQrPaymentEnabled: { type: Boolean, default: true }
    },
  },
  { timestamps: true }
);

export default mongoose.model<IGym>('Gym', gymSchema);
