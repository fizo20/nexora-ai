// src/services/ai-integrity.service.ts
import crypto from "crypto";

const AI_PLAN_SECRET = process.env.AI_PLAN_SECRET || "dev-secret";

/**
 * Create deterministic JSON string
 * prevents key-order hash mismatch
 */
const stableStringify = (obj: any): string => {
  return JSON.stringify(obj, Object.keys(obj).sort());
};

/**
 * Build plan signature
 */
export const signAIPlan = (data: any) => {
  const payload = stableStringify(data);

  return crypto
    .createHmac("sha256", AI_PLAN_SECRET)
    .update(payload)
    .digest("hex");
};

/**
 * Verify signature
 */
export const verifyAIPlanSignature = (data: any, signature: string) => {
  const expected = signAIPlan(data);
  return expected === signature;
};
