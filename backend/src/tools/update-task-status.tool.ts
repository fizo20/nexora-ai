// src/tools/update-task-status.tool.ts
import { aiToolRegistry } from "../services/ai-tool-registry.service";
import { AIActivity } from "../models/ai-activity.model";
// import { Task } from "../models/task.model";

async function executeUpdateTaskStatus(payload: any, context: any) {
  const { workspaceId, projectId } = context;
  const { taskId, status } = payload;

  const allowedStatus = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];

  if (!allowedStatus.includes(status)) {
    throw new Error("Invalid status value");
  }

  console.log("🔥 Updating task status:", payload);

  if (!taskId) {
    throw new Error("taskId is required");
  }

  if (!status) {
    throw new Error("status is required");
  }

  // 🔥 REAL DB LOGIC (uncomment when model ready)
  /*
  const task = await Task.findOneAndUpdate(
    { _id: taskId, workspaceId, projectId },
    { status },
    { new: true }
  );

  if (!task) {
    throw new Error("Task not found");
  }
  */

  await AIActivity.create({
    workspaceId,
    projectId,
    type: "update_task_status",
    message: `Updated task status to "${status}"`,
    metadata: { taskId },
  });

  return {
    ok: true,
    data: {
      taskId,
      status,
    },
  };
}

aiToolRegistry.register({
  name: "update_task_status",
  description: "Update the status of a task (TODO, IN_PROGRESS, DONE)",
  execute: executeUpdateTaskStatus,
});
