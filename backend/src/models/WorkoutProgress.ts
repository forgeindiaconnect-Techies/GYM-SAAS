import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkoutProgress extends Document {
  customerId: mongoose.Types.ObjectId;
  workoutPlanId: mongoose.Types.ObjectId;
  exerciseId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  trainerId?: mongoose.Types.ObjectId;
  dayName: string;
  completedSets: number;
  totalSets: number;
  completedRepetitions: number;
  targetRepetitions: number;
  duration: number; // in seconds
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Skipped';
  completedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const workoutProgressSchema = new Schema<IWorkoutProgress>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workoutPlanId: { type: Schema.Types.ObjectId, ref: 'WorkoutPlan', required: true, index: true },
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true, index: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    trainerId: { type: Schema.Types.ObjectId, ref: 'User' },
    dayName: { type: String, default: 'General' },
    completedSets: { type: Number, default: 0 },
    totalSets: { type: Number, default: 3 },
    completedRepetitions: { type: Number, default: 0 },
    targetRepetitions: { type: Number, default: 12 },
    duration: { type: Number, default: 0 }, // in seconds
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Skipped'],
      default: 'Completed',
      index: true
    },
    completedAt: { type: Date, default: Date.now },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

workoutProgressSchema.index({ customerId: 1, completedAt: -1 });
workoutProgressSchema.index({ customerId: 1, workoutPlanId: 1 });

export default mongoose.model<IWorkoutProgress>('WorkoutProgress', workoutProgressSchema);
