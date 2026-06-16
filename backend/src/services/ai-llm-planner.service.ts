//  src/services/ai-llm-planner.service.ts
import OpenAI from "openai";
import { aiToolRegistry } from "./ai-tool-registry.service";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PlannerInput {
  goal: string;
}

interface PlannerStep {
  action: string;
  payload?: any;
}

export async function generateLLMPlan(
  input: PlannerInput,
): Promise<PlannerStep[]> {
  const tools = aiToolRegistry.listTools();

  const toolDescriptions = tools.map((t) => ({
    name: t.name,
    description: t.description,
  }));

  const systemPrompt = `
You are an AI workflow planner.

You must generate a JSON array of steps to accomplish the user's goal.

Each step must contain:
- action
- payload (optional)

Available tools:
${JSON.stringify(toolDescriptions, null, 2)}

Return ONLY valid JSON.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: input.goal },
    ],
  });

  const content = completion.choices[0].message?.content || "[]";

  try {
    return JSON.parse(content);
  } catch {
    throw new Error("Failed to parse LLM response as JSON");
  }
}
