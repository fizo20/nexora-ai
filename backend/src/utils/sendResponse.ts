// src/utils/sendResponse.ts
import { Response } from "express";

interface SendResponseOptions<T> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export const sendResponse = <T>({
  res,
  statusCode = 200,
  message = "Request successful",
  data = null as unknown as T,
  meta = {},
}: SendResponseOptions<T>) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
};
