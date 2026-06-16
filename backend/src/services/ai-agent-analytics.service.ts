// backend/src/services/ai-agent-analytics.service.ts

import { AIAgentExecution } from "../models/ai-agent-execution.model";

export async function getAgentAnalytics(workspaceId: string) {
  const data = await AIAgentExecution.aggregate([
    {
      $match: {
        workspaceId,
      },
    },

    {
      $group: {
        _id: "$agentType",

        executions: {
          $sum: 1,
        },

        successful: {
          $sum: {
            $cond: ["$success", 1, 0],
          },
        },

        failed: {
          $sum: {
            $cond: ["$success", 0, 1],
          },
        },

        steps: {
          $sum: "$totalSteps",
        },
      },
    },
  ]);

  return data.map((row) => ({
    agentType: row._id,

    executions: row.executions,

    successRate:
      row.executions === 0
        ? 0
        : Number(((row.successful / row.executions) * 100).toFixed(2)),

    failureRate:
      row.executions === 0
        ? 0
        : Number(((row.failed / row.executions) * 100).toFixed(2)),

    totalSteps: row.steps,
  }));
}
