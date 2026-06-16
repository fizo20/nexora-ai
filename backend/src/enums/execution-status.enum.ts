// src/enums/execution-status.enum.ts
// This file defines the ExecutionStatus enum, which represents the various states of an asynchronous operation or task execution within the application.
export enum ExecutionStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED", // retryable
  TERMINAL = "TERMINAL", // permanent failure
}
