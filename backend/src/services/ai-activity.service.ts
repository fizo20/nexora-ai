import { AIActivity } from "../models/ai-activity.model";
import { emitActivity } from "../socket/activity.gateway";

interface CreateActivityInput {
  workspaceId: string;
  projectId: string;
  type: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export async function createAIActivity(input: CreateActivityInput) {
  const activity = await AIActivity.create({
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    type: input.type,
    message: input.message,
    metadata: input.metadata,
  });

  emitActivity(input.workspaceId, activity);

  return activity;
}
