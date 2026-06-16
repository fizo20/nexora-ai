// src/services/ai-execution-step.service.ts
import { createTask, updateTask } from "./tasks.service";
import { AIActionPayload } from "../types/ai-system-actions.types";

/**
 * Pure AI action executor.
 * Executes exactly ONE action.
 * No retry logic.
 * No execution loading.
 * No DB mutation of AIExecution.
 */
export const executeSingleAIStep = async (
  workspaceId: string,
  projectId: string,
  action: AIActionPayload,
) => {
  switch (action.action) {
    case "create_task": {
      return createTask(workspaceId, projectId, {
        title: action.title,
        description: action.description,
        priority: action.priority,
      });
    }

    case "update_task_status": {
      return updateTask(workspaceId, action.taskId, {
        status: action.status,
      });
    }

    case "set_task_priority": {
      return updateTask(workspaceId, action.taskId, {
        priority: action.priority,
      });
    }

    default: {
      const exhaustiveCheck: never = action;
      throw new Error("Unsupported AI action");
    }
  }
};
