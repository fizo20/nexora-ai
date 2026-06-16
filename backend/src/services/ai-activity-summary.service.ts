// backend/src/services/ai-activity-summary.service.ts
import { AIActivity } from "../models/ai-activity.model";

export async function summarizeRecentActivity(
  workspaceId: string,
  projectId: string,
) {
  const activities = await AIActivity.find({
    workspaceId,
    projectId,
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  if (!activities.length) return null;

  const summaryParts: string[] = [];

  const created = activities.filter((a) => a.type === "create_task").length;
  const updated = activities.filter(
    (a) => a.type === "update_task_status",
  ).length;
  const skipped = activities.filter(
    (a) => a.type === "create_task_skipped",
  ).length;

  if (created) summaryParts.push(`created ${created} tasks`);
  if (updated) summaryParts.push(`updated ${updated} tasks`);
  if (skipped) summaryParts.push(`avoided ${skipped} duplicates`);

  return `AI recently ${summaryParts.join(", ")}`;
}
