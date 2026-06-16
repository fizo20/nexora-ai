// src/controllers/ai.controller.ts
import { Request, Response, NextFunction } from "express";
import { AuthPayload } from "../types/auth.types";
import { Workspace } from "../models/workspace.model";
import { Task } from "../models/task.model";
import { signAIPlan } from "../services/ai-integrity.service";
import { callAI } from "../services/ai-provider.service";
import { recordUsage } from "../services/usage-report.service";
import { reportUsageToStripe } from "../services/usage-report.service";
import {
  buildProjectSummaryData,
  buildProjectSummaryPrompt,
  buildTaskSuggestionData,
  buildTaskSuggestionPrompt,
  buildRiskAnalysisData,
  buildRiskAnalysisPrompt,
  buildWorkspaceQAData,
  buildWorkspaceQAPrompt,
  buildAssistantChatPrompt,
  buildAIActionPrompt,
} from "../services/ai.service";

import {
  validateAIInput,
  detectPromptInjection,
  sanitizeAIInput,
} from "../services/ai-safety.service";

import { logAIAudit } from "../services/ai-audit.service";

import {
  getRecentContext,
  storeAIContext,
  buildContextBlock,
} from "../services/ai-context.service";

import {
  getRecentChatHistory,
  buildChatHistoryBlock,
  storeChatTurn,
  getConversationMessages,
} from "../services/ai-chat.service";

import { parseAIAction } from "../services/ai-action-parser.service";
import { executeAIAction } from "../services/ai-action-executor.service";
import { generateAIPlan } from "../services/ai-planner.service";
import { dryRunAIAction } from "../services/ai-action-dryrun.service";
import { createApprovalRequest } from "../services/ai-approval.service";
import { approveRequest, markExecuted } from "../services/ai-approval.service";
import { AIApproval } from "../models/ai-approval.model";
import { rejectRequest } from "../services/ai-approval.service";
import { rollbackAIAction } from "../services/ai-rollback.service";
import { executeAIPlanOrchestrator } from "../services/ai-orchestrator.service";
import { calculatePlanMetrics } from "../services/ai-plan-metrics.service";
import { AppError } from "../errors/app-error";
import { AIPlan } from "../models/ai-plan.model";
import { checkAIQuota } from "../services/ai-rate-limit.service";
import { getWorkspacePolicy } from "../services/ai-policy.service";

import { executeAI } from "../services/ai-execution.service";
import { fromJSONSchema } from "zod";
import {
  getWorkspaceExecutionHistory,
  getSingleExecution,
} from "../services/ai-execution-query.service";

import { resumeAIExecution } from "../services/ai-execution-resume.service";
import { retryFailedStep } from "../services/ai-execution-retry.service";
import { runAgentSupervisor } from "../services/ai-agent-supervisor.service";
import { runAutonomousCheck } from "../services/ai-autonomous-engine.service";
import { analyzeWorkspaceStrategy } from "../services/ai-strategy-engine.service";
import { AIExecutionMemory } from "../models/ai-execution-memory.model";
import { enforceAIUsageAccess } from "../services/ai-access-control.service";

// =====================================================
//   TASK GENERATION
// =====================================================

export const generateTasks = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;
  const projectId = req.params.projectId;

  if (!projectId || Array.isArray(projectId)) {
    return res.status(400).json({ message: "Invalid project id" });
  }

  const { text } = req.body;

  validateAIInput(text);
  detectPromptInjection(text);
  const safeText = sanitizeAIInput(text);

  if (!safeText) {
    return res.status(400).json({ message: "text required" });
  }

  const workspace = await Workspace.findById(auth.workspaceId);
  if (!workspace) {
    return res.status(404).json({ message: "Workspace not found" });
  }

  /* ---------- Context ---------- */
  const context = await getRecentContext(auth.workspaceId, projectId, 3);
  const contextBlock = buildContextBlock(context);
  const aiInput = contextBlock + "\n" + safeText;

  // ---------- AI ----------
  const aiResponse = await callAI(aiInput);

  let aiTasks;

  try {
    aiTasks = JSON.parse(aiResponse);
  } catch {
    return res.status(500).json({
      message: "AI returned invalid JSON",
      raw: aiResponse,
    });
  }

  const docs = aiTasks.map((t: any) => ({
    workspaceId: auth.workspaceId,
    projectId,
    title: t.title,
    description: t.description,
    priority: t.priority,
  }));

  const created = await Task.insertMany(docs);

  // ---------- Context store ----------
  await storeAIContext({
    workspaceId: auth.workspaceId,
    projectId,
    type: "TASK_GENERATION",
    input: aiInput,
    output: JSON.stringify(aiTasks),
  });

  // ---------- Audit ----------
  await logAIAudit({
    workspaceId: auth.workspaceId,
    userId: auth.userId,
    action: "TASK_GENERATION",
    endpoint: req.originalUrl,
    prompt: aiInput,
    output: JSON.stringify(aiTasks),
  });

  // ---------- Usage ----------
  await recordUsage(auth.workspaceId, "ai_tasks", created.length);
  await reportUsageToStripe(auth.workspaceId, created.length);

  res.status(201).json({
    created: created.length,
    tasks: created,
  });
};

/* =====================================================
   PROJECT SUMMARY
===================================================== */

export const summarizeProject = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;
  const projectId = req.params.projectId;

  if (!projectId || Array.isArray(projectId)) {
    return res.status(400).json({ message: "Invalid project id" });
  }

  const data = await buildProjectSummaryData(auth.workspaceId, projectId);

  const context = await getRecentContext(auth.workspaceId, projectId, 3);
  const contextBlock = buildContextBlock(context);

  const basePrompt = buildProjectSummaryPrompt(data);
  const prompt = contextBlock + "\n" + basePrompt;

  const summary = await callAI(prompt);

  await storeAIContext({
    workspaceId: auth.workspaceId,
    projectId,
    type: "SUMMARY",
    input: prompt,
    output: summary,
  });

  await logAIAudit({
    workspaceId: auth.workspaceId,
    userId: auth.userId,
    action: "SUMMARY",
    endpoint: req.originalUrl,
    prompt,
    output: summary,
  });

  await recordUsage(auth.workspaceId, "ai_summary", 1);
  await reportUsageToStripe(auth.workspaceId, 1);

  res.json({ summary });
};

/* =====================================================
   TASK SUGGESTIONS
===================================================== */

export const suggestTasks = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;
  const projectId = req.params.projectId;

  if (!projectId || Array.isArray(projectId)) {
    return res.status(400).json({ message: "Invalid project id" });
  }

  const data = await buildTaskSuggestionData(auth.workspaceId, projectId);

  const context = await getRecentContext(auth.workspaceId, projectId, 3);
  const contextBlock = buildContextBlock(context);

  const basePrompt = buildTaskSuggestionPrompt(data);
  const prompt = contextBlock + "\n" + basePrompt;

  const suggestions = await callAI(prompt);

  await storeAIContext({
    workspaceId: auth.workspaceId,
    projectId,
    type: "SUGGESTION",
    input: prompt,
    output: suggestions,
  });

  await logAIAudit({
    workspaceId: auth.workspaceId,
    userId: auth.userId,
    action: "SUGGESTION",
    endpoint: req.originalUrl,
    prompt,
    output: suggestions,
  });

  await recordUsage(auth.workspaceId, "ai_suggestions", 1);
  await reportUsageToStripe(auth.workspaceId, 1);

  res.json({ suggestions });
};

/* =====================================================
   RISK ANALYSIS
===================================================== */

export const analyzeProjectRisk = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;
  const projectId = req.params.projectId;

  if (!projectId || Array.isArray(projectId)) {
    return res.status(400).json({ message: "Invalid project id" });
  }

  const data = await buildRiskAnalysisData(auth.workspaceId, projectId);

  const context = await getRecentContext(auth.workspaceId, projectId, 3);
  const contextBlock = buildContextBlock(context);

  const basePrompt = buildRiskAnalysisPrompt(data);
  const prompt = contextBlock + "\n" + basePrompt;

  const result = await callAI(prompt);

  await storeAIContext({
    workspaceId: auth.workspaceId,
    projectId,
    type: "RISK",
    input: prompt,
    output: result,
  });

  await logAIAudit({
    workspaceId: auth.workspaceId,
    userId: auth.userId,
    action: "RISK",
    endpoint: req.originalUrl,
    prompt,
    output: result,
  });

  await recordUsage(auth.workspaceId, "ai_risk_analysis", 1);
  await reportUsageToStripe(auth.workspaceId, 1);

  res.json({ riskAnalysis: result });
};

/* =====================================================
   WORKSPACE Q&A
===================================================== */

export const workspaceQA = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;
  const { question } = req.body;

  validateAIInput(question);
  detectPromptInjection(question);
  const safeQuestion = sanitizeAIInput(question);

  const data = await buildWorkspaceQAData(auth.workspaceId);

  const context = await getRecentContext(auth.workspaceId, undefined, 5);
  const contextBlock = buildContextBlock(context);

  const basePrompt = buildWorkspaceQAPrompt(data, safeQuestion);
  const prompt = contextBlock + "\n" + basePrompt;

  const answer = await callAI(prompt);

  await storeAIContext({
    workspaceId: auth.workspaceId,
    type: "QA",
    input: prompt,
    output: answer,
  });

  await logAIAudit({
    workspaceId: auth.workspaceId,
    userId: auth.userId,
    action: "QA",
    endpoint: req.originalUrl,
    prompt,
    output: answer,
  });

  await recordUsage(auth.workspaceId, "ai_qa", 1);
  await reportUsageToStripe(auth.workspaceId, 1);

  res.json({ question: safeQuestion, answer });
};

/* =====================================================
   WORKSPACE AI CHAT
===================================================== */

export const workspaceAIChat = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;

  const { message, projectId, conversationId } = req.body;

  if (!message) {
    return res.status(400).json({
      message: "Message is required",
    });
  }

  // 🔥 REQUIRE conversationId (no hack)
  if (!conversationId) {
    return res.status(400).json({
      message: "conversationId is required",
    });
  }

  validateAIInput(message);
  detectPromptInjection(message);

  const safeMessage = sanitizeAIInput(message);

  const pid =
    typeof projectId === "string" && projectId.length > 0
      ? projectId
      : undefined;

  /* ===============================
     🔥 GET CONVERSATION HISTORY (FIXED)
  =============================== */

  const historyMessages = await getConversationMessages(conversationId, 10);

  const historyBlock = buildChatHistoryBlock(
    historyMessages.map((m) => ({
      role: m.role,
      message: m.message,
    })),
  );

  /* ===============================
     🔥 WORKSPACE CONTEXT
  =============================== */

  const data = await buildWorkspaceQAData(auth.workspaceId);
  const workspaceBlock = JSON.stringify(data, null, 2);

  /* ===============================
     🔥 BUILD PROMPT
  =============================== */

  const prompt = buildAssistantChatPrompt(
    historyBlock,
    workspaceBlock,
    safeMessage,
  );

  await enforceAIUsageAccess(auth.workspaceId);
  const reply = await callAI(prompt);

  /* ===============================
     🔥 STORE USER MESSAGE
  =============================== */

  await storeChatTurn({
    conversationId,
    workspaceId: auth.workspaceId,
    projectId: pid,
    userId: auth.userId,
    role: "user",
    message: safeMessage,
  });

  /* ===============================
     🔥 STORE AI MESSAGE
  =============================== */

  await storeChatTurn({
    conversationId,
    workspaceId: auth.workspaceId,
    projectId: pid,
    userId: auth.userId,
    role: "assistant",
    message: reply,
  });

  /* ===============================
     🔥 AUDIT + BILLING
  =============================== */

  await logAIAudit({
    workspaceId: auth.workspaceId,
    userId: auth.userId,
    action: "CHAT",
    endpoint: req.originalUrl,
    prompt,
    output: reply,
  });

  await recordUsage(auth.workspaceId, "ai_chat", 1);
  await reportUsageToStripe(auth.workspaceId, 1);

  return res.json({
    reply,
    conversationId,
  });
};

/* =====================================================
   AI ACTION EXECUTION
===================================================== */

export const aiExecuteAction = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;
  const projectId = req.params.projectId;
  if (!projectId || Array.isArray(projectId)) {
    return res.status(400).json({ message: "Invalid project id" });
  }
  const { message } = req.body;
  validateAIInput(message);
  detectPromptInjection(message);
  const safe = sanitizeAIInput(message);
  const workspace = await Workspace.findById(auth.workspaceId);
  if (!workspace) {
    return res.status(404).json({ message: "Workspace not found" });
  }
  const policy = await getWorkspacePolicy(auth.workspaceId);
  await checkAIQuota(
    auth.workspaceId,
    "executions",
    policy.maxExecutionsPerHour,
  );
  const prompt = buildAIActionPrompt(workspace.name, safe);
  const aiText = await callAI(prompt);
  const action = parseAIAction(aiText);
  if (!action) {
    return res.json({ message: "No executable action detected", aiText });
  }
  const approval = await createApprovalRequest(
    auth.workspaceId,
    auth.userId,
    projectId,
    action,
  );
  await logAIAudit({
    workspaceId: auth.workspaceId,
    userId: auth.userId,
    action: "ACTION_EXECUTION",
    endpoint: req.originalUrl,
    prompt,
    output: JSON.stringify(action),
  });
  await recordUsage(auth.workspaceId, "ai_actions", 1);
  await reportUsageToStripe(auth.workspaceId, 1);
  return res.json({ requiresApproval: true, approvalId: approval._id, action });
};

/* =====================================================
   AI PLANNER
===================================================== */

export const aiPlanController = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;
  const { instruction, projectId, execute, dryRun } = req.body;

  validateAIInput(instruction);
  detectPromptInjection(instruction);
  const safeInstruction = sanitizeAIInput(instruction);

  if (typeof projectId !== "string") {
    return res.status(400).json({ message: "projectId required" });
  }

  const workspace = await Workspace.findById(auth.workspaceId);
  if (!workspace) {
    return res.status(404).json({ message: "Workspace not found" });
  }

  const policy = await getWorkspacePolicy(auth.workspaceId);

  await checkAIQuota(auth.workspaceId, "plans", policy.maxPlansPerHour);

  /* ---------- generate plan ---------- */

  const steps = await generateAIPlan(workspace.name, safeInstruction);
  const metrics = calculatePlanMetrics(steps);

  /* ---------- store plan ---------- */

  const storedPlan = await AIPlan.create({
    workspaceId: auth.workspaceId,
    projectId,
    instruction: safeInstruction,
    steps,
    riskScore: metrics.totalRisk,
    costEstimate: metrics.totalCost,
    approvalRequired: metrics.approvalRequired,
    status: "GENERATED",
  });

  /* ---------- integrity signature ---------- */

  const signature = signAIPlan({
    workspaceId: storedPlan.workspaceId.toString(),
    projectId: storedPlan.projectId.toString(),
    steps: storedPlan.steps,
    riskScore: storedPlan.riskScore,
    costEstimate: storedPlan.costEstimate,
  });

  storedPlan.signature = signature;
  storedPlan.signedAt = new Date();
  await storedPlan.save();

  /* ---------- optional execution ---------- */

  let executionSummary = null;

  if (execute === true) {
    if (storedPlan.approvalRequired) {
      return res.status(403).json({
        message: "Plan requires approval",
        planId: storedPlan._id,
        metrics,
      });
    }

    executionSummary = await executeAIPlanOrchestrator(
      auth.workspaceId,
      projectId,
      steps,
      { dryRun: dryRun === true },
    );

    storedPlan.status = executionSummary.success ? "EXECUTED" : "FAILED";
    storedPlan.executedAt = new Date();
    await storedPlan.save();
  }

  /* ---------- audit ---------- */

  await storeAIContext({
    workspaceId: auth.workspaceId,
    projectId,
    type: "PLAN",
    input: safeInstruction,
    output: JSON.stringify(steps),
  });

  await logAIAudit({
    workspaceId: auth.workspaceId,
    userId: auth.userId,
    action: "PLAN",
    endpoint: req.originalUrl,
    prompt: safeInstruction,
    output: JSON.stringify({ steps: steps.length }),
  });

  await recordUsage(auth.workspaceId, "ai_plans", 1);
  await reportUsageToStripe(auth.workspaceId, 1);

  return res.json({
    planId: storedPlan._id,
    steps,
    metrics,
    executionSummary,
  });
};

/* =====================================================
   AI ACTION DRY RUN
===================================================== */

export const aiDryRunAction = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;
  const projectId = req.params.projectId;

  if (!projectId || Array.isArray(projectId)) {
    return res.status(400).json({ message: "Invalid project id" });
  }

  const { message } = req.body;

  validateAIInput(message);
  detectPromptInjection(message);
  const safe = sanitizeAIInput(message);

  const workspace = await Workspace.findById(auth.workspaceId);
  if (!workspace) {
    return res.status(404).json({ message: "Workspace not found" });
  }

  /* ---------- Build prompt ---------- */
  const prompt = buildAIActionPrompt(workspace.name, safe);

  /* ---------- AI ---------- */
  const aiText = await callAI(prompt);

  /* ---------- Parse ---------- */
  const action = parseAIAction(aiText);

  if (!action) {
    return res.json({
      message: "No action detected",
      aiText,
    });
  }

  /* ---------- DRY RUN ---------- */
  const preview = await dryRunAIAction(auth.workspaceId, projectId, action);

  /* ---------- Audit ---------- */
  await logAIAudit({
    workspaceId: auth.workspaceId,
    userId: auth.userId,
    action: "ACTION_DRY_RUN",
    endpoint: req.originalUrl,
    prompt,
    output: JSON.stringify(preview),
  });

  res.json({
    action,
    preview,
  });
};

export const approveAIActionController = async (
  req: Request,
  res: Response,
) => {
  const auth = req.auth as AuthPayload;

  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid approval id" });
  }

  const approval = await approveRequest(id);

  if (!approval) {
    return res.status(404).json({ message: "Approval request not found" });
  }

  const result = await executeAIAction(
    auth.workspaceId,
    approval.projectId?.toString() || "",
    approval.action,
  );

  await markExecuted(id);

  return res.json({
    approved: true,
    result,
  });
};

export const rejectAIActionController = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid approval id" });
  }

  await rejectRequest(id);

  res.json({
    rejected: true,
  });
};

export const rollbackAIController = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid audit id" });
  }

  const result = await rollbackAIAction(auth.workspaceId, id);

  res.json(result);
};

export const aiPlanSimulatorController = async (
  req: Request,
  res: Response,
) => {
  const auth = req.auth as AuthPayload;
  const { instruction, projectId } = req.body;

  validateAIInput(instruction);
  detectPromptInjection(instruction);
  const safeInstruction = sanitizeAIInput(instruction);

  if (typeof projectId !== "string") {
    return res.status(400).json({ message: "projectId required" });
  }

  const workspace = await Workspace.findById(auth.workspaceId);
  if (!workspace) {
    return res.status(404).json({ message: "Workspace not found" });
  }
  const policy = await getWorkspacePolicy(auth.workspaceId);
  await checkAIQuota(
    auth.workspaceId,
    "simulations",
    policy.maxSimulationsPerHour,
  );

  /* ---------- PLAN ---------- */

  const plan = await generateAIPlan(workspace.name, safeInstruction);

  /* ---------- SIMULATION ---------- */

  const simulation = await executeAIPlanOrchestrator(
    auth.workspaceId,
    projectId,
    plan,
    { dryRun: true },
  );

  /* ---------- METRICS ---------- */

  const metrics = calculatePlanMetrics(plan);

  /* ---------- AUDIT ---------- */

  await logAIAudit({
    workspaceId: auth.workspaceId,
    userId: auth.userId,
    action: "PLAN_SIMULATION",
    endpoint: req.originalUrl,
    prompt: safeInstruction,
    output: JSON.stringify({
      simulated: true,
      steps: plan.length,
      metrics,
    }),
  });

  /* ---------- USAGE ---------- */

  await recordUsage(auth.workspaceId, "ai_plan_simulation", 1);
  await reportUsageToStripe(auth.workspaceId, 1);

  /* ---------- RESPONSE ---------- */

  return res.json({
    simulated: true,
    plan,
    simulation,
    metrics,
  });
};

export const generateProjectSummary = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const auth = req.auth as AuthPayload;

    if (!auth?.workspaceId) {
      return next(new AppError("Workspace context missing", 401));
    }

    const projectId = req.params.projectId;

    if (!projectId || Array.isArray(projectId)) {
      return next(new AppError("Invalid project ID", 400));
    }

    const data = await buildProjectSummaryData(auth.workspaceId, projectId);

    const prompt = buildProjectSummaryPrompt(data);

    const result = await executeAI({
      workspaceId: auth.workspaceId,
      userId: auth.userId,
      plan: auth.plan,
      prompt,
      model: "gpt-4o-mini",
      endpoint: "PROJECT_SUMMARY",
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getAIExecutionHistory = async (req: any, res: any) => {
  const { workspaceId } = req.auth;
  const { page = 1, limit = 20 } = req.query;

  const result = await getWorkspaceExecutionHistory(
    workspaceId,
    Number(limit),
    Number(page),
  );

  res.json(result);
};

export const getAIExecutionById = async (req: any, res: any) => {
  const { workspaceId } = req.auth;
  const { executionId } = req.params;

  const execution = await getSingleExecution(workspaceId, executionId);

  res.json(execution);
};

export const resumeAIExecutionController = async (req: any, res: any) => {
  const { workspaceId } = req.auth;
  const { executionId } = req.params;

  const result = await resumeAIExecution(workspaceId, executionId);

  res.json(result);
};

export const retryStepController = async (req: any, res: any) => {
  const { workspaceId } = req.auth;
  const { executionId } = req.params;

  const result = await retryFailedStep(workspaceId, executionId);

  res.json(result);
};

/**
 * Run AI Agent
 */
export const runAIAgentController = async (req: Request, res: Response) => {
  try {
    const { workspaceId, projectId, goal } = req.body;

    if (!workspaceId || !projectId || !goal) {
      return res.status(400).json({
        error: "workspaceId, projectId and goal are required",
      });
    }

    const result = await runAgentSupervisor({
      workspaceId,
      projectId,
      userId: req.auth?.userId || "unknown",
      goal,
    });

    res.json(result);
  } catch (error) {
    console.error("AI Agent Error:", error);

    res.status(500).json({
      error: "AI agent execution failed",
    });
  }
};

/**
 * Run Autonomous AI Check
 */
export const runAutonomousAIController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { workspaceId, projectId } = req.body;

    if (!workspaceId || !projectId) {
      return res.status(400).json({
        error: "workspaceId and projectId are required",
      });
    }

    const result = await runAutonomousCheck({
      workspaceId,
      projectId,
    });

    res.json(result);
  } catch (error) {
    console.error("Autonomous AI Error:", error);

    res.status(500).json({
      error: "Autonomous AI check failed",
    });
  }
};

/**
 * Get AI Strategy Report
 */
export const getAIStrategyController = async (req: Request, res: Response) => {
  try {
    const { workspaceId, projectId } = req.query as any;

    const report = await analyzeWorkspaceStrategy({
      workspaceId,
      projectId,
    });

    res.json(report);
  } catch (error) {
    console.error("Strategy Engine Error:", error);

    res.status(500).json({
      error: "Strategy analysis failed",
    });
  }
};

/**
 * Get AI Execution History
 */
export const getAIHistoryController = async (req: Request, res: Response) => {
  try {
    const { workspaceId, projectId } = req.query as any;

    const history = await AIExecutionMemory.find({
      workspaceId,
      projectId,
    })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    res.json(history);
  } catch (error) {
    console.error("AI History Error:", error);

    res.status(500).json({
      error: "Failed to fetch AI history",
    });
  }
};
