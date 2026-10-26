import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewSchedule extends Document {
  applicationId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  scheduledBy: mongoose.Types.ObjectId;
  jobTitle: string;
  candidateName: string;
  date: Date;
  time: string;
  durationMinutes?: number;
  mode: 'In-Person' | 'Video Call' | 'Phone';
  locationOrLink: string;
  instructions?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  feedback?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const interviewScheduleSchema = new Schema<IInterviewSchedule>({
  applicationId: { type: Schema.Types.ObjectId, ref: 'JobApplication', required: true, index: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'JobVacancy', required: true, index: true },
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
  trainerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  scheduledBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  jobTitle: { type: String, required: true },
  candidateName: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  durationMinutes: { type: Number, default: 30 },
  mode: { type: String, enum: ['In-Person', 'Video Call', 'Phone'], default: 'In-Person' },
  locationOrLink: { type: String, required: true },
  instructions: { type: String, default: '' },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'], default: 'Scheduled', index: true },
  feedback: { type: String, default: '' },
  rating: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

export default mongoose.model<IInterviewSchedule>('InterviewSchedule', interviewScheduleSchema);
