// src/services/skills/basic-task.skill.ts

import { AISkill } from "../../types/ai-skill.types";

export const basicTaskSkill: AISkill = {
  name: "create-basic-task",

  description: "Creates a task whenever the user requests task creation",

  trigger: {
    keywords: [
      "create task",
      "create a task",
      "new task",
      "add task",
      "add a task",
      "make task",
      "make a task",
    ],
  },

  steps: [],
};

/**
 * Extracts a task title from free-form text like:
 *   "Create a task called Build API docs"
 *   "create a task called x"
 *   "Add a new task: Fix login bug"
 *   "Make task 'Write tests'"
 *
 * Returns null if no explicit title could be extracted —
 * callers should fall back to a context-derived title.
 */
export function extractTaskTitle(goal: string): string | null {
  const text = goal.trim();

  const patterns: RegExp[] = [
    // "...called X" / "...named X" / "...titled X" (to end of line)
    /(?:called|named|titled)\s+["']?(.+?)["']?\s*$/i,

    // "create/add/make (a/an/new) task: X" or "...task X"
    /(?:create|add|make)\s+(?:a\s+|an\s+|new\s+)*task[:\-]\s+["']?(.+?)["']?\s*$/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match && match[1] && match[1].trim().length > 0) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Generates a fallback title from the conversation context when
 * the user's goal contains no explicit title (e.g. "create a new task").
 *
 * Looks backwards through recent messages for something resembling
 * a project/feature/topic the task could relate to. Falls back to
 * a timestamped generic title if nothing useful is found.
 */
export function deriveTitleFromContext(
  goal: string,
  recentMessages: { role: "user" | "assistant"; content: string }[] = [],
): string {
  // 1) Try the goal itself first — strip generic "create a task" phrasing
  //    and see if anything meaningful remains.
  const stripped = goal
    .replace(
      /(?:please\s+)?(?:create|add|make)\s+(?:a\s+|an\s+|new\s+)*task\s*(?:for|to|about)?/i,
      "",
    )
    .trim();

  if (stripped.length > 2 && !/^(it|this|that|please)?\.?$/i.test(stripped)) {
    return capitalize(stripped);
  }

  // 2) Look at the most recent prior user message for context
  //    (e.g. "Let's redesign the login page" → "create a new task"
  //    should produce something like "Follow up: redesign the login page").
  const priorUserMessages = recentMessages
    .filter((m) => m.role === "user")
    .slice(0, -1) // exclude the current goal if it's included
    .reverse();

  for (const msg of priorUserMessages) {
    const cleaned = msg.content.trim();

    if (cleaned.length > 4 && cleaned.length < 80) {
      return `Follow up: ${capitalize(cleaned)}`;
    }
  }

  // 3) Last resort — timestamped generic title so duplicates don't
  //    collide and the user can identify when it was created.
  const timestamp = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return `New Task — ${timestamp}`;
}

function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Builds the actual create_task step for this skill using
 * the user's goal text and recent conversation context.
 */
export function buildBasicTaskSteps(
  goal: string,
  recentMessages: { role: "user" | "assistant"; content: string }[] = [],
) {
  const explicitTitle = extractTaskTitle(goal);

  const title = explicitTitle ?? deriveTitleFromContext(goal, recentMessages);

  return [
    {
      action: "create_task" as const,
      title,
      description: "",
      priority: "MEDIUM" as const,
    },
  ];
}
