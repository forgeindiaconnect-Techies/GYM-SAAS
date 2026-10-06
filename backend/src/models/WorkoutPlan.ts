import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkoutPlanExercise {
  exerciseId: mongoose.Types.ObjectId;
  order: number;
  sets: number;
  repetitions: number;
  duration: number; // in seconds
  restTime: number; // in seconds
  trainerNotes?: string;
}

export interface IWorkoutDay {
  dayName: string; // e.g. "Day 1 – Full Body", "Day 2 – Upper Body"
  focus?: string; // e.g. "Strength", "Hypertrophy", "Cardio"
  exercises: IWorkoutPlanExercise[];
}

export interface IWorkoutPlan extends Document {
  customerId: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  planName: string;
  description?: string;
  status: 'Draft' | 'Published' | 'Archived';
  workoutDays: IWorkoutDay[];
  aiRecommendationId?: mongoose.Types.ObjectId;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const workoutPlanExerciseSchema = new Schema<IWorkoutPlanExercise>(
  {
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
    order: { type: Number, default: 0 },
    sets: { type: Number, default: 3 },
    repetitions: { type: Number, default: 12 },
    duration: { type: Number, default: 60 },
    restTime: { type: Number, default: 30 },
    trainerNotes: { type: String, default: '' }
  },
  { _id: true }
);

const workoutDaySchema = new Schema<IWorkoutDay>(
  {
    dayName: { type: String, required: true, trim: true },
    focus: { type: String, default: 'General' },
    exercises: [workoutPlanExerciseSchema]
  },
  { _id: true }
);

const workoutPlanSchema = new Schema<IWorkoutPlan>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    trainerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    planName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { 
      type: String, 
      enum: ['Draft', 'Published', 'Archived'], 
      default: 'Draft',
      index: true 
    },
    workoutDays: [workoutDaySchema],
    aiRecommendationId: { type: Schema.Types.ObjectId, ref: 'AIRecommendation' },
    publishedAt: { type: Date }
  },
  { timestamps: true }
);

workoutPlanSchema.index({ customerId: 1, status: 1 });
workoutPlanSchema.index({ trainerId: 1, status: 1 });

export default mongoose.model<IWorkoutPlan>('WorkoutPlan', workoutPlanSchema);
