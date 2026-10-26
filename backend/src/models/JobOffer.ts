import mongoose, { Document, Schema } from 'mongoose';

export interface IJobOffer extends Document {
  applicationId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  issuedBy: mongoose.Types.ObjectId;
  jobTitle: string;
  candidateName: string;
  offeredSalary: string;
  salaryPeriod: 'Monthly' | 'Hourly' | 'Per Session' | 'Annual';
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance';
  joiningDate: Date;
  termsAndConditions?: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  respondedAt?: Date;
  declineReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobOfferSchema = new Schema<IJobOffer>({
  applicationId: { type: Schema.Types.ObjectId, ref: 'JobApplication', required: true, index: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'JobVacancy', required: true, index: true },
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
  trainerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  issuedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  jobTitle: { type: String, required: true },
  candidateName: { type: String, required: true },
  offeredSalary: { type: String, required: true },
  salaryPeriod: { type: String, enum: ['Monthly', 'Hourly', 'Per Session', 'Annual'], default: 'Monthly' },
  employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Freelance'], default: 'Full-time' },
  joiningDate: { type: Date, required: true },
  termsAndConditions: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending', index: true },
  respondedAt: { type: Date },
  declineReason: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model<IJobOffer>('JobOffer', jobOfferSchema);
