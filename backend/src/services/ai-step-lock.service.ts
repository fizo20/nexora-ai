// src/services/ai-step-lock.service.ts
import { AIExecution } from "../models/ai-execution.model";
import { AppError } from "../errors/app-error";

export const acquireStepLock = async (
  workspaceId: string,
  executionId: string,
  stepIndex: number,
) => {
  const execution = await AIExecution.findOneAndUpdate(
    {
      workspaceId,
      executionId,
      [`steps.${stepIndex}.isLocked`]: false, // 🔒 only if not locked
    },
    {
      $set: {
        [`steps.${stepIndex}.isLocked`]: true,
        [`steps.${stepIndex}.lockedAt`]: new Date(),
      },
    },
    { new: true },
  );

  if (!execution) {
    throw new AppError("Step is already locked or execution not found", 409);
  }

  return execution;
};

export const releaseStepLock = async (
  workspaceId: string,
  executionId: string,
  stepIndex: number,
) => {
  await AIExecution.updateOne(
    {
      workspaceId,
      executionId,
    },
    {
      $set: {
        [`steps.${stepIndex}.isLocked`]: false,
        [`steps.${stepIndex}.lockedAt`]: null,
      },
    },
  );
};

export async function lockStep(executionId: string, stepIndex: number) {
  const execution = await AIExecution.findOneAndUpdate(
    {
      _id: executionId,
      "steps.index": stepIndex,
      "steps.lockedAt": { $exists: false },
    },
    {
      $set: {
        "steps.$.lockedAt": new Date(),
      },
    },
    { new: true },
  );

  return !!execution;
}
