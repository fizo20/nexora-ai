// src/services/ai-execution.service.ts
import OpenAI from "openai";
import { AIUsage } from "../models/aiUsage.model";
import { AppError } from "../errors/app-error";
import { env } from "../config/env";

export type WorkspacePlan = "FREE" | "PRO" | "ENTERPRISE";

interface ExecuteAIParams {
  workspaceId: string;
  userId: string;
  plan: WorkspacePlan;
  prompt: string;
  model?: string;
  endpoint?: string;
}

interface ExecuteAIResult {
  output: string;
  model: string;
}

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const executeAI = async (
  params: ExecuteAIParams,
): Promise<ExecuteAIResult> => {
  const {
    workspaceId,
    userId,
    prompt,
    model = "gpt-4o-mini",
    endpoint = "general",
  } = params;

  if (!prompt) {
    throw new AppError("Prompt is required", 400);
  }

  /* ---------------------------------------------------------------------- */
  /* CALL OPENAI                                                            */
  /* ---------------------------------------------------------------------- */

  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are Nexora AI. Give concise and professional responses.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0,
  });

  const output = response.choices[0]?.message?.content?.trim() ?? "";

  /* ---------------------------------------------------------------------- */
  /* LOG USAGE (optional, lightweight tracking)                             */
  /* ---------------------------------------------------------------------- */

  await AIUsage.create({
    workspaceId,
    userId,
    model,
    endpoint,
    promptLength: prompt.length,
    responseLength: output.length,
  });

  return {
    output,
    model,
  };
};
