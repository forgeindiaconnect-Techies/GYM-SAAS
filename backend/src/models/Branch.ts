import mongoose, { Document, Schema } from 'mongoose';
import { GymStatus } from './Gym';

export interface IBranch extends Document {
  gymId: mongoose.Types.ObjectId;
  branchName: string;
  branchCode: string;
  phone?: string;
  email?: string;
  managerId?: mongoose.Types.ObjectId;
  
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
  
  operatingHours: {
    openingTime: string;
    closingTime: string;
    workingDays: string[];
  };
  
  trainingMode: 'online' | 'offline' | 'both';
  services: string[];
  facilities: string[];
  images?: string[];
  status: GymStatus;
  memberCapacity?: number;
  trainerCapacity?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<IBranch>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    branchName: { type: String, required: true },
    branchCode: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    managerId: { type: Schema.Types.ObjectId, ref: 'User' },
    
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
    
    operatingHours: {
      openingTime: { type: String, required: true },
      closingTime: { type: String, required: true },
      workingDays: [{ type: String, required: true }],
    },
    
    trainingMode: { type: String, enum: ['online', 'offline', 'both'], required: true, default: 'offline' },
    services: [{ type: String }],
    facilities: [{ type: String }],
    images: [{ type: String }],
    
    status: { type: String, enum: Object.values(GymStatus), default: GymStatus.ACTIVE },
    memberCapacity: { type: Number },
    trainerCapacity: { type: Number },
  },
  { timestamps: true }
);

// Ensure branchCode is unique per gym
branchSchema.index({ gymId: 1, branchCode: 1 }, { unique: true });

export default mongoose.model<IBranch>('Branch', branchSchema);
