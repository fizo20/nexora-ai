import { aiSkillEngine } from "./ai-skill-engine.service";
import { basicTaskSkill } from "./skills/basic-task.skill";

export async function prepareAgent(workspaceId: string) {
  aiSkillEngine.reset();

  aiSkillEngine.registerSkill(basicTaskSkill);

  await aiSkillEngine.loadLearnedSkills(workspaceId);
}
