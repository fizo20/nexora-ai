// src/services/ai-action-parser.service.ts
import { AIActionPayload } from "../types/ai-system-actions.types";

export const parseAIAction = (text: string): AIActionPayload | null => {
  try {
    const obj = JSON.parse(text);

    if (!obj.action) return null;

    return obj as AIActionPayload;
  } catch {
    return null;
  }
};
