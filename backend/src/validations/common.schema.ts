// src/validations/common.schema.ts
import { z } from "zod";

// Reusable ID schema (UUID, ObjectId-like strings, etc.)
export const idSchema = z.string().min(1, "ID is required");

// Pagination schema
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => Number(val) || 1),

  limit: z
    .string()
    .optional()
    .transform((val) => Number(val) || 10),
});
