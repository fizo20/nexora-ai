// src/models/ai-plan.model.ts
import { Schema, model, Types, Document } from "mongoose";

export type AIPlanStatus =
  | "GENERATED"
  | "SIMULATED"
  | "APPROVED"
  | "REJECTED"
  | "EXECUTED"
  | "FAILED";

export interface IAIPlan extends Document {
  workspaceId: Types.ObjectId;
  projectId: Types.ObjectId;

  instruction: string;

  steps: any[];

  riskScore: number;
  costEstimate: number;

  approvalRequired: boolean;
  approvedBy?: Types.ObjectId;

  status: AIPlanStatus;

  createdAt: Date;
  signature: String;
  signedAt: Date;
  executedAt: Date;
}

const aiPlanSchema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, required: true, index: true },

    instruction: { type: String, required: true },

    steps: {
      type: [Schema.Types.Mixed],
      required: true,
    },

    riskScore: { type: Number, required: true },
    costEstimate: { type: Number, required: true },

    approvalRequired: { type: Boolean, required: true },

    status: {
      type: String,
      enum: [
        "GENERATED",
        "APPROVED",
        "EXECUTED",
        "FAILED",
        "SIMULATED",
        "REJECTED",
      ],
      default: "GENERATED",
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    signature: { type: String },
    signatureVersion: { type: Number, default: 1 },
    signedAt: { type: Date },
    executedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

export const AIPlan = model("AIPlan", aiPlanSchema);
