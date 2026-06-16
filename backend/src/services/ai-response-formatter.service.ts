// src/services/ai-response-formatter.service.ts

interface FormatInput {
  goal: string;

  steps: {
    action: string;
    payload: any;
  }[];

  results: any[];

  reflection: any;
}

export function formatAIResponse(input: FormatInput): string {
  const { steps, results, reflection } = input;

  const messages: string[] = [];
  const reasoning: string[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const result = results[i];

    switch (step.action) {
      case "create_task":
        handleCreateTask(result, messages, reasoning);
        break;

      case "update_task_status":
        handleUpdateStatus(result, messages, reasoning);
        break;

      case "set_task_priority":
        handlePriority(result, messages, reasoning);
        break;

      default:
        messages.push(`⚠️ Unknown action executed: ${step.action}`);
    }
  }

  appendReflection(reflection, messages, reasoning);

  return `
${messages.join("\n")}

💡 Reasoning
- ${reasoning.join("\n- ")}
`.trim();
}

/* ===================================================== */

function handleCreateTask(
  result: any,
  messages: string[],
  reasoning: string[],
) {
  if (result?.skipped) {
    messages.push(`⚠️ Task "${result.data?.title}" already exists.`);

    reasoning.push("Duplicate task detected and avoided.");

    return;
  }

  if (result?.ok) {
    messages.push(`✅ Task "${result.data?.title}" created successfully.`);

    reasoning.push("Created a new task from your request.");

    return;
  }

  messages.push("❌ Failed to create task.");

  reasoning.push("Task execution failed.");
}

/* ===================================================== */

function handleUpdateStatus(
  result: any,
  messages: string[],
  reasoning: string[],
) {
  if (!result?.ok) {
    messages.push("❌ Failed to update task.");

    return;
  }

  messages.push(`🔄 Task status changed to "${result.data.status}".`);

  reasoning.push("Updated task status successfully.");
}

/* ===================================================== */

function handlePriority(result: any, messages: string[], reasoning: string[]) {
  if (!result?.ok) {
    messages.push("❌ Failed to change priority.");

    return;
  }

  messages.push(`🔥 Priority updated to ${result.data.priority}.`);

  reasoning.push("Adjusted task priority.");
}

/* ===================================================== */

function appendReflection(
  reflection: any,
  messages: string[],
  reasoning: string[],
) {
  if (!reflection) return;

  if (reflection.failureRate > 0) {
    reasoning.push("Recovery strategies were applied.");
  }

  if (reflection.commonFailures?.length) {
    reasoning.push(
      `Recurring issues detected: ${reflection.commonFailures.join(", ")}`,
    );
  }

  if (reflection.recommendations?.length) {
    reasoning.push(...reflection.recommendations);
  }

  if (reflection.failureRate === 0) {
    messages.push("🧠 Confidence: High");
  } else if (reflection.failureRate < 0.5) {
    messages.push("🧠 Confidence: Medium");
  } else {
    messages.push("🧠 Confidence: Low");
  }
}
