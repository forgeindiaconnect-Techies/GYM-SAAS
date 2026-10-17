import mongoose, { Document, Schema } from 'mongoose';

export const FITNESS_GOALS = [
  'Weight Loss',
  'Muscle Gain',
  'Strength',
  'General Fitness',
  'Bodybuilding',
  'Yoga',
  'CrossFit',
  'Personal Training',
  'Online Coaching',
] as const;

export type FitnessGoal = typeof FITNESS_GOALS[number];

export const TRAINING_TYPES = ['Offline', 'Online', 'Hybrid'] as const;
export type TrainingType = typeof TRAINING_TYPES[number];

export const PACKAGE_BILLING_PLANS = ['monthly', 'annual', 'both'] as const;
export type PackageBillingPlan = typeof PACKAGE_BILLING_PLANS[number];

export interface IGymPackage extends Document {
  gymId: mongoose.Types.ObjectId;
  name: string;
  fitnessGoal: FitnessGoal;
  description?: string;
  features: string[];
  benefits: string[];
  trainingType: TrainingType;
  duration: string;         // e.g. "1 Month", "3 Months", "1 Year"
  monthlyPrice: number;
  annualPrice: number;
  availablePlans: PackageBillingPlan; // 'monthly' | 'annual' | 'both'
  isPopular: boolean;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const gymPackageSchema = new Schema<IGymPackage>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    name: { type: String, required: true, trim: true },
    fitnessGoal: {
      type: String,
      enum: FITNESS_GOALS,
      required: true,
    },
    description: { type: String, trim: true },
    features: [{ type: String, trim: true }],
    benefits: [{ type: String, trim: true }],
    trainingType: {
      type: String,
      enum: TRAINING_TYPES,
      required: true,
      default: 'Offline',
    },
    duration: { type: String, required: true, default: '1 Month' },
    monthlyPrice: { type: Number, required: true, min: 0 },
    annualPrice: { type: Number, required: true, min: 0 },
    availablePlans: {
      type: String,
      enum: PACKAGE_BILLING_PLANS,
      required: true,
      default: 'both',
    },
    isPopular: { type: Boolean, default: false },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

// Index for fast filtering
gymPackageSchema.index({ gymId: 1, fitnessGoal: 1, status: 1 });

export default mongoose.model<IGymPackage>('GymPackage', gymPackageSchema);
