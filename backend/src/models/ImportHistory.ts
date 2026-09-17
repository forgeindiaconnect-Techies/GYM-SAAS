import mongoose, { Document, Schema } from 'mongoose';

export enum ImportStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL',
}

export interface IFailedRow {
  rowNumber: number;
  data: Record<string, any>;
  errors: string[];
}

export interface IImportHistory extends Document {
  gymId: mongoose.Types.ObjectId;
  importedBy: mongoose.Types.ObjectId;
  fileName: string;
  status: ImportStatus;
  totalRecords: number;
  newCustomers: number;
  updatedCustomers: number;
  skippedCustomers: number;
  failedRecords: number;
  failedRows: IFailedRow[];
  createdAt: Date;
  updatedAt: Date;
}

const failedRowSchema = new Schema<IFailedRow>(
  {
    rowNumber: { type: Number, required: true },
    data: { type: Schema.Types.Mixed },
    errors: [{ type: String }],
  },
  { _id: false }
);

const importHistorySchema = new Schema<IImportHistory>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    importedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(ImportStatus),
      default: ImportStatus.PROCESSING,
    },
    totalRecords: { type: Number, default: 0 },
    newCustomers: { type: Number, default: 0 },
    updatedCustomers: { type: Number, default: 0 },
    skippedCustomers: { type: Number, default: 0 },
    failedRecords: { type: Number, default: 0 },
    failedRows: [failedRowSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IImportHistory>('ImportHistory', importHistorySchema);
