// src/services/ai-rate-limit.service.ts
import { AIUsageWindow } from "../models/ai-usage-window.model";
import { AppError } from "../errors/app-error";

const WINDOW_MINUTES = 60;

function currentWindowStart() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - (now.getMinutes() % WINDOW_MINUTES));
  now.setSeconds(0);
  now.setMilliseconds(0);
  return now;
}

export async function checkAIQuota(
  workspaceId: string,
  type: "plans" | "executions" | "simulations",
  limit: number,
) {
  const windowStart = currentWindowStart();

  const usage = await AIUsageWindow.findOneAndUpdate(
    { workspaceId, windowStart },
    { $inc: { [type]: 1 } },
    { upsert: true, new: true },
  );

  if ((usage as any)[type] > limit) {
    throw new AppError(`AI ${type} limit exceeded (${limit}/hour)`, 429);
  }
}
