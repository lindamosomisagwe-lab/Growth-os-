// src/utils/status.js
// Computed status, progress, and date formatting helpers.
// All logic is pure — no side effects, no React.

// ── Status computation ──────────────────────────────────────────

/**
 * Returns the display status for a single task.
 * @returns {"complete"|"overdue"|"active"}
 */
export function getTaskStatus(task) {
  if (task.completed) return "complete";
  if (task.dueDate && new Date(task.dueDate) < new Date()) return "overdue";
  return "active";
}

/**
 * Returns the display status for a Big Goal.
 * A goal is "complete" only when every task across all sub-goals is done.
 * @returns {"complete"|"overdue"|"active"|"paused"}
 */
export function getGoalStatus(goal) {
  const allTasks = goal.subGoals.flatMap((sg) => sg.tasks);
  if (allTasks.length > 0 && allTasks.every((t) => t.completed))
    return "complete";
  if (goal.dueDate && new Date(goal.dueDate) < new Date()) return "overdue";
  return "active";
}

// ── Progress computation ────────────────────────────────────────

/**
 * Returns a 0–100 integer representing task completion for a Big Goal.
 */
export function getGoalProgress(goal) {
  const allTasks = goal.subGoals.flatMap((sg) => sg.tasks);
  if (!allTasks.length) return 0;
  const done = allTasks.filter((t) => t.completed).length;
  return Math.round((done / allTasks.length) * 100);
}

/**
 * Returns a 0–100 integer representing task completion for a Sub-goal.
 */
export function getSubGoalProgress(subGoal) {
  if (!subGoal.tasks.length) return 0;
  const done = subGoal.tasks.filter((t) => t.completed).length;
  return Math.round((done / subGoal.tasks.length) * 100);
}

/**
 * Returns { completed, total } task counts for a Big Goal.
 */
export function getGoalTaskCounts(goal) {
  const allTasks = goal.subGoals.flatMap((sg) => sg.tasks);
  return { completed: allTasks.filter((t) => t.completed).length, total: allTasks.length };
}

// ── Date formatting ─────────────────────────────────────────────

/**
 * Formats an ISO date string as "27 May 2026".
 * Returns null if no date given.
 */
export function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Returns the number of days until a due date (negative = past).
 */
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Returns a short human-readable due string: "2d left", "3d overdue", "Today".
 */
export function dueSummary(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return null;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 0) return `${days}d left`;
  return `${Math.abs(days)}d overdue`;
}
