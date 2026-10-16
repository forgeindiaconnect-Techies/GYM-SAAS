import mongoose, { Document, Schema } from 'mongoose';

export interface ITrainerPlanRequest extends Document {
  customerId: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  planType: 'Workout Plan' | 'Diet Plan' | 'Exercise Videos' | 'Exercise Library';
  title: string;
  goal?: string;
  customerMessage: string;
  trainerFeedback?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  workoutDetails?: {
    days: {
      dayName: string;
      focus?: string;
      exercises: {
        name: string;
        sets: number;
        reps: string;
        duration?: number;
        rest?: string;
        notes?: string;
      }[];
    }[];
  };
  dietDetails?: {
    dailyCalories?: number | string;
    protein?: string;
    carbs?: string;
    fats?: string;
    hydration?: string;
    meals: {
      mealName: string;
      time: string;
      items: string;
      calories?: string;
      protein?: string;
    }[];
    guidelines?: string[];
  };
  videoDetails?: {
    videoTitle: string;
    exerciseName: string;
    videoUrl?: string;
    instructions?: string;
  }[];
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const trainerPlanRequestSchema = new Schema<ITrainerPlanRequest>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    trainerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    planType: {
      type: String,
      enum: ['Workout Plan', 'Diet Plan', 'Exercise Videos', 'Exercise Library'],
      default: 'Workout Plan',
      required: true
    },
    title: { type: String, required: true, trim: true },
    goal: { type: String, default: '' },
    customerMessage: { type: String, required: true, trim: true },
    trainerFeedback: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true
    },
    workoutDetails: {
      days: [
        {
          dayName: { type: String, required: true },
          focus: { type: String, default: 'General' },
          exercises: [
            {
              name: { type: String, required: true },
              sets: { type: Number, default: 3 },
              reps: { type: String, default: '10-12' },
              duration: { type: Number, default: 60 },
              rest: { type: String, default: '60s' },
              notes: { type: String, default: '' }
            }
          ]
        }
      ]
    },
    dietDetails: {
      dailyCalories: { type: Schema.Types.Mixed, default: '2200 kcal' },
      protein: { type: String, default: '140g' },
      carbs: { type: String, default: '220g' },
      fats: { type: String, default: '60g' },
      hydration: { type: String, default: '3.0 L/day' },
      meals: [
        {
          mealName: { type: String, required: true },
          time: { type: String, default: '08:00 AM' },
          items: { type: String, required: true },
          calories: { type: String, default: '500 kcal' },
          protein: { type: String, default: '30g' }
        }
      ],
      guidelines: [{ type: String }]
    },
    videoDetails: [
      {
        videoTitle: { type: String },
        exerciseName: { type: String },
        videoUrl: { type: String },
        instructions: { type: String }
      }
    ],
    approvedAt: { type: Date },
    rejectedAt: { type: Date }
  },
  { timestamps: true }
);

trainerPlanRequestSchema.index({ customerId: 1, status: 1 });
trainerPlanRequestSchema.index({ trainerId: 1, status: 1 });

export default mongoose.model<ITrainerPlanRequest>('TrainerPlanRequest', trainerPlanRequestSchema);
