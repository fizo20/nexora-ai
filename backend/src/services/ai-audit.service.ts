// src/services/ai-audit.service.ts
import crypto from "crypto";
import { Types } from "mongoose";
import { AIAudit } from "../models/ai-audit.model";
import { AIAuditAction } from "../types/ai-audit.types";
import { AI_MODEL_COST } from "../config/ai-model-cost.config";

const hashText = (text: string) =>
  crypto.createHash("sha256").update(text).digest("hex");

export const logAIAudit = async (params: {
  workspaceId: string;
  userId: string;
  action: AIAuditAction;
  endpoint: string;
  prompt?: string;
  output?: string;
  model?: string;
}) => {
  try {
    const modelName = params.model ?? "mock-ai";

    const modelPricing =
      AI_MODEL_COST[modelName as keyof typeof AI_MODEL_COST] ??
      AI_MODEL_COST["mock-ai"];

    const inputSize = params.prompt?.length ?? 0;
    const outputSize = params.output?.length ?? 0;

    const rawCost =
      (inputSize / 1000) * modelPricing.inputPer1K +
      (outputSize / 1000) * modelPricing.outputPer1K;

    const cost = Number(rawCost.toFixed(6));

    await AIAudit.create({
      workspaceId: new Types.ObjectId(params.workspaceId),
      userId: new Types.ObjectId(params.userId),

      action: params.action,
      endpoint: params.endpoint,

      promptHash: params.prompt ? hashText(params.prompt) : "system",

      inputSize,
      outputSize,

      aiModel: modelName,
      cost,
    });
  } catch (err) {
    console.error("AI Audit Logging Failed:", err);
  }
};

export const logAICall = async ({
  workspaceId,
  projectId,
  userId,
  inputSize,
  outputSize,
}: {
  workspaceId: string;
  projectId?: string;
  userId: string;
  inputSize: number;
  outputSize: number;
}) => {
  await AIAudit.create({
    workspaceId: new Types.ObjectId(workspaceId),
    projectId: projectId ? new Types.ObjectId(projectId) : undefined,
    userId: new Types.ObjectId(userId),
    inputSize,
    outputSize,
  });
};
