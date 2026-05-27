// src/components/SubGoalSection.jsx
// A single sub-goal block inside the Deep Dive panel.
// Manages its own local state for:
//   - Inline title editing
//   - "Add task" form visibility + input

import React, { useState, useRef, useEffect } from "react";
import TaskRow from "./TaskRow";
import { getSubGoalProgress, formatDate } from "../utils/status";

export default function SubGoalSection({
  subGoal,
  goalId,
  onUpdateSubGoal,
  onDeleteSubGoal,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) {
  const progress = getSubGoalProgress(subGoal);
  const done     = subGoal.tasks.filter((t) => t.completed).length;
  const dueStr   = formatDate(subGoal.dueDate);

  // ── Inline title edit ──────────────────────────────────────────
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft]     = useState(subGoal.title);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== subGoal.title) {
      onUpdateSubGoal(goalId, subGoal.id, { title: trimmed });
    } else {
      setTitleDraft(subGoal.title); // revert if empty or unchanged
    }
    setEditingTitle(false);
  };

  // ── Add Task inline form ───────────────────────────────────────
  const [showAddTask, setShowAddTask]   = useState(false);
  const [taskTitle, setTaskTitle]       = useState("");
  const [taskDue, setTaskDue]           = useState("");
  const taskInputRef = useRef(null);

  useEffect(() => {
    if (showAddTask) taskInputRef.current?.focus();
  }, [showAddTask]);

  const submitTask = () => {
    const trimmed = taskTitle.trim();
    if (!trimmed) return;
    onAddTask(goalId, subGoal.id, {
      title:   trimmed,
      dueDate: taskDue || null,
    });
    setTaskTitle("");
    setTaskDue("");
    // keep form open for rapid entry
    taskInputRef.current?.focus();
  };

  const handleTaskKeyDown = (e) => {
    if (e.key === "Enter") submitTask();
    if (e.key === "Escape") {
      setShowAddTask(false);
      setTaskTitle("");
      setTaskDue("");
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Delete sub-goal "${subGoal.title}" and all its tasks? This cannot be undone.`
      )
    ) {
      onDeleteSubGoal(goalId, subGoal.id);
    }
  };

  return (
    <div
      className="fade-up"
      style={{ borderBottom: "1px solid #E5E5E5", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}
    >
      {/* ── Sub-goal header ── */}
      <div className="flex items-start justify-between gap-4 mb-2">
        {/* Title — click to edit inline */}
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input
              ref={titleInputRef}
              className="input-inline heading-sm w-full"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitTitle();
                if (e.key === "Escape") { setTitleDraft(subGoal.title); setEditingTitle(false); }
              }}
              maxLength={200}
            />
          ) : (
            <button
              className="heading-sm text-left w-full hover:opacity-60 transition-opacity"
              onClick={() => setEditingTitle(true)}
              title="Click to edit title"
              style={{ background: "none", border: "none", padding: 0, cursor: "text" }}
            >
              {subGoal.title}
            </button>
          )}

          {/* Meta row: due date + task count */}
          <div className="flex items-center gap-3 mt-1">
            {dueStr && <span className="mono-tag">Due {dueStr}</span>}
            <span className="mono-tag" style={{ color: "#A3A3A3" }}>
              {done}/{subGoal.tasks.length} done
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            className="btn-text"
            onClick={() => setShowAddTask((v) => !v)}
            aria-label="Add task"
          >
            + Task
          </button>
          <button
            className="btn-icon"
            onClick={handleDelete}
            aria-label="Delete sub-goal"
            title="Delete sub-goal"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M1 1l8 8M9 1L1 9" stroke="#000" strokeWidth="1.25" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="progress-track mb-4" style={{ height: "1px" }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* ── Task list ── */}
      {subGoal.tasks.length > 0 && (
        <div className="mb-2">
          {subGoal.tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              goalId={goalId}
              sgId={subGoal.id}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      )}

      {/* ── Empty task state ── */}
      {subGoal.tasks.length === 0 && !showAddTask && (
        <p className="body-sm" style={{ color: "#A3A3A3", paddingTop: "0.25rem" }}>
          No tasks yet.{" "}
          <button
            className="btn-text"
            onClick={() => setShowAddTask(true)}
            style={{ display: "inline" }}
          >
            Add one →
          </button>
        </p>
      )}

      {/* ── Add Task inline form ── */}
      {showAddTask && (
        <div
          className="flex items-center gap-2 mt-3 fade-up"
          style={{ paddingTop: "0.5rem", borderTop: "1px solid #E5E5E5" }}
        >
          {/* Dummy checkbox marker */}
          <span
            className="checkbox flex-shrink-0"
            style={{ borderColor: "#D4D4D4", cursor: "default" }}
          />

          <input
            ref={taskInputRef}
            className="flex-1 input-inline text-sm"
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            onKeyDown={handleTaskKeyDown}
            placeholder="Task title…"
            maxLength={200}
          />
          <input
            className="mono-tag"
            type="date"
            value={taskDue}
            onChange={(e) => setTaskDue(e.target.value)}
            style={{
              border:     "1px solid #D4D4D4",
              padding:    "0.25rem 0.375rem",
              fontSize:   "0.6875rem",
              background: "#fff",
              cursor:     "pointer",
            }}
            aria-label="Task due date"
          />

          <button
            className="btn-solid"
            style={{ padding: "0.3rem 0.75rem", fontSize: "0.6875rem" }}
            onClick={submitTask}
            disabled={!taskTitle.trim()}
          >
            Add
          </button>
          <button
            className="btn-icon"
            onClick={() => { setShowAddTask(false); setTaskTitle(""); setTaskDue(""); }}
            aria-label="Cancel add task"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M1 1l8 8M9 1L1 9" stroke="#000" strokeWidth="1.25" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
