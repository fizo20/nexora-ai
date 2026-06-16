// src/services/ai-reflection-engine.service.ts
import { AIExecutionMemory } from "../models/ai-execution-memory.model";
import { learnFromExecution } from "./ai-skill-learner.service";

interface ReflectionInput {
  workspaceId: string;
  projectId: string;
  executionId: string;
}

interface ReflectionResult {
  successRate: number;
  failureRate: number;
  commonFailures: string[];
  recommendations: string[];
}

/**
 * AI Reflection Engine
 *
 * Responsible for analyzing execution results
 * and extracting insights that improve the AI system.
 *
 * Responsibilities:
 * 1️⃣ Calculate success and failure rates
 * 2️⃣ Identify common failure patterns
 * 3️⃣ Generate improvement recommendations
 * 4️⃣ Trigger skill learning for successful workflows
 */
export async function analyzeExecution(
  input: ReflectionInput,
): Promise<ReflectionResult> {
  const { workspaceId, projectId, executionId } = input;

  const records = await AIExecutionMemory.find({
    workspaceId,
    projectId,
    executionId,
  });

  if (records.length === 0) {
    return {
      successRate: 0,
      failureRate: 0,
      commonFailures: [],
      recommendations: [],
    };
  }

  let success = 0;
  let failed = 0;

  const failureMap: Record<string, number> = {};

  for (const record of records) {
    /**
     * Count successful steps
     */
    if (record.outcome === "success") {
      success++;
    }

    /**
     * Count failed steps
     */
    if (record.outcome === "failed") {
      failed++;

      if (record.stepError) {
        failureMap[record.stepError] = (failureMap[record.stepError] || 0) + 1;
      }
    }
  }

  const total = success + failed;

  /**
   * Prevent division by zero
   */
  const successRate = total === 0 ? 0 : success / total;
  const failureRate = total === 0 ? 0 : failed / total;

  /**
   * Determine most common failure types
   */
  const commonFailures = Object.entries(failureMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([error]) => error);

  /**
   * Generate improvement recommendations
   */
  const recommendations: string[] = [];

  if (failureRate > 0.4) {
    recommendations.push("Consider retrying failed steps automatically");
  }

  if (commonFailures.length > 0) {
    recommendations.push(
      "AI should attempt payload repair for frequently failing actions",
    );
  }

  /**
   * Trigger skill learning only for successful workflows
   */
  if (successRate >= 0.7) {
    await learnFromExecution({
      workspaceId,
      projectId,
      executionId,
    });
  }

  return {
    successRate,
    failureRate,
    commonFailures,
    recommendations,
  };
}
