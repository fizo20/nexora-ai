import { aiSkillEngine } from "./ai-skill-engine.service";
import { generateAIPlan } from "./ai-planner.service";

export async function resolveActions(
  workspaceId: string,
  enhancedGoal: string,
  contextData: any,
) {
  let actions = aiSkillEngine.resolveSkill(enhancedGoal);

  if (!actions) {
    actions = await generateAIPlan(
      workspaceId,
      enhancedGoal,
      JSON.stringify(contextData),
    );
  }

  return actions;
}
