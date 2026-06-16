// src/services/ai-approval.service.ts
import { AIApproval } from "../models/ai-approval.model";
import { AIActionPayload } from "../types/ai-system-actions.types";

export async function createApprovalRequest(
  workspaceId: string,
  userId: string,
  projectId: string | undefined,
  action: AIActionPayload,
) {
  return AIApproval.create({
    workspaceId,
    userId,
    projectId,
    action,
    status: "PENDING",
  });
}

export async function approveRequest(id: string) {
  return AIApproval.findByIdAndUpdate(
    id,
    {
      status: "APPROVED",
      decidedAt: new Date(),
    },
    { new: true },
  );
}

export async function rejectRequest(id: string) {
  return AIApproval.findByIdAndUpdate(
    id,
    {
      status: "REJECTED",
      decidedAt: new Date(),
    },
    { new: true },
  );
}

export async function markExecuted(id: string) {
  return AIApproval.findByIdAndUpdate(
    id,
    {
      status: "EXECUTED",
    },
    { new: true },
  );
}
