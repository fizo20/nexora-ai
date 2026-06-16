// src/models/ai-execution-log.model.ts
import { Schema, model, Types, Document } from "mongoose";

export interface IAIExecutionLog extends Document {
  workspaceId: Types.ObjectId;
  projectId: Types.ObjectId;
  planId?: Types.ObjectId;

  stepId: string;
  action: string;

  status: "SUCCESS" | "FAILED" | "BLOCKED";

  input: any;
  output?: any;

  error?: string;

  rolledBack: boolean;

  createdAt: Date;
}

const schema = new Schema<IAIExecutionLog>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, required: true, index: true },
    planId: { type: Schema.Types.ObjectId },

    stepId: { type: String, required: true },
    action: { type: String, required: true },

    status: { type: String, required: true },

    input: Schema.Types.Mixed,
    output: Schema.Types.Mixed,

    error: String,

    rolledBack: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const AIExecutionLog = model("AIExecutionLog", schema);
