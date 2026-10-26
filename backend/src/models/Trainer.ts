import mongoose, { Document, Schema } from 'mongoose';

export interface ITrainer extends Document {
  gymId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  specialization?: string;
  experience?: number;
  trainingMode: 'online' | 'offline' | 'both';
  qualifications?: string;
  certifications?: string;
  expertise?: string;
  bio?: string;
  availability?: string;
  availableDays?: string;
  availableStartTime?: string;
  availableEndTime?: string;
  availableSlot?: number;
  unavailableDates?: string[];
  fee?: number;
  paymentType?: 'Per Week' | 'Per Month' | 'Per Session';
  commissionType?: 'Percentage' | 'Fixed Amount';
  commissionValue?: number;
  totalEarnings: number;
  availableBalance: number;
  withdrawnAmount: number;
  pendingWithdrawal: number;
  status: 'Pending' | 'Active' | 'Rejected' | 'Suspended';
  availabilityStatus?: 'Online' | 'Offline' | 'Busy';
  averageRating?: number;
  totalReviews?: number;
  // Recruitment & Direct Hiring Fields
  isPublicRecruitment?: boolean;
  professionalHeadline?: string;
  preferredLocation?: string;
  employmentPreference?: 'Full-time' | 'Part-time' | 'Contract' | 'Any';
  expectedSalary?: number;
  personalTrainingFee?: number;
  resumeUrl?: string;
  portfolioUrl?: string;
  earliestJoiningDate?: string;
  workHistory?: Array<{ company: string; role: string; duration: string; description?: string }>;
  shortlistedByGyms?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const trainerSchema = new Schema<ITrainer>({
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  profilePhoto: { type: String },
  specialization: { type: String },
  experience: { type: Number },
  trainingMode: { type: String, enum: ['online', 'offline', 'both'], required: true },
  qualifications: { type: String },
  certifications: { type: String },
  expertise: { type: String },
  bio: { type: String },
  availability: { type: String },
  availableDays: { type: String },
  availableStartTime: { type: String },
  availableEndTime: { type: String },
  availableSlot: { type: Number },
  unavailableDates: [{ type: String }],
  fee: { type: Number },
  paymentType: { type: String, enum: ['Per Week', 'Per Month', 'Per Session'] },
  commissionType: { type: String, enum: ['Percentage', 'Fixed Amount'], default: 'Percentage' },
  commissionValue: { type: Number, default: 0, min: 0 },
  totalEarnings: { type: Number, default: 0 },
  availableBalance: { type: Number, default: 0 },
  withdrawnAmount: { type: Number, default: 0 },
  pendingWithdrawal: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Active', 'Rejected', 'Suspended'], default: 'Pending' },
  availabilityStatus: { type: String, enum: ['Online', 'Offline', 'Busy'], default: 'Online' },
  averageRating: { type: Number, default: 5.0 },
  totalReviews: { type: Number, default: 0 },
  // Recruitment & Direct Hiring Fields
  isPublicRecruitment: { type: Boolean, default: true, index: true },
  professionalHeadline: { type: String },
  preferredLocation: { type: String },
  employmentPreference: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Any'], default: 'Any' },
  expectedSalary: { type: Number, default: 0 },
  personalTrainingFee: { type: Number, default: 0 },
  resumeUrl: { type: String },
  portfolioUrl: { type: String },
  earliestJoiningDate: { type: String },
  workHistory: [{
    company: { type: String },
    role: { type: String },
    duration: { type: String },
    description: { type: String }
  }],
  shortlistedByGyms: [{ type: Schema.Types.ObjectId, ref: 'Gym' }]
}, { timestamps: true });

export default mongoose.model<ITrainer>('Trainer', trainerSchema);
