// src/models/usage-record.model.ts
import { Schema, model, Types, Document } from "mongoose";

export interface IUsageRecord extends Document {
  workspaceId: Types.ObjectId;
  metric: string;
  quantity: number;
  timestamp: Date;
}

const usageRecordSchema = new Schema<IUsageRecord>({
  workspaceId: {
    type: Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
    index: true,
  },
  metric: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const UsageRecord = model<IUsageRecord>(
  "UsageRecord",
  usageRecordSchema,
);
