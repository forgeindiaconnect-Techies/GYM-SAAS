import mongoose, { Document, Schema } from 'mongoose';

export type MessageType = 'text' | 'voice' | 'image' | 'video' | 'file';
export type AttachmentCategory = 'image' | 'video' | 'audio' | 'document' | 'other';

export interface IAttachment {
  url: string;
  fileName: string;
  fileType: AttachmentCategory;
  mimeType: string;
  fileSize: number;
  duration?: number; // duration in seconds for voice/audio/video
  publicId?: string;
}

export interface IDirectMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  gymId?: mongoose.Types.ObjectId;
  message: string;
  messageType: MessageType;
  attachments: IAttachment[];
  
  // Single-attachment convenience fields for seamless backward/forward compatibility
  attachmentUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  duration?: number;
  
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    url: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { 
      type: String, 
      enum: ['image', 'video', 'audio', 'document', 'other'], 
      default: 'other' 
    },
    mimeType: { type: String },
    fileSize: { type: Number, default: 0 },
    duration: { type: Number },
    publicId: { type: String }
  },
  { _id: false }
);

const DirectMessageSchema = new Schema<IDirectMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym' },
    message: { type: String, default: '', trim: true },
    messageType: { 
      type: String, 
      enum: ['text', 'voice', 'image', 'video', 'file'], 
      default: 'text' 
    },
    attachments: { type: [AttachmentSchema], default: [] },
    attachmentUrl: { type: String },
    fileName: { type: String },
    fileType: { type: String },
    fileSize: { type: Number },
    duration: { type: Number },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DirectMessageSchema.index({ senderId: 1, receiverId: 1 });
DirectMessageSchema.index({ receiverId: 1, read: 1 });
DirectMessageSchema.index({ createdAt: 1 });

export default mongoose.model<IDirectMessage>('DirectMessage', DirectMessageSchema);
