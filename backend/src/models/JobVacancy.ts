import mongoose, { Document, Schema } from 'mongoose';

export interface IJobVacancy extends Document {
  gymId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  gymName: string;
  title: string;
  expertise: string[];
  description: string;
  responsibilities: string;
  experience: string;
  qualifications: string;
  certifications: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryType: 'Monthly' | 'Hourly' | 'Per Session' | 'Annual';
  isSalaryNegotiable: boolean;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance';
  location: string;
  workingHours?: string;
  vacanciesCount: number;
  deadline?: Date;
  status: 'Draft' | 'Published' | 'Closed';
  applicantsCount: number;
  shortlistedCount: number;
  hiredCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const jobVacancySchema = new Schema<IJobVacancy>({
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
  gymName: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  expertise: [{ type: String, trim: true }],
  description: { type: String, required: true },
  responsibilities: { type: String, default: '' },
  experience: { type: String, required: true },
  qualifications: { type: String, default: '' },
  certifications: { type: String, default: '' },
  salaryMin: { type: Number },
  salaryMax: { type: Number },
  salaryType: { type: String, enum: ['Monthly', 'Hourly', 'Per Session', 'Annual'], default: 'Monthly' },
  isSalaryNegotiable: { type: Boolean, default: false },
  employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Freelance'], default: 'Full-time' },
  location: { type: String, required: true, trim: true },
  workingHours: { type: String, default: '' },
  vacanciesCount: { type: Number, default: 1, min: 1 },
  deadline: { type: Date },
  status: { type: String, enum: ['Draft', 'Published', 'Closed'], default: 'Published', index: true },
  applicantsCount: { type: Number, default: 0 },
  shortlistedCount: { type: Number, default: 0 },
  hiredCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IJobVacancy>('JobVacancy', jobVacancySchema);
