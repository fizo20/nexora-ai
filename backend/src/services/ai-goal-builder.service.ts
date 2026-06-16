export function buildEnhancedGoal(
  goal: string,
  contextData: any,
  conversationContext: string,
) {
  return `
${conversationContext}

Workspace State

Projects:
${contextData.projectsCount}

Tasks:
${contextData.tasksCount}

Blocked:
${contextData.blockedTasks}

Overdue:
${contextData.overdueTasks}

USER GOAL:

${goal}

RULES

Do not create duplicates.

Reuse existing tasks.

Avoid failures:
${contextData.failurePatterns.join(",")}
`;
}
