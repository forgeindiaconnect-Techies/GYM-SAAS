import mongoose, { Document, Schema } from 'mongoose';

export type JobApplicationStatus = 
  | 'Applied' 
  | 'Under Review' 
  | 'Shortlisted' 
  | 'Interview Scheduled' 
  | 'Selected' 
  | 'Offer Accepted' 
  | 'Offer Rejected' 
  | 'Rejected' 
  | 'Withdrawn';

export interface IJobApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  qualifications: string;
  certifications: string;
  workExperience: string;
  expertise: string[];
  expectedSalary?: string;
  preferredLocation?: string;
  employmentPreference: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance';
  availability: string;
  coverLetter?: string;
  resumeUrl: string;
  resumeOriginalName?: string;
  status: JobApplicationStatus;
  reviewNotes?: string;
  statusHistory: Array<{
    status: JobApplicationStatus;
    changedBy?: mongoose.Types.ObjectId;
    changedAt: Date;
    comment?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const jobApplicationSchema = new Schema<IJobApplication>({
  jobId: { type: Schema.Types.ObjectId, ref: 'JobVacancy', required: true, index: true },
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
  trainerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  profilePhoto: { type: String },
  qualifications: { type: String, default: '' },
  certifications: { type: String, default: '' },
  workExperience: { type: String, default: '' },
  expertise: [{ type: String, trim: true }],
  expectedSalary: { type: String, default: '' },
  preferredLocation: { type: String, default: '' },
  employmentPreference: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Freelance'], default: 'Full-time' },
  availability: { type: String, default: 'Immediate' },
  coverLetter: { type: String, default: '' },
  resumeUrl: { type: String, required: true },
  resumeOriginalName: { type: String },
  status: { 
    type: String, 
    enum: [
      'Applied', 
      'Under Review', 
      'Shortlisted', 
      'Interview Scheduled', 
      'Selected', 
      'Offer Accepted', 
      'Offer Rejected', 
      'Rejected', 
      'Withdrawn'
    ], 
    default: 'Applied',
    index: true
  },
  reviewNotes: { type: String, default: '' },
  statusHistory: [{
    status: { type: String, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    comment: { type: String }
  }]
}, { timestamps: true });

// Prevent duplicate applications by the same trainer for the same job vacancy
jobApplicationSchema.index({ jobId: 1, trainerId: 1 }, { unique: true });

export default mongoose.model<IJobApplication>('JobApplication', jobApplicationSchema);
