// src/types/ai-skill.types.ts
import { AIActionPayload } from "./ai-system-actions.types";

/**
 * Skill trigger rule
 * Determines if a goal matches the skill
 */
export interface AISkillTrigger {
  keywords: string[];
}

/**
 * Skill definition
 *
 * Skills represent reusable workflows
 * composed of AIActionPayload steps.
 */
export interface AISkill {
  name: string;

  description: string;

  trigger: AISkillTrigger;

  /**
   * Steps returned to the agent pipeline
   * Must match AIActionPayload schema
   */
  steps: AIActionPayload[];
}
