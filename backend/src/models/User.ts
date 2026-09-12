import mongoose, { Document, Schema } from 'mongoose';

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  GYM_OWNER = 'GYM_OWNER',
  GYM_MANAGER = 'GYM_MANAGER',
  RECEPTIONIST = 'RECEPTIONIST',
  TRAINER = 'TRAINER',
  NUTRITIONIST = 'NUTRITIONIST',
  MEMBER = 'MEMBER',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export enum SubscriptionStatus {
  NONE = 'NONE',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TRIAL = 'TRIAL',
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  mobile: string;
  role: Role;
  gymId?: mongoose.Types.ObjectId;
  isActive: boolean;

  // Approval workflow
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
  suspensionReason?: string;

  // Subscription
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan?: string;
  subscriptionExpiry?: Date;

  // Personal details
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  profilePhoto?: string;
  city?: string;
  pinCode?: string;

  // Fitness details
  height?: number; // cm
  weight?: number; // kg
  fitnessGoal?: string;
  experienceLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  preferredTraining?: 'Offline' | 'Online' | 'Hybrid';
  preferredWorkoutTime?: string;

  // Emergency contact
  emergencyContact?: {
    name: string;
    relationship: string;
    mobile: string;
  };

  // Trainer specific fields
  trainerMode?: 'online' | 'offline' | 'both';
  specialization?: string;
  experienceYears?: number;
  qualification?: string;
  certifications?: string;
  previousGym?: string;
  joiningDate?: Date;
  employmentType?: 'Full-Time' | 'Part-Time' | 'Contract';
  workingDays?: string;
  workingHours?: string;
  salary?: string;
  bio?: string;
  resumeUrl?: string;
  certificationUrl?: string;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    mobile: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), default: Role.MEMBER },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym' },
    isActive: { type: Boolean, default: true },

    approvalStatus: {
      type: String,
      enum: Object.values(ApprovalStatus),
      default: ApprovalStatus.PENDING,
    },
    rejectionReason: { type: String },
    suspensionReason: { type: String },

    subscriptionStatus: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.NONE,
    },
    subscriptionPlan: { type: String },
    subscriptionExpiry: { type: Date },

    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    profilePhoto: { type: String },
    city: { type: String },
    pinCode: { type: String },

    height: { type: Number },
    weight: { type: Number },
    fitnessGoal: { type: String },
    experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
    preferredTraining: { type: String, enum: ['Offline', 'Online', 'Hybrid'] },
    preferredWorkoutTime: { type: String },

    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      mobile: { type: String },
    },
    
    // Trainer specific fields
    trainerMode: { type: String, enum: ['online', 'offline', 'both'] },
    specialization: { type: String },
    experienceYears: { type: Number },
    qualification: { type: String },
    certifications: { type: String },
    previousGym: { type: String },
    joiningDate: { type: Date },
    employmentType: { type: String, enum: ['Full-Time', 'Part-Time', 'Contract'] },
    workingDays: { type: String },
    workingHours: { type: String },
    salary: { type: String },
    bio: { type: String },
    resumeUrl: { type: String },
    certificationUrl: { type: String },
  },
  { timestamps: true }
);



export default mongoose.model<IUser>('User', userSchema);
