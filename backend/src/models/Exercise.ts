import mongoose, { Document, Schema } from 'mongoose';

export interface IExercise extends Document {
  gymId: mongoose.Types.ObjectId;
  gymOwnerId: mongoose.Types.ObjectId;
  name: string;
  category: string; // Legs, Chest, Back, Shoulders, Arms, Core, Cardio, Full Body, Flexibility
  targetMuscle: string;
  secondaryMuscle?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: string;
  description: string;
  instructions: string;
  safetyInstructions?: string;
  defaultDuration: number; // in seconds
  defaultSets: number;
  defaultRepetitions: number;
  defaultRest: number; // in seconds
  videoUrl?: string;
  thumbnailUrl?: string;
  animationType?: 'video' | 'animation' | 'gif';
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const exerciseSchema = new Schema<IExercise>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    gymOwnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    category: { 
      type: String, 
      required: true, 
      trim: true,
      index: true 
    },
    targetMuscle: { type: String, required: true, trim: true },
    secondaryMuscle: { type: String, trim: true },
    difficulty: { 
      type: String, 
      enum: ['Beginner', 'Intermediate', 'Advanced'], 
      default: 'Beginner',
      index: true 
    },
    equipment: { type: String, default: 'No Equipment', trim: true },
    description: { type: String, default: '' },
    instructions: { type: String, default: '' },
    safetyInstructions: { type: String, default: '' },
    defaultDuration: { type: Number, default: 60 },
    defaultSets: { type: Number, default: 3 },
    defaultRepetitions: { type: Number, default: 12 },
    defaultRest: { type: Number, default: 30 },
    videoUrl: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    animationType: { 
      type: String, 
      enum: ['video', 'animation', 'gif'], 
      default: 'video' 
    },
    status: { 
      type: String, 
      enum: ['Active', 'Inactive'], 
      default: 'Active',
      index: true 
    }
  },
  { timestamps: true }
);

exerciseSchema.index({ gymId: 1, name: 1 });
exerciseSchema.index({ gymId: 1, category: 1 });

export default mongoose.model<IExercise>('Exercise', exerciseSchema);
