// src/models/ai-context.model.ts
import { Schema, model, Types, Document } from "mongoose";
import { AIFeatureType } from "../types/ai-feature.types";

export interface IAIContext extends Document {
  workspaceId: Types.ObjectId;
  projectId?: Types.ObjectId;

  type: AIFeatureType;

  input: string;
  output: string;

  createdAt: Date;
}

const aiContextSchema = new Schema<IAIContext>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      index: true,
      required: true,
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      index: true,
    },

    type: {
      type: String,
      required: true,
      index: true,
    },

    input: {
      type: String,
      required: true,
    },

    output: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const AIContext = model<IAIContext>("AIContext", aiContextSchema);
