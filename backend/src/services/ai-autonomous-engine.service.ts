// src/services/ai-autonomous-engine.service.ts
import { buildWorkspaceState } from "./ai-context.service";
import { runAgentSupervisor } from "./ai-agent-supervisor.service";
import { AIActivity } from "../models/ai-activity.model";
import { summarizeRecentActivity } from "./ai-activity-summary.service";

interface AutonomousCheckInput {
  workspaceId: string;
  projectId: string;
}

export async function runAutonomousCheck(input: AutonomousCheckInput) {
  const { workspaceId, projectId } = input;

  const state = await buildWorkspaceState(workspaceId, projectId);

  const triggers: string[] = [];

  /* ======================== */
  if (state.blockedTasks > 0) {
    triggers.push(
      `Resolve ${state.blockedTasks} blocked tasks and propose solutions`,
    );
  }

  if (state.overdueTasks > 0) {
    triggers.push(
      `Handle ${state.overdueTasks} overdue tasks and suggest recovery plan`,
    );
  }

  if (!triggers.length) {
    return {
      message: "Workspace healthy — no AI intervention required",
    };
  }

  const results = [];

  for (const goal of triggers) {
    await AIActivity.create({
      workspaceId,
      projectId,
      type: "autonomous_trigger",
      message: `AI detected issue: ${goal}`,
    });

    const result = await runAgentSupervisor({
      workspaceId,
      projectId,
      userId: "SYSTEM_AI",
      goal,
    });
    console.log("AI RESULT:", JSON.stringify(result, null, 2));
    results.push(result);

    await AIActivity.create({
      workspaceId,
      projectId,
      type: "autonomous_action",
      message: `AI executed: ${goal}`,
      metadata: { result },
    });
  }

  /* =========================
     ✅ SINGLE SUMMARY (CORRECT)
  ========================= */
  const summary = await summarizeRecentActivity(workspaceId, projectId);

  if (summary) {
    await AIActivity.create({
      workspaceId,
      projectId,
      type: "ai_summary",
      message: summary,
    });
  }

  return {
    triggers,
    results,
  };
}
