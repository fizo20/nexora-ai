// src/routes/ai.routes.ts
import { Router } from "express";
import {
  authenticateUser,
  authenticateWorkspace,
} from "../middlewares/auth.middleware";
import { requireFeature } from "../middlewares/feature-gate.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { getAssistantHistory } from "../controllers/ai-assistant.controller";

import { enforceAIGovernance } from "../middlewares/ai-governance.middleware";

import { enforceAIUsageLimit } from "../middlewares/ai-usage.middleware";
import { enforceAICostBudget } from "../middlewares/ai-cost.middleware";
import { enforceAICostPreview } from "../middlewares/ai-cost-preview.middleware";
import { aiCostGuard } from "../middlewares/ai-cost-guard.middleware";
import { aiSizeGuard } from "../middlewares/ai-size-guard.middleware";
import { safetyGuard } from "../middlewares/safety.middleware";

import {
  generateTasks,
  summarizeProject,
  suggestTasks,
  analyzeProjectRisk,
  workspaceQA,
  workspaceAIChat,
  aiExecuteAction,
  aiPlanController,
  aiDryRunAction,
  approveAIActionController,
  rejectAIActionController,
  aiPlanSimulatorController,
  rollbackAIController,
  getAIExecutionHistory,
  getAIExecutionById,
  resumeAIExecutionController,
  retryStepController,
  runAIAgentController,
  runAutonomousAIController,
  getAIStrategyController,
  getAIHistoryController,
} from "../controllers/ai.controller";

import { multiStepAIController } from "../controllers/ai-multistep.controller";
import { executeAIPlanController } from "../controllers/ai-execute.controller";
import { generateProjectSummary } from "../controllers/ai.controller";
import { handleAIAssistant } from "../controllers/ai-assistant.controller";
import { getUsageStatsController } from "../controllers/billing.controller";
import { getAIAnalyticsController } from "../controllers/ai-analytics.controller";

const router = Router();

router.use(safetyGuard({ key: "api_calls" }));
/**
 * GLOBAL AI GOVERNANCE LAYER
 */
router.use(authenticateWorkspace);
//router.use(requireFeature("aiEnabled"));
router.use(enforceAIGovernance);
router.use(enforceAIUsageLimit);
router.use(enforceAICostBudget);
router.use(enforceAICostPreview);

/**
 * PROJECT AI ROUTES
 */
router.post(
  "/projects/:projectId/ai/generate-tasks",
  requireFeature("aiEnabled"),
  requirePermission("task.create"),
  safetyGuard({ key: "ai_calls" }),
  aiCostGuard(),
  aiSizeGuard("text"),
  generateTasks,
);

router.post(
  "/projects/:projectId/ai/summary",
  requireFeature("aiEnabled"),
  requirePermission("task.read"),
  safetyGuard({ key: "ai_calls" }),
  aiCostGuard(),
  aiSizeGuard("text"),
  summarizeProject,
);

router.post(
  "/projects/:projectId/ai/suggestions",
  requireFeature("aiEnabled"),
  requirePermission("task.read"),
  safetyGuard({ key: "ai_calls" }),
  aiCostGuard(),
  aiSizeGuard("text"),
  suggestTasks,
);

router.post(
  "/projects/:projectId/ai/risk",
  requireFeature("aiEnabled"),
  requirePermission("task.read"),
  safetyGuard({ key: "ai_calls" }),
  aiCostGuard(),
  aiSizeGuard("text"),
  analyzeProjectRisk,
);

/**
 * WORKSPACE AI
 */
router.post(
  "/workspace/ai/qa",
  requireFeature("aiEnabled"),
  requirePermission("task.read"),
  safetyGuard({ key: "ai_calls" }),
  aiCostGuard(),
  aiSizeGuard("text"),
  workspaceQA,
);

router.post(
  "/workspace/ai/chat",
  requirePermission("task.read"),
  safetyGuard({ key: "ai_calls" }),
  aiCostGuard(),
  aiSizeGuard("message"),
  workspaceAIChat,
);

/**
 * AI EXECUTION
 */
router.post(
  "/projects/:projectId/ai/execute",
  requireFeature("aiEnabled"),
  requirePermission("task.update"),
  safetyGuard({ key: "ai_calls" }),
  aiExecuteAction,
);

router.post(
  "/projects/:projectId/ai/actions/dry-run",
  requirePermission("task.update"),
  safetyGuard({ key: "ai_calls" }),
  aiCostGuard(),
  aiSizeGuard("text"),
  aiDryRunAction,
);

router.post(
  "/projects/:projectId/ai/multistep",
  requirePermission("task.update"),
  safetyGuard({ key: "ai_calls" }),
  multiStepAIController,
);

/**
 * AI PLANS
 */
router.post(
  "/ai/plans",
  requirePermission("task.create"),
  safetyGuard({ key: "ai_calls" }),
  aiCostGuard(),
  aiSizeGuard("text"),
  aiPlanController,
);

router.post(
  "/ai/plans/simulate",
  requirePermission("task.read"),
  safetyGuard({ key: "ai_calls" }),
  aiCostGuard(),
  aiSizeGuard("text"),
  aiPlanSimulatorController,
);

router.post(
  "/ai/plans/:planId/execute",
  requirePermission("task.update"),
  executeAIPlanController,
);

/**
 * APPROVALS
 */
router.post(
  "/ai/approvals/:id/approve",
  requirePermission("task.update"),
  approveAIActionController,
);

router.post(
  "/ai/approvals/:id/reject",
  requirePermission("task.update"),
  rejectAIActionController,
);

/**
 * ROLLBACK
 */
router.post(
  "/ai/rollback/:id",
  requirePermission("task.update"),
  rollbackAIController,
);

router.post("/executions/:executionId/resume", resumeAIExecutionController);

router.post("/executions/:executionId/retry-step", retryStepController);

/**
 * AI Agent
 */
router.post("/agent", runAIAgentController);

router.post(
  "/assistant",
  requirePermission("task.read"),
  safetyGuard({ key: "ai_calls" }),
  aiCostGuard(),
  aiSizeGuard("message"),
  handleAIAssistant,
);
/**
 * Autonomous AI
 */
router.post("/autonomous", runAutonomousAIController);

router.get("/executions", getAIExecutionHistory);

router.get("/executions/:executionId", getAIExecutionById);

/**
 * Strategy Analysis
 */
router.get("/strategy", getAIStrategyController);

/**
 * AI Execution History
 */
router.get("/history", getAIHistoryController);

router.get("/assistant/history", getAssistantHistory);

router.get(
  "/analytics",
  requirePermission("analytics.view"),
  getAIAnalyticsController,
);
/* router.get("/usage", getUsageStatsController); */
export default router;
