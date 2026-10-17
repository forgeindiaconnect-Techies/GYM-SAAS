import mongoose, { Document, Schema } from 'mongoose';

export interface IDietProgress extends Document {
  customerId: mongoose.Types.ObjectId;
  gymId?: mongoose.Types.ObjectId;
  trainerId?: mongoose.Types.ObjectId;
  dayName: string; // 'Monday', 'Tuesday', etc.
  mealId: number;
  mealType: string;
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  completed: boolean;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const dietProgressSchema = new Schema<IDietProgress>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: false, index: true },
    trainerId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    dayName: { type: String, required: true },
    mealId: { type: Number, required: true },
    mealType: { type: String, default: 'Meal' },
    items: [{ type: String }],
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
    completed: { type: Boolean, default: true },
    completedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

dietProgressSchema.index({ customerId: 1, dayName: 1, mealId: 1 });
dietProgressSchema.index({ trainerId: 1, completedAt: -1 });

export default mongoose.model<IDietProgress>('DietProgress', dietProgressSchema);
