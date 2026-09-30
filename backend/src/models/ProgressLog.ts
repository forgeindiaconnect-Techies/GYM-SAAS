import mongoose, { Document, Schema } from 'mongoose';

export interface IProgressLog extends Document {
  customerId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  trainerId?: mongoose.Types.ObjectId;
  weight: number; // in kg
  height?: number; // in cm
  bodyFatPercentage?: number;
  benchPressMax?: number; // in kg
  squatMax?: number; // in kg
  chestMeasurement?: number; // in cm
  waistMeasurement?: number; // in cm
  armsMeasurement?: number; // in cm
  workoutCompletionPercentage?: number;
  attendancePercentage?: number;
  completedSessionsCount?: number;
  missedSessionsCount?: number;
  videoCompletionPercentage?: number;
  dietAdherencePercentage?: number;
  notes?: string;
  loggedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const progressLogSchema = new Schema<IProgressLog>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer' },
    weight: { type: Number, required: true },
    height: { type: Number },
    bodyFatPercentage: { type: Number },
    benchPressMax: { type: Number },
    squatMax: { type: Number },
    chestMeasurement: { type: Number },
    waistMeasurement: { type: Number },
    armsMeasurement: { type: Number },
    workoutCompletionPercentage: { type: Number, default: 85 },
    attendancePercentage: { type: Number, default: 90 },
    completedSessionsCount: { type: Number, default: 0 },
    missedSessionsCount: { type: Number, default: 0 },
    videoCompletionPercentage: { type: Number, default: 80 },
    dietAdherencePercentage: { type: Number, default: 85 },
    notes: { type: String },
    loggedDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model<IProgressLog>('ProgressLog', progressLogSchema);
