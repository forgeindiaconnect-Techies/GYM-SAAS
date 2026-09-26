import mongoose, { Document, Schema } from 'mongoose';

export enum TrainerSessionMode {
  ONLINE = 'Online',
  OFFLINE = 'Offline'
}

export enum TrainerSessionStatus {
  PENDING = 'Pending',
  AWAITING_PAYMENT = 'Awaiting Payment',
  CONFIRMED = 'Confirmed',
  UPCOMING = 'Upcoming',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  REJECTED = 'Rejected',
  RESCHEDULE_REQUESTED = 'Reschedule Requested',
  RESCHEDULED = 'Rescheduled',
  REFUND_PENDING = 'Refund Pending',
  REFUNDED = 'Refunded'
}

export interface ITrainerSession extends Document {
  sessionId?: string; // Optional unique string ID
  bookingId?: string; // Optional unique string ID
  customerId: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  mode: TrainerSessionMode;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  duration: number; // in minutes
  fee: number;
  status: TrainerSessionStatus;
  
  // Payment specifics
  paymentId?: mongoose.Types.ObjectId;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  
  // Online specifics
  meetingId?: string;
  meetingLink?: string;
  
  // Reschedule details
  originalDate?: string;
  originalStartTime?: string;
  rescheduleReason?: string;
  rescheduleRequestedBy?: 'Customer' | 'Trainer';
  rescheduleTimestamp?: Date;
  
  // Cancellation details
  cancelledBy?: 'Customer' | 'Trainer' | 'System';
  cancellationReason?: string;
  refundEligible?: boolean;
  refundAmount?: number;
  refundStatus?: 'Pending' | 'Processed';
  cancelledAt?: Date;

  // Actual completion metrics
  actualStartTime?: Date;
  actualEndTime?: Date;
  actualDuration?: number;
  completedAt?: Date;
  
  // Feedback
  customerRating?: number;
  customerReview?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const trainerSessionSchema = new Schema<ITrainerSession>(
  {
    sessionId: { type: String, sparse: true, unique: true },
    bookingId: { type: String, sparse: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    mode: { type: String, enum: Object.values(TrainerSessionMode), required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    duration: { type: Number, required: true },
    fee: { type: Number, required: true, default: 0 },
    status: { type: String, enum: Object.values(TrainerSessionStatus), default: TrainerSessionStatus.PENDING },

    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'] },
    
    meetingId: { type: String },
    meetingLink: { type: String },
    
    originalDate: { type: String },
    originalStartTime: { type: String },
    rescheduleReason: { type: String },
    rescheduleRequestedBy: { type: String, enum: ['Customer', 'Trainer'] },
    rescheduleTimestamp: { type: Date },
    
    cancelledBy: { type: String, enum: ['Customer', 'Trainer', 'System'] },
    cancellationReason: { type: String },
    refundEligible: { type: Boolean },
    refundAmount: { type: Number },
    refundStatus: { type: String, enum: ['Pending', 'Processed'] },
    cancelledAt: { type: Date },

    actualStartTime: { type: Date },
    actualEndTime: { type: Date },
    actualDuration: { type: Number },
    completedAt: { type: Date },
    
    customerRating: { type: Number, min: 1, max: 5 },
    customerReview: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<ITrainerSession>('TrainerSession', trainerSessionSchema);
