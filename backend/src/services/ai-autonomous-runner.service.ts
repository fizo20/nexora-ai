// src/services/ai-autonomous-runner.service.ts

import { runAutonomousCheck } from "./ai-autonomous-engine.service";
import { discoverWorkspacesAndProjects } from "./ai-autonomous-discovery.service";

let isRunning = false;

export function startAutonomousRunner(interval = 60000) {
  console.log("🤖 Autonomous AI Runner started...");

  setInterval(async () => {
    if (isRunning) {
      console.log("⏳ Previous AI run still running...");
      return;
    }

    isRunning = true;

    try {
      const targets = await discoverWorkspacesAndProjects();

      for (const target of targets) {
        await runAutonomousCheck({
          workspaceId: target.workspaceId,
          projectId: target.projectId,
        });
      }
    } catch (error) {
      console.error("❌ Autonomous AI error:", error);
    } finally {
      isRunning = false;
    }
  }, interval);
}
