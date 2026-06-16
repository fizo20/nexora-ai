// src/types/ai-audit.types.ts
import { AIFeatureType } from "./ai-feature.types";

export type AIAuditAction =
  | AIFeatureType
  | "AI_DISABLED"
  | "AI_ENABLED"
  | "GLOBAL_AI_DISABLED";
