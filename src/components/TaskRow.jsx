// src/components/TaskRow.jsx
// A single task row inside a Sub-goal section.
// Features: checkbox toggle, overdue status dot, due date, delete button.

import React from "react";
import { getTaskStatus, formatDate } from "../utils/status";

export default function TaskRow({ task, goalId, sgId, onToggle, onDelete }) {
  const status  = getTaskStatus(task);
  const dueStr  = formatDate(task.dueDate);
  const isDone  = task.completed;
  const isOverdue = status === "overdue";

  return (
    <div
      className="flex items-center gap-3 group fade-up"
      style={{
        padding:    "0.5625rem 0",
        borderBottom: "1px solid #F5F5F5",
      }}
    >
      {/* ── Overdue indicator ── */}
      <span
        className={`status-dot status-dot--${status} flex-shrink-0`}
        style={{ visibility: isOverdue ? "visible" : "hidden" }}
        aria-label={isOverdue ? "Overdue" : undefined}
      />

      {/* ── Checkbox ── */}
      <button
        className={`checkbox flex-shrink-0 ${isDone ? "checkbox--checked" : ""}`}
        onClick={() => onToggle(goalId, sgId, task.id)}
        aria-label={isDone ? "Mark incomplete" : "Mark complete"}
        aria-pressed={isDone}
      />

      {/* ── Title ── */}
      <span
        className={`flex-1 text-sm ${isDone ? "text-done" : "body-base"}`}
        style={{ minWidth: 0 }}
      >
        {task.title}
      </span>

      {/* ── Metadata: cadence + due date ── */}
      <div
        className="flex items-center gap-3 flex-shrink-0"
        style={{ opacity: isDone ? 0.4 : 1 }}
      >
        {task.cadence !== "once" && (
          <span className="mono-tag">{task.cadence.toUpperCase()}</span>
        )}
        {dueStr && (
          <span
            className="mono-tag"
            style={{ color: isOverdue && !isDone ? "#CC0000" : undefined }}
          >
            {dueStr}
          </span>
        )}
      </div>

      {/* ── Delete (hover-only) ── */}
      <button
        className="btn-icon flex-shrink-0 opacity-0 group-hover:opacity-100"
        style={{ transition: "opacity 120ms" }}
        onClick={() => onDelete(goalId, sgId, task.id)}
        aria-label={`Delete task: ${task.title}`}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M1 1l8 8M9 1L1 9" stroke="#000" strokeWidth="1.25" />
        </svg>
      </button>
    </div>
  );
}
