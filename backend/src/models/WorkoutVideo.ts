import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkoutVideo extends Document {
  trainerId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  title: string;
  exerciseName: string;
  videoUrl: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  instructions: string;
  sets: string;
  reps: string;
  trainerNotes?: string;
  status: 'Assigned' | 'In Progress' | 'Completed';
  completedAt?: Date;
  sessionRefId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const workoutVideoSchema = new Schema<IWorkoutVideo>(
  {
    trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    title: { type: String, required: true },
    exerciseName: { type: String, required: true },
    videoUrl: { type: String, required: true },
    difficultyLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    duration: { type: String, default: '10 mins' },
    instructions: { type: String },
    sets: { type: String, default: '3' },
    reps: { type: String, default: '12' },
    trainerNotes: { type: String },
    status: { type: String, enum: ['Assigned', 'In Progress', 'Completed'], default: 'Assigned' },
    completedAt: { type: Date },
    sessionRefId: { type: Schema.Types.ObjectId, ref: 'TrainerSession' }
  },
  { timestamps: true }
);

export default mongoose.model<IWorkoutVideo>('WorkoutVideo', workoutVideoSchema);
