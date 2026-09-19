import mongoose, { Document, Schema } from 'mongoose';

export type AIRecommendationStatus = 
  | 'AI Generated' 
  | 'Under Trainer Review' 
  | 'Trainer Modified' 
  | 'Trainer Approved' 
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
  fitnessProfile: {
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    fitnessGoal?: string;
    experienceLevel?: string;
    activityLevel?: string;
    workoutPreference?: string;
    availableWorkoutDays?: string;
    preferredWorkoutDuration?: string;
    foodPreferences?: string;
    dietaryPreferences?: string;
  };
  
  // AI Outputs
  aiAnalysis?: {
    profileSummary: string;
    goalRecommendations: string;
    generalActivity: string;
  };
  
  workoutRecommendation?: {
    weeklySchedule: string;
    exercises: Array<{
      name: string;
      sets: number | string;
      reps: string;
      duration: string;
      rest: string;
      difficulty: string;
    }>;
  };
  
  dietRecommendation?: {
    generalStructure: string;
    mealTiming: string;
    foodOptions: string;
  };
  
  routine?: {
    dailyRoutine: string;
    workoutDays: string;
    restDays: string;
    lifestyleSuggestions: string;
  };
  
  progressSuggestions?: {
    focusAreas: string;
    improvementSuggestions: string;
    progressTracking: string;
  };
  
  // Trainer appended data
  trainerNotes?: string;
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
    enum: ['AI Generated', 'Under Trainer Review', 'Trainer Modified', 'Trainer Approved', 'Archived'], 
    default: 'AI Generated' 
  },
  version: { type: Number, default: 1 },
  originalRecommendationId: { type: Schema.Types.ObjectId, ref: 'AIRecommendation' },
  
  fitnessProfile: {
    age: Number,
    gender: String,
    height: Number,
    weight: Number,
    fitnessGoal: String,
    experienceLevel: String,
    activityLevel: String,
    workoutPreference: String,
    availableWorkoutDays: String,
    preferredWorkoutDuration: String,
    foodPreferences: String,
    dietaryPreferences: String,
  },
  
  aiAnalysis: {
    profileSummary: String,
    goalRecommendations: String,
    generalActivity: String,
  },
  
  workoutRecommendation: {
    weeklySchedule: String,
    exercises: [{
      name: String,
      sets: Schema.Types.Mixed,
      reps: String,
      duration: String,
      rest: String,
      difficulty: String,
    }],
  },
  
  dietRecommendation: {
    generalStructure: String,
    mealTiming: String,
    foodOptions: String,
  },
  
  routine: {
    dailyRoutine: String,
    workoutDays: String,
    restDays: String,
    lifestyleSuggestions: String,
  },
  
  progressSuggestions: {
    focusAreas: String,
    improvementSuggestions: String,
    progressTracking: String,
  },
  
  trainerNotes: String,
  approvedAt: Date,

}, { timestamps: true });

export default mongoose.model<IAIRecommendation>('AIRecommendation', aiRecommendationSchema);
