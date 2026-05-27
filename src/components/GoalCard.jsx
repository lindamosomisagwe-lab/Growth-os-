// src/components/GoalCard.jsx
// The primary card unit on the Dashboard grid.
// Clicking the card body opens the Deep Dive.
// Edit/Delete buttons are revealed in the top-right corner.

import React, { useState } from "react";
import {
  getGoalProgress,
  getGoalStatus,
  getGoalTaskCounts,
  formatDate,
} from "../utils/status";

const STATUS_LABELS = {
  complete: "Complete",
  overdue:  "Overdue",
  active:   "Active",
  paused:   "Paused",
};

export default function GoalCard({ goal, onClick, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status   = getGoalStatus(goal);
  const progress = getGoalProgress(goal);
  const { completed, total } = getGoalTaskCounts(goal);
  const dueStr   = formatDate(goal.dueDate);

  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (window.confirm(`Delete "${goal.title}"? This cannot be undone.`)) {
      onDelete(goal.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit(goal);
  };

  return (
    <article
      className="card card-interactive flex flex-col"
      style={{ minHeight: "200px" }}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Goal: ${goal.title}. ${status}. ${progress}% complete.`}
    >
      {/* ── Row 1: Category + Status ── */}
      <div className="flex items-center justify-between mb-4">
        <span className="tag tag--active" style={{ borderColor: "#000" }}>
          {goal.category.toUpperCase()}
        </span>

        <div className="flex items-center gap-2">
          {/* Status dot + label */}
          <span
            className={`status-dot status-dot--${status}`}
            aria-hidden="true"
          />
          <span className="label-caps" style={{ color: status === "overdue" ? "#CC0000" : undefined }}>
            {STATUS_LABELS[status]}
          </span>

          {/* ⋯ menu */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="btn-icon ml-1"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Goal options"
              aria-expanded={menuOpen}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="2"  r="1.2" fill="#000" />
                <circle cx="7" cy="7"  r="1.2" fill="#000" />
                <circle cx="7" cy="12" r="1.2" fill="#000" />
              </svg>
            </button>

            {menuOpen && (
              <>
                {/* Click-away overlay */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  className="absolute right-0 top-full z-20 bg-white"
                  style={{ border: "1px solid #000", minWidth: "120px", marginTop: "4px" }}
                >
                  <button
                    className="block w-full text-left px-4 py-2 body-sm hover:bg-neutral-100"
                    onClick={handleEdit}
                  >
                    Edit
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 body-sm hover:bg-neutral-100"
                    style={{ color: "#CC0000" }}
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 2: Title ── */}
      <h2 className="heading-md mb-1" style={{ wordBreak: "break-word" }}>
        {goal.title}
      </h2>

      {/* ── Row 3: Description ── */}
      {goal.description && (
        <p
          className="body-sm mb-4"
          style={{
            display:         "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow:        "hidden",
          }}
        >
          {goal.description}
        </p>
      )}

      {/* ── Row 4: Stats ── */}
      <div className="flex items-center gap-3 mt-auto mb-3">
        <span className="mono-tag">
          {goal.subGoals.length} sub-goal{goal.subGoals.length !== 1 ? "s" : ""}
        </span>
        <span className="mono-tag" style={{ color: "#D4D4D4" }}>·</span>
        <span className="mono-tag">
          {completed}/{total} task{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Row 5: Progress bar ── */}
      <div className="progress-track mb-3">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* ── Row 6: Due date + arrow ── */}
      <div className="flex items-center justify-between">
        <span className="mono-tag">
          {dueStr ? `Due ${dueStr}` : "No due date"}
        </span>
        <span className="label-caps" style={{ letterSpacing: "0.05em" }}>→</span>
      </div>
    </article>
  );
}
