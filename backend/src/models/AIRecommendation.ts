import mongoose, { Document, Schema } from 'mongoose';

export type AIRecommendationStatus = 
  | 'AI Generated' 
  | 'Pending Trainer Review'
  | 'Under Trainer Review' 
  | 'Trainer Edited'
  | 'Trainer Approved' 
  | 'Published to Customer'
  | 'Trainer Modified' 
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
  
  // Snapshot of user assessment inputs
  fitnessProfile: any;
  
  // AI Outputs (Initial Draft)
  aiAnalysis?: {
    fitnessSummary?: string;
    profileSummary?: string;
    goalAnalysis?: string;
    recommendedApproach?: string;
    assessment?: string;
    limitations?: string;
    generalRecommendations?: string;
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
  workoutPlan?: any[];
  
  dietRecommendation?: {
    morning: string;
    breakfast: string;
    lunch: string;
    evening: string;
    dinner: string;
    hydration?: string;
    note: string;
  };

  recoveryRecommendations?: {
    sleep: string;
    activeRecovery: string;
    stretchingMobility: string;
    notes?: string;
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
    startingWeight?: string;
  };
  
  // Trainer appended data
  trainerRecommendations?: any;
  trainerNotes?: string;
  revisionDetails?: {
    reason: string;
    trainerName: string;
    date: Date;
  };

  // Version & Audit Tracking (Requirement 7)
  originalAiDraft?: {
    generatedAt: Date;
    aiAnalysis?: any;
    workoutRecommendation?: any;
    dietRecommendation?: any;
    recoveryRecommendations?: any;
    routine?: any;
  };

  trainerModifications?: {
    modifiedByTrainerId?: mongoose.Types.ObjectId;
    modifiedByTrainerName?: string;
    modifiedAt?: Date;
    hasModifications: boolean;
    workoutModifications?: Array<{
      exerciseName: string;
      changeType: 'modified' | 'added' | 'removed' | 'replaced';
      originalSets?: any;
      newSets?: any;
      originalReps?: string;
      newReps?: string;
      originalDuration?: string;
      newDuration?: string;
      originalDifficulty?: string;
      newDifficulty?: string;
      details?: string;
    }>;
    dietModifications?: any;
    recoveryModifications?: any;
    trainerSpecificRecommendations?: any;
    trainerNotes?: string;
    summaryNotes?: string;
  };

  // Final Approved Customer Output (Requirement 6 & 7)
  finalApprovedPlan?: {
    approvedAt: Date;
    approvedByTrainerId?: mongoose.Types.ObjectId;
    approvedByTrainerName?: string;
    publishedAt?: Date;
    fitnessSummary?: string;
    workoutPlan?: {
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
    dietPlan?: any;
    recoveryPlan?: any;
    trainerRecommendations?: any;
    trainerNotes?: string;
  };

  memberReply?: {
    message: string;
    date: Date;
  };
  trainerReply?: {
    message: string;
    date: Date;
  };
  chatMessages?: Array<{
    senderRole: 'TRAINER' | 'MEMBER';
    senderName: string;
    message: string;
    date: Date;
  }>;
  approvedAt?: Date;

  // AI Re-analysis fields
  isReanalysis?: boolean;
  reanalysisComparison?: {
    initialWeight?: number;
    currentWeight?: number;
    weightChange?: string;
    attendancePercentage?: number;
    videoCompletionPercentage?: number;
    initialVSCurrentSummary?: string;
    areasOfImprovement?: string;
    trainerAttentionAreas?: string;
    nextStepRecommendations?: string;
  };

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
    enum: [
      'AI Generated', 
      'Pending Trainer Review',
      'Under Trainer Review', 
      'Trainer Edited',
      'Trainer Approved', 
      'Published to Customer',
      'Trainer Modified', 
      'Revision Requested', 
      'Archived'
    ], 
    default: 'Pending Trainer Review' 
  },
  version: { type: Number, default: 1 },
  originalRecommendationId: { type: Schema.Types.ObjectId, ref: 'AIRecommendation' },
  
  fitnessProfile: { type: Schema.Types.Mixed },
  
  aiAnalysis: {
    fitnessSummary: String,
    profileSummary: String,
    goalAnalysis: String,
    recommendedApproach: String,
    assessment: String,
    limitations: String,
    generalRecommendations: String,
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
  workoutPlan: [{ type: Schema.Types.Mixed }],
  
  dietRecommendation: {
    morning: String,
    breakfast: String,
    lunch: String,
    evening: String,
    dinner: String,
    hydration: String,
    note: String,
  },

  recoveryRecommendations: {
    sleep: String,
    activeRecovery: String,
    stretchingMobility: String,
    notes: String,
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
  
  trainerRecommendations: { type: Schema.Types.Mixed },
  trainerNotes: String,
  revisionDetails: {
    reason: String,
    trainerName: String,
    date: Date
  },

  // Audit / Version Tracking Fields
  originalAiDraft: {
    generatedAt: { type: Date, default: Date.now },
    aiAnalysis: { type: Schema.Types.Mixed },
    workoutRecommendation: { type: Schema.Types.Mixed },
    dietRecommendation: { type: Schema.Types.Mixed },
    recoveryRecommendations: { type: Schema.Types.Mixed },
    routine: { type: Schema.Types.Mixed },
  },

  trainerModifications: {
    modifiedByTrainerId: { type: Schema.Types.ObjectId, ref: 'Trainer' },
    modifiedByTrainerName: String,
    modifiedAt: Date,
    hasModifications: { type: Boolean, default: false },
    workoutModifications: [{
      exerciseName: String,
      changeType: { type: String, enum: ['modified', 'added', 'removed', 'replaced'] },
      originalSets: Schema.Types.Mixed,
      newSets: Schema.Types.Mixed,
      originalReps: String,
      newReps: String,
      originalDuration: String,
      newDuration: String,
      originalDifficulty: String,
      newDifficulty: String,
      details: String,
    }],
    dietModifications: { type: Schema.Types.Mixed },
    recoveryModifications: { type: Schema.Types.Mixed },
    trainerSpecificRecommendations: { type: Schema.Types.Mixed },
    trainerNotes: String,
    summaryNotes: String,
  },

  finalApprovedPlan: {
    approvedAt: Date,
    approvedByTrainerId: { type: Schema.Types.ObjectId, ref: 'Trainer' },
    approvedByTrainerName: String,
    publishedAt: Date,
    fitnessSummary: String,
    workoutPlan: {
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
    dietPlan: { type: Schema.Types.Mixed },
    recoveryPlan: { type: Schema.Types.Mixed },
    trainerRecommendations: { type: Schema.Types.Mixed },
    trainerNotes: String,
  },

  memberReply: {
    message: String,
    date: Date
  },
  trainerReply: {
    message: String,
    date: Date
  },
  chatMessages: [{
    senderRole: { type: String, enum: ['TRAINER', 'MEMBER'] },
    senderName: String,
    message: String,
    date: { type: Date, default: Date.now }
  }],
  approvedAt: Date,
  isReanalysis: { type: Boolean, default: false },
  reanalysisComparison: {
    initialWeight: Number,
    currentWeight: Number,
    weightChange: String,
    attendancePercentage: Number,
    videoCompletionPercentage: Number,
    initialVSCurrentSummary: String,
    areasOfImprovement: String,
    trainerAttentionAreas: String,
    nextStepRecommendations: String
  }
}, { timestamps: true });

export default mongoose.model<IAIRecommendation>('AIRecommendation', aiRecommendationSchema);
