import mongoose, { Document, Schema } from 'mongoose';

export type ActivityType = 'Attendance' | 'Workout' | 'Streak';

export interface IChallengeActivityLog extends Document {
  challengeId: mongoose.Types.ObjectId;
  participantId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  activityType: ActivityType;
  sourceReferenceId?: string; // e.g. TrainerSession ID or WorkoutProgress ID or YYYY-MM-DD
  activityDate: Date;
  pointsAwarded: number;
  verifiedByTrainerId?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const challengeActivityLogSchema = new Schema<IChallengeActivityLog>(
  {
    challengeId: { type: Schema.Types.ObjectId, ref: 'FitnessChallenge', required: true, index: true },
    participantId: { type: Schema.Types.ObjectId, ref: 'ChallengeParticipant', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    activityType: {
      type: String,
      enum: ['Attendance', 'Workout', 'Streak'],
      required: true
    },
    sourceReferenceId: { type: String, trim: true },
    activityDate: { type: Date, required: true },
    pointsAwarded: { type: Number, default: 0, min: 0 },
    verifiedByTrainerId: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

// Prevent duplicate points/progress for the exact same source event within the same challenge
challengeActivityLogSchema.index(
  { challengeId: 1, customerId: 1, sourceReferenceId: 1 },
  { unique: true, partialFilterExpression: { sourceReferenceId: { $type: 'string' } } }
);

export default mongoose.model<IChallengeActivityLog>('ChallengeActivityLog', challengeActivityLogSchema);
