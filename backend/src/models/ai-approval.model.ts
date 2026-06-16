// src/models/ai-approval.model.ts
import { Schema, model, Types } from "mongoose";
import { AIActionPayload } from "../types/ai-system-actions.types";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXECUTED";

export interface IAiApproval {
  workspaceId: Types.ObjectId;
  projectId?: Types.ObjectId;

  userId: Types.ObjectId;

  action: AIActionPayload;

  status: ApprovalStatus;

  createdAt: Date;
  decidedAt?: Date;
}

const schema = new Schema<IAiApproval>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    projectId: {
      type: Schema.Types.ObjectId,
      required: false,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    action: {
      type: Schema.Types.Mixed,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "EXECUTED"],
      default: "PENDING",
      index: true,
    },

    decidedAt: Date,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const AIApproval = model<IAiApproval>("AIApproval", schema);
