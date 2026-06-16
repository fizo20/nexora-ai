// src/utils/api-response.ts
import { Response } from "express";

interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T | null;
  meta?: Record<string, any>;
}

export const sendResponse = <T>({
  res,
  statusCode = 200,
  message = "Request successful",
  data = null,
  meta = {},
}: ApiResponseOptions<T>) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
    meta,
  });
};
