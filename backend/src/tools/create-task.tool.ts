// src/tools/create-task.tool.ts
import { aiToolRegistry } from "../services/ai-tool-registry.service";
import { Task } from "../models/task.model";
import { AIActivity } from "../models/ai-activity.model";

/**
 * CREATE TASK TOOL
 *
 * Production-grade version:
 * - Self-healing payload
 * - Duplicate prevention
 * - AI-friendly responses
 * - Placeholder/template guard
 */

const PLACEHOLDER_PATTERN = /{{\s*\w+\s*}}/;

async function executeCreateTask(payload: any, context: any) {
  const { workspaceId, projectId, userId } = context;

  /* ---------------------------------------------------------------------- */
  /* 🧠 SAFE PAYLOAD EXTRACTION                                             */
  /* ---------------------------------------------------------------------- */

  let title = payload?.title;
  let description = payload?.description;
  let priority = payload?.priority;

  // 🛡️ Self-healing
  if (!title || typeof title !== "string") {
    console.warn("⚠️ Missing title, auto-fixing payload");
    title = "Untitled Task";
  }

  if (typeof description !== "string") {
    description = "";
  }

  const allowedPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

  if (!priority || !allowedPriorities.includes(priority?.toUpperCase())) {
    priority = "MEDIUM";
  }

  // ✅ Normalize input (VERY IMPORTANT)
  const cleanTitle = title.trim();
  const normalizedTitle = cleanTitle.toLowerCase();

  /* ---------------------------------------------------------------------- */
  /* 🛡️ PLACEHOLDER / TEMPLATE GUARD                                        */
  /*                                                                          */
  /* Prevents literal "{{title}}"-style template strings from a misfiring   */
  /* skill from ever becoming a real Task document.                         */
  /* ---------------------------------------------------------------------- */

  if (
    PLACEHOLDER_PATTERN.test(cleanTitle) ||
    PLACEHOLDER_PATTERN.test(description)
  ) {
    console.error(
      `❌ create_task received unresolved template placeholder. title="${cleanTitle}" description="${description}"`,
    );

    await AIActivity.create({
      workspaceId,
      projectId,
      type: "create_task_rejected",
      message: `Rejected task creation: unresolved template placeholder in payload`,
    });

    return {
      ok: false,
      skipped: true,
      message:
        "Task creation rejected: payload contained an unresolved template placeholder.",
    };
  }

  /* ---------------------------------------------------------------------- */
  /* 🧠 DUPLICATE PREVENTION (SMART)                                        */
  /* ---------------------------------------------------------------------- */

  const existing = await Task.findOne({
    workspaceId,
    projectId,
    deletedAt: null,
    title: { $regex: new RegExp(`^${escapeRegExp(cleanTitle)}$`, "i") },
  });

  const duplicate =
    existing &&
    existing.title &&
    existing.title.toLowerCase() === normalizedTitle;

  if (duplicate) {
    await AIActivity.create({
      workspaceId,
      projectId,
      type: "create_task_skipped",
      message: `Skipped duplicate task "${existing.title}"`,
    });

    return {
      ok: true,
      skipped: true, // 🔥 VERY IMPORTANT FOR AI
      message: "Task already exists",
      data: {
        taskId: existing._id.toString(),
        title: existing.title,
        priority: existing.priority,
        status: existing.status,
        createdAt: existing.createdAt,
      },
    };
  }

  /* ---------------------------------------------------------------------- */
  /* DATABASE WRITE                                                         */
  /* ---------------------------------------------------------------------- */

  const task = await Task.create({
    workspaceId,
    projectId,
    createdBy: userId,

    title: cleanTitle,
    description: description.trim(),
    priority: priority.toUpperCase(),
    status: "TODO",
  });

  /* ---------------------------------------------------------------------- */
  /* RESPONSE                                                               */
  /* ---------------------------------------------------------------------- */

  await AIActivity.create({
    workspaceId,
    projectId,
    type: "create_task",
    message: `Created task "${task.title}" with ${task.priority} priority`,
    metadata: {
      taskId: task._id,
    },
  });

  return {
    ok: true,
    skipped: false,
    data: {
      taskId: task._id.toString(),
      title: task.title,
      priority: task.priority,
      status: task.status,
      createdAt: task.createdAt,
    },
  };
}

/**
 * Escapes special regex characters in user-controlled strings
 * before interpolating into a RegExp (the original code did not
 * do this, which could throw or produce unintended matches for
 * titles containing characters like `.`, `*`, `(`, etc.)
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* -------------------------------------------------------------------------- */
/* REGISTER TOOL                                                              */
/* -------------------------------------------------------------------------- */

aiToolRegistry.register({
  name: "create_task",
  description: "Create a new task inside a project",
  execute: executeCreateTask,
});
