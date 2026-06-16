// src/services/ai-provider.service.ts

/**
 * JSON fallback plan used when OpenAI is unavailable
 * (no API key, quota exhausted, network error, etc).
 *
 * IMPORTANT: this MUST be valid JSON matching the shape
 * ai-planner.service.ts expects to parse — a prose string
 * here causes JSON.parse() to throw and crashes the whole
 * agent pipeline mid-stream (after SSE headers are already
 * sent), which the frontend cannot recover from.
 */
const FALLBACK_PLAN_JSON = JSON.stringify([
  {
    action: "create_task",
    title: "Untitled Task",
    description: "",
    priority: "MEDIUM",
  },
]);

export const callAI = async (prompt: string): Promise<string> => {
  try {
    console.log("📤 Sending prompt to AI...");

    if (!process.env.OPENAI_API_KEY) {
      console.warn("⚠️ OPENAI_API_KEY not set — using fallback plan");
      return FALLBACK_PLAN_JSON;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ OPENAI ERROR:", data);

      // quota exhausted, invalid key, rate limited, etc.
      // Always return valid JSON so the planner doesn't crash.
      console.warn("⚠️ Using fallback plan (OpenAI error)");
      return FALLBACK_PLAN_JSON;
    }

    const content = data?.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      console.warn("⚠️ Using fallback plan (empty OpenAI response)");
      return FALLBACK_PLAN_JSON;
    }

    return content.trim();
  } catch (error) {
    console.error("❌ callAI failed:", error);
    return FALLBACK_PLAN_JSON;
  }
};

export const callLLMRaw = async (prompt: string): Promise<string> => {
  return callAI(prompt);
};
