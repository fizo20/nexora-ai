// src/services/ai-safety.service.ts
import { AppError } from "../errors/app-error";

/**
 * Basic AI input guardrails
 */
export const validateAIInput = (text: string) => {
  if (!text || text.trim().length === 0) {
    throw new AppError("AI input cannot be empty", 400);
  }

  if (text.length > 4000) {
    throw new AppError("AI input too large", 400);
  }
};

/**
 * Prevent prompt injection patterns
 */
export const detectPromptInjection = (text: string) => {
  const redFlags = [
    "ignore previous instructions",
    "system prompt",
    "developer message",
    "reveal hidden",
    "bypass safety",
    "act as system",
  ];

  const lower = text.toLowerCase();

  const found = redFlags.some((flag) => lower.includes(flag));

  if (found) {
    throw new AppError("Prompt injection pattern detected", 400);
  }
};

/**
 * Simple sanitization
 */
export const sanitizeAIInput = (text: string) => {
  return text
    .replace(/```/g, "")
    .replace(/<script.*?>.*?<\/script>/gi, "")
    .trim();
};
