// src/services/ai-skill-learner.service.ts
import { AIExecutionMemory } from "../models/ai-execution-memory.model";
import { AISkillModel } from "../models/ai-skill.model";

/**
 * Generate smart triggers
 */
function generateSkillTriggers(steps: any[]) {
  const keywords = new Set<string>();

  for (const step of steps) {
    if (step.action === "create_task") {
      keywords.add("create task");
      keywords.add("add task");
      keywords.add("new task");
    }

    if (step.action === "update_task_status") {
      keywords.add("update task");
      keywords.add("change status");
      keywords.add("mark task");
    }

    if (step.action === "set_task_priority") {
      keywords.add("set priority");
      keywords.add("change priority");
    }
  }

  return Array.from(keywords);
}

/**
 * AI Skill Learner
 */
export async function learnFromExecution(params: {
  workspaceId: string;
  projectId: string;
  executionId: string;
}) {
  const { workspaceId, executionId } = params;

  const steps = await AIExecutionMemory.find({
    workspaceId,
    executionId,
  }).sort({ stepIndex: 1 });

  if (steps.length < 2) return;

  const successSteps = steps.filter((s) => s.outcome === "success");

  if (successSteps.length < 2) return;

  const skillSteps = successSteps.map((step) => ({
    action: step.actionType,
    payload: step.payload,
  }));

  const triggers = generateSkillTriggers(skillSteps);

  if (triggers.length === 0) return;

  await AISkillModel.create({
    workspaceId,
    name: `learned-skill-${Date.now()}`,
    description: "Automatically learned workflow",
    triggers,
    steps: skillSteps,
  });

  console.log("🧠 AI learned new skill.");
}
