import mongoose, { Document, Schema } from 'mongoose';

export type AIRecommendationStatus = 
  | 'AI Generated' 
  | 'Under Trainer Review' 
  | 'Trainer Modified' 
  | 'Trainer Approved' 
  | 'Revision Requested'
  | 'Archived';

export interface IAIRecommendation extends Document {
  customerId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  trainerId?: mongoose.Types.ObjectId;
  
  status: AIRecommendationStatus;
  version: number;
  originalRecommendationId?: mongoose.Types.ObjectId;
  
  // Snapshot of user inputs when requested
  fitnessProfile: any;
  
  // AI Outputs
  aiAnalysis?: {
    profileSummary: string;
    assessment: string;
  };
  
  workoutRecommendation?: {
    weeklySchedule: Array<{
      day: string;
      workout: string;
      duration: string;
    }>;
    exercises: Array<{
      name: string;
      sets: number | string;
      reps: string;
      duration: string;
      rest: string;
      difficulty: string;
      targetMuscleGroup: string;
    }>;
  };
  
  dietRecommendation?: {
    morning: string;
    breakfast: string;
    lunch: string;
    evening: string;
    dinner: string;
    note: string;
  };
  
  routine?: {
    morning: string;
    workoutTime: string;
    evening: string;
    night: string;
  };
  
  progressSuggestions?: {
    focusAreas: string;
    improvementSuggestions: string;
    progressTracking: string;
  };
  
  // Trainer appended data
  trainerNotes?: string;
  revisionDetails?: {
    reason: string;
    trainerName: string;
    date: Date;
  };
  approvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const aiRecommendationSchema = new Schema<IAIRecommendation>({
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
  trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer' },
  
  status: { 
    type: String, 
    enum: ['AI Generated', 'Under Trainer Review', 'Trainer Modified', 'Trainer Approved', 'Revision Requested', 'Archived'], 
    default: 'AI Generated' 
  },
  version: { type: Number, default: 1 },
  originalRecommendationId: { type: Schema.Types.ObjectId, ref: 'AIRecommendation' },
  
  fitnessProfile: { type: Schema.Types.Mixed },
  
  aiAnalysis: {
    profileSummary: String,
    assessment: String,
  },
  
  workoutRecommendation: {
    weeklySchedule: [{
      day: String,
      workout: String,
      duration: String,
    }],
    exercises: [{
      name: String,
      sets: Schema.Types.Mixed,
      reps: String,
      duration: String,
      rest: String,
      difficulty: String,
      targetMuscleGroup: String,
    }],
  },
  
  dietRecommendation: {
    morning: String,
    breakfast: String,
    lunch: String,
    evening: String,
    dinner: String,
    note: String,
  },
  
  routine: {
    morning: String,
    workoutTime: String,
    evening: String,
    night: String,
  },
  
  progressSuggestions: {
    focusAreas: String,
    improvementSuggestions: String,
    progressTracking: String,
    startingWeight: String,
  },
  
  trainerNotes: String,
  revisionDetails: {
    reason: String,
    trainerName: String,
    date: Date
  },
  approvedAt: Date,

}, { timestamps: true });

export default mongoose.model<IAIRecommendation>('AIRecommendation', aiRecommendationSchema);
