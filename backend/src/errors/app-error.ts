// src/errors/app-error.ts
// This file defines the AppError class, a custom error type used throughout the application for consistent error handling and response formatting.
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public metadata?: any;

  constructor(
    message: string,
    statusCode = 500,
    code?: string,
    metadata?: any,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.metadata = metadata;

    Error.captureStackTrace(this, this.constructor);
  }
}
