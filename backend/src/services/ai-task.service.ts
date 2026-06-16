// src/services/ai-task.service.ts
import { Task } from "../models/task.model";

/**
 * This is AI-ready — model provider can be swapped later
 */
export const generateTasksFromText = async (
  workspaceId: string,
  projectId: string,
  input: string,
) => {
  /**
   * TODO: Replace with real LLM call
   * For now — deterministic mock AI output
   * Keeps system testable without API cost
   */

  const lines = input
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const tasks = lines.map((title) => ({
    workspaceId,
    projectId,
    title,
    priority: "MEDIUM",
  }));

  const created = await Task.insertMany(tasks);

  return created;
};
