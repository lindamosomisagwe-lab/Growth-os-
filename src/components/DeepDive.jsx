// src/components/DeepDive.jsx
// Full-page panel for managing sub-goals and tasks for a single Big Goal.
// Animation (slide-in/out) is handled by the parent via CSS class injection.

import React, { useState, useRef, useEffect } from "react";
import SubGoalSection from "./SubGoalSection";
import {
  getGoalProgress,
  getGoalStatus,
  getGoalTaskCounts,
  formatDate,
} from "../utils/status";

export default function DeepDive({
  goal,
  onBack,
  onEditGoal,
  onDeleteGoal,
  onAddSubGoal,
  onUpdateSubGoal,
  onDeleteSubGoal,
  onAddTask,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
}) {
  const progress                          = getGoalProgress(goal);
  const status                            = getGoalStatus(goal);
  const { completed, total }              = getGoalTaskCounts(goal);
  const dueStr                            = formatDate(goal.dueDate);

  // ── Add Sub-goal inline form ───────────────────────────────────
  const [showAddSg, setShowAddSg]         = useState(false);
  const [sgTitle, setSgTitle]             = useState("");
  const [sgDue, setSgDue]                 = useState("");
  const sgInputRef                        = useRef(null);

  useEffect(() => {
    if (showAddSg) sgInputRef.current?.focus();
  }, [showAddSg]);

  const submitSubGoal = () => {
    const trimmed = sgTitle.trim();
    if (!trimmed) return;
    onAddSubGoal(goal.id, { title: trimmed, dueDate: sgDue || null });
    setSgTitle("");
    setSgDue("");
    // keep open for rapid entry
    sgInputRef.current?.focus();
  };

  const handleSgKeyDown = (e) => {
    if (e.key === "Enter") submitSubGoal();
    if (e.key === "Escape") { setShowAddSg(false); setSgTitle(""); setSgDue(""); }
  };

  const handleDeleteGoal = () => {
    if (window.confirm(`Delete "${goal.title}" and all its data? This cannot be undone.`)) {
      onDeleteGoal(goal.id);
    }
  };

  // ── Keyboard shortcut: Escape to go back ──────────────────────
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !showAddSg) onBack(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack, showAddSg]);

  return (
    <div className="h-full overflow-y-auto bg-white" id="deep-dive-panel">
      {/* ── Sticky panel header ── */}
      <div
        className="sticky top-0 z-10 bg-white"
        style={{ borderBottom: "1px solid #000" }}
      >
        <div className="page-wrap py-0">
          <div className="flex items-center justify-between h-12">
            {/* Back */}
            <button
              className="btn-text"
              onClick={onBack}
              aria-label="Back to goals"
            >
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                <path d="M5 1L1 5l4 4M1 5h12" stroke="#737373" strokeWidth="1.25" />
              </svg>
              Goals
            </button>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="btn-ghost" onClick={() => onEditGoal(goal)}>
                Edit
              </button>
              <button
                className="btn-ghost btn-danger"
                onClick={handleDeleteGoal}
                aria-label="Delete this goal"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Goal overview ── */}
      <div style={{ borderBottom: "1px solid #000" }}>
        <div className="page-wrap py-8">
          {/* Category + status */}
          <div className="flex items-center gap-3 mb-4">
            <span className="tag tag--active">{goal.category.toUpperCase()}</span>
            <span
              className={`status-dot status-dot--${status}`}
              aria-hidden="true"
            />
            <span className="label-caps">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {dueStr && (
              <>
                <span className="label-caps" style={{ color: "#D4D4D4" }}>·</span>
                <span className="mono-tag">Due {dueStr}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="heading-xl mb-2">{goal.title}</h1>

          {/* Description */}
          {goal.description && (
            <p className="body-base mb-6" style={{ maxWidth: "640px" }}>
              {goal.description}
            </p>
          )}

          {/* Progress stats */}
          <div className="flex items-center gap-4 mb-3">
            <span className="mono-tag">
              {completed} / {total} tasks complete
            </span>
            <span className="mono-tag" style={{ color: "#A3A3A3" }}>·</span>
            <span className="mono-tag">{progress}%</span>
          </div>

          {/* Full-width progress bar — 3px, prominent */}
          <div className="progress-track" style={{ height: "3px" }}>
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* ── Sub-goals section ── */}
      <div className="page-wrap py-8">
        {/* Section header */}
        <div
          className="flex items-center justify-between mb-6"
          style={{ borderBottom: "1px solid #000", paddingBottom: "0.75rem" }}
        >
          <div className="flex items-center gap-3">
            <span className="label-caps" style={{ letterSpacing: "0.15em" }}>
              Sub-goals
            </span>
            <span className="mono-tag" style={{ color: "#A3A3A3" }}>
              {goal.subGoals.length}
            </span>
          </div>
          <button
            className="btn-ghost"
            onClick={() => setShowAddSg((v) => !v)}
            aria-label="Add sub-goal"
          >
            + Sub-goal
          </button>
        </div>

        {/* ── Add Sub-goal inline form ── */}
        {showAddSg && (
          <div
            className="flex items-center gap-2 mb-6 p-4 fade-up"
            style={{ border: "1px solid #000" }}
          >
            <input
              ref={sgInputRef}
              className="flex-1 input-inline heading-sm"
              type="text"
              value={sgTitle}
              onChange={(e) => setSgTitle(e.target.value)}
              onKeyDown={handleSgKeyDown}
              placeholder="Sub-goal title…"
              maxLength={200}
            />
            <input
              className="mono-tag"
              type="date"
              value={sgDue}
              onChange={(e) => setSgDue(e.target.value)}
              style={{
                border:     "1px solid #D4D4D4",
                padding:    "0.25rem 0.375rem",
                fontSize:   "0.6875rem",
                background: "#fff",
                cursor:     "pointer",
              }}
              aria-label="Sub-goal due date"
            />
            <button
              className="btn-solid"
              style={{ padding: "0.375rem 0.875rem", fontSize: "0.75rem" }}
              onClick={submitSubGoal}
              disabled={!sgTitle.trim()}
            >
              Add
            </button>
            <button
              className="btn-icon"
              onClick={() => { setShowAddSg(false); setSgTitle(""); setSgDue(""); }}
              aria-label="Cancel"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M1 1l8 8M9 1L1 9" stroke="#000" strokeWidth="1.25" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Sub-goal list ── */}
        {goal.subGoals.length === 0 && !showAddSg ? (
          <div className="py-12 text-center">
            <p className="heading-sm mb-1" style={{ color: "#A3A3A3" }}>
              No sub-goals yet.
            </p>
            <p className="body-sm mb-4">
              Break this goal into concrete milestones.
            </p>
            <button
              className="btn-ghost"
              onClick={() => setShowAddSg(true)}
            >
              + Add First Sub-goal
            </button>
          </div>
        ) : (
          goal.subGoals.map((sg) => (
            <SubGoalSection
              key={sg.id}
              subGoal={sg}
              goalId={goal.id}
              onUpdateSubGoal={onUpdateSubGoal}
              onDeleteSubGoal={onDeleteSubGoal}
              onAddTask={onAddTask}
              onToggleTask={onToggleTask}
              onDeleteTask={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
}
