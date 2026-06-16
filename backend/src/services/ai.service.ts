// src/services/ai.service.ts
import { Task } from "../models/task.model";
import { Project } from "../models/project.model";

/**
 * Build structured project summary data
 * (AI-ready prompt payload)
 */
export const buildProjectSummaryData = async (
  workspaceId: string,
  projectId: string,
) => {
  const project = await Project.findOne({
    _id: projectId,
    workspaceId,
    deletedAt: null,
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const tasks = await Task.find({
    workspaceId,
    projectId,
    deletedAt: null,
  });

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "DONE").length;
  const overdue = tasks.filter(
    (t) => t.dueDate && t.dueDate < new Date() && t.status !== "DONE",
  ).length;

  return {
    projectName: project.name,
    description: project.description,
    totalTasks: total,
    completedTasks: done,
    overdueTasks: overdue,
    tasks: tasks.map((t) => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
    })),
  };
};

type AITaskSummary = {
  title: string;
  status: string;
  priority: string;
  dueDate?: Date | string | null;
};

type ProjectSummaryData = {
  projectName: string;
  description?: string;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  tasks: AITaskSummary[];
};

export const buildProjectSummaryPrompt = (data: ProjectSummaryData) => {
  return `
You are a workspace project analyst.

Summarize this project status clearly.

Project: ${data.projectName}

Description: ${data.description}

Total tasks: ${data.totalTasks}
Completed: ${data.completedTasks}
Overdue: ${data.overdueTasks}

Tasks:${data.tasks
    .map((t) => `- ${t.title} | ${t.status} | ${t.priority} | ${t.dueDate}`)
    .join("\n")}

Return:
- Progress summary
- Risk warnings
- Suggested next actions
`;
};

type AISuggestionTask = {
  title: string;
  status: string;
  priority: string;
  dueDate?: Date | null;
};

export const buildTaskSuggestionPrompt = (input: {
  projectName: string;
  description?: string;
  tasks: AISuggestionTask[];
}) => {
  return `
You are an AI project planner.

Analyze this project and suggest:
- Missing tasks
- Next best tasks
- Priority improvements
- Risk warnings

Project: ${input.projectName}

Description: ${input.description ?? "N/A"}

Existing Tasks:
${input.tasks
  .map(
    (t) =>
      `- ${t.title} | status=${t.status} | priority=${t.priority} | due=${t.dueDate}`,
  )
  .join("\n")}

Return:
- Suggested new tasks
- Suggested priority changes
- Short reasoning
`;
};

export const buildTaskSuggestionData = async (
  workspaceId: string,
  projectId: string,
) => {
  const project = await Project.findOne({
    _id: projectId,
    workspaceId,
    deletedAt: null,
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const tasks = await Task.find({
    workspaceId,
    projectId,
    deletedAt: null,
  });

  return {
    projectName: project.name,
    description: project.description,
    tasks: tasks.map((t) => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate ?? null,
    })),
  };
};

export const buildRiskAnalysisData = async (
  workspaceId: string,
  projectId: string,
) => {
  const project = await Project.findOne({
    _id: projectId,
    workspaceId,
    deletedAt: null,
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const tasks = await Task.find({
    workspaceId,
    projectId,
    deletedAt: null,
  });

  const now = new Date();

  const overdue = tasks.filter(
    (t) => t.dueDate && t.dueDate < now && t.status !== "DONE",
  );

  const highNotStarted = tasks.filter(
    (t) => t.priority === "HIGH" && t.status === "TODO",
  );

  /* ---------- Assignee workload ---------- */
  const workload: Record<string, number> = {};

  for (const t of tasks) {
    if (!t.assignee) continue;
    const key = t.assignee.toString();
    workload[key] = (workload[key] || 0) + 1;
  }

  return {
    projectName: project.name,
    description: project.description,
    totalTasks: tasks.length,
    overdueCount: overdue.length,
    highNotStartedCount: highNotStarted.length,
    workload,
    tasks: tasks.map((t) => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate ?? null,
      assignee: t.assignee ? t.assignee.toString() : null,
    })),
  };
};

type AIRiskTask = {
  title: string;
  status: string;
  priority: string;
  dueDate?: Date | null;
  assignee?: string | null;
};

export const buildRiskAnalysisPrompt = (input: {
  projectName: string;
  description?: string;
  totalTasks: number;
  overdueCount: number;
  highNotStartedCount: number;
  workload: Record<string, number>;
  tasks: AIRiskTask[];
}) => {
  return `
You are an AI delivery risk analyst.

Analyze this project and report:

- Delivery risk level (LOW / MEDIUM / HIGH)
- Major blockers
- Overload risks
- Deadline risks
- Mitigation actions

Project: ${input.projectName}

Description: ${input.description ?? "N/A"}

Stats:
Total tasks: ${input.totalTasks}
Overdue tasks: ${input.overdueCount}
High priority not started: ${input.highNotStartedCount}

Workload distribution:
${Object.entries(input.workload)
  .map(([user, count]) => `User ${user}: ${count} tasks`)
  .join("\n")}

Tasks:
${input.tasks
  .map(
    (t) =>
      `- ${t.title} | ${t.status} | ${t.priority} | ${t.dueDate} | assignee=${t.assignee}`,
  )
  .join("\n")}

Return structured bullet points.
`;
};

/**
 * Build Workspace Q&A Data
 *
 * This gathers SAFE structured tenant data
 * used as grounding context for AI answers.
 *
 * Multi-tenant safety rule:
 * ONLY workspace-scoped data is included.
 */
export const buildWorkspaceQAData = async (workspaceId: string) => {
  /**
   * Fetch active projects in workspace
   */
  const projects = await Project.find({
    workspaceId,
    deletedAt: null,
  }).select("name status");

  /**
   * Fetch active tasks in workspace
   */
  const tasks = await Task.find({
    workspaceId,
    deletedAt: null,
  }).select("title status priority dueDate projectId");

  return {
    projects: projects.map((p) => ({
      name: p.name,
      status: p.status,
    })),

    tasks: tasks.map((t) => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      projectId: t.projectId.toString(),
    })),
  };
};

/**
 * Build Workspace Q&A Prompt
 *
 * This turns workspace data into
 * an AI-readable context block.
 *
 * This is Retrieval-Augmented Prompting.
 */
export const buildWorkspaceQAPrompt = (
  data: Awaited<ReturnType<typeof buildWorkspaceQAData>>,
  question: string,
) => {
  return `
You are an AI workspace assistant.

Answer using ONLY the workspace data provided.
If the answer is not in the data, say "Not found in workspace data."

Projects:
${data.projects.map((p) => `- ${p.name} | ${p.status}`).join("\n")}

Tasks:
${data.tasks
  .map((t) => `- ${t.title} | ${t.status} | ${t.priority} | due:${t.dueDate}`)
  .join("\n")}

User Question:
${question}

Answer clearly and concisely.
`;
};

export const buildAssistantChatPrompt = (
  contextBlock: string,
  workspaceDataBlock: string,
  userMessage: string,
) => {
  return `
You are a workspace AI assistant.

Use ONLY the provided workspace data.
Do not invent facts.
Be concise and actionable.

${contextBlock}

${workspaceDataBlock}

User question:
${userMessage}
`;
};

export const buildAIActionPrompt = (
  workspaceName: string,
  userMessage: string,
) => {
  return `
You are an AI workspace assistant.

Workspace: ${workspaceName}

User request:
${userMessage}

If an action is appropriate, return ONLY valid JSON.

Allowed actions:
- create_task
- update_task_status
- set_task_priority

Formats:

create_task:
{
  "action": "create_task",
  "title": "...",
  "description": "...",
  "priority": "LOW|MEDIUM|HIGH"
}

update_task_status:
{
  "action": "update_task_status",
  "taskId": "...",
  "status": "TODO|IN_PROGRESS|DONE"
}

set_task_priority:
{
  "action": "set_task_priority",
  "taskId": "...",
  "priority": "LOW|MEDIUM|HIGH"
}

If no action is needed → return:
{ "action": "none" }
`;
};
