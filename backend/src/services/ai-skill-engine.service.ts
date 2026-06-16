// src/services/ai-skill-engine.service.ts
import { AISkill } from "../types/ai-skill.types";
import { AIActionPayload } from "../types/ai-system-actions.types";
import { AISkillModel } from "../models/ai-skill.model";
import { buildBasicTaskSteps } from "./skills/basic-task.skill";

const DYNAMIC_SKILL_BUILDERS: Record<
  string,
  (
    goal: string,
    recentMessages?: { role: "user" | "assistant"; content: string }[],
  ) => AIActionPayload[]
> = {
  "create-basic-task": (goal, recentMessages) =>
    buildBasicTaskSteps(goal, recentMessages) as AIActionPayload[],
};

function containsUnresolvedPlaceholder(steps: AIActionPayload[]): boolean {
  return steps.some((step) =>
    Object.values(step as unknown as Record<string, unknown>).some(
      (value) => typeof value === "string" && /{{\s*\w+\s*}}/.test(value),
    ),
  );
}

class AISkillEngine {
  private skills: AISkill[] = [];

  reset() {
    this.skills = [];
  }

  registerSkill(skill: AISkill) {
    this.skills.push(skill);
  }

  async loadLearnedSkills(workspaceId: string) {
    const dbSkills = await AISkillModel.find({ workspaceId });

    for (const skill of dbSkills) {
      const exists = this.skills.find((s) => s.name === skill.name);
      if (exists) continue;

      this.skills.push({
        name: skill.name || "Unnamed Skill",
        description: skill.description || "No description",
        trigger: {
          keywords: Array.isArray(skill.triggers) ? skill.triggers : [],
        },
        steps: Array.isArray(skill.steps) ? skill.steps : [],
      });
    }

    console.log(`🧠 Loaded ${dbSkills.length} learned skills`);
  }

  resolveSkill(
    goal: string,
    recentMessages?: { role: "user" | "assistant"; content: string }[],
  ): AIActionPayload[] | null {
    const normalizedGoal = goal.toLowerCase();

    let bestMatch: { skill: AISkill; score: number } | null = null;

    for (const skill of this.skills) {
      let score = 0;

      for (const keyword of skill.trigger.keywords) {
        if (normalizedGoal.includes(keyword.toLowerCase())) {
          score++;
        }
      }

      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { skill, score };
      }
    }

    if (!bestMatch) {
      return null;
    }

    console.log(`🧠 Best skill match: ${bestMatch.skill.name}`);

    const builder = DYNAMIC_SKILL_BUILDERS[bestMatch.skill.name];
    const resolvedSteps = builder
      ? builder(goal, recentMessages)
      : bestMatch.skill.steps;

    if (!resolvedSteps.length || containsUnresolvedPlaceholder(resolvedSteps)) {
      console.warn(
        `⚠️ Skill "${bestMatch.skill.name}" produced empty or unresolved steps — falling back to planner`,
      );
      return null;
    }

    return resolvedSteps;
  }

  listSkills(): AISkill[] {
    return this.skills;
  }
}

export const aiSkillEngine = new AISkillEngine();
