// src/components/MainLayout.jsx
// App shell. Owns:
//   - Global nav header
//   - Page-level state: which goal is in Deep Dive, whether GoalForm is open
//   - Deep Dive slide-in/out animation cycle

import React, { useState, useCallback } from "react";
import useGrowthOS from "../hooks/useGrowthOS";
import Dashboard  from "./Dashboard";
import DeepDive   from "./DeepDive";
import GoalForm   from "./GoalForm";

// Duration must match CSS keyframe durations in index.css
const SLIDE_IN_MS  = 240;
const SLIDE_OUT_MS = 200;

export default function MainLayout() {
  const {
    data,
    addGoal, updateGoal, deleteGoal,
    addSubGoal, updateSubGoal, deleteSubGoal,
    addTask, toggleTask, updateTask, deleteTask,
    updateAudit,
    exportData, importData,
  } = useGrowthOS();

  // ── Navigation state ───────────────────────────────────────────
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [panelClass,   setPanelClass]   = useState("deep-dive-enter");

  // ── GoalForm state ─────────────────────────────────────────────
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal,  setEditingGoal]  = useState(null); // null = add, obj = edit

  // ── Import file ref ────────────────────────────────────────────
  // We keep the hidden input in the header so it's accessible everywhere.

  // ── Deep Dive open/close ───────────────────────────────────────
  const openDeepDive = useCallback((goalId) => {
    setPanelClass("deep-dive-enter");
    setActiveGoalId(goalId);
  }, []);

  const closeDeepDive = useCallback(() => {
    setPanelClass("deep-dive-exit");
    setTimeout(() => {
      setActiveGoalId(null);
      setPanelClass("deep-dive-enter"); // reset for next open
    }, SLIDE_OUT_MS);
  }, []);

  // ── GoalForm open/close ────────────────────────────────────────
  const openAddGoal  = () => { setEditingGoal(null);  setShowGoalForm(true); };
  const openEditGoal = (goal) => { setEditingGoal(goal); setShowGoalForm(true); };
  const closeGoalForm = () => { setShowGoalForm(false); setEditingGoal(null); };

  // ── GoalForm save ──────────────────────────────────────────────
  const handleGoalSave = (fields) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, fields);
    } else {
      addGoal(fields);
    }
    closeGoalForm();
  };

  // ── Goal delete (may need to close Deep Dive first) ───────────
  const handleDeleteGoal = (goalId) => {
    if (activeGoalId === goalId) {
      // Close Deep Dive without animation (instant — already confirmed)
      setActiveGoalId(null);
    }
    deleteGoal(goalId);
  };

  // ── Derive the currently active goal object ────────────────────
  const activeGoal = data.bigGoals.find((g) => g.id === activeGoalId) ?? null;

  return (
    <div className="min-h-screen bg-white">

      {/* ══ Global nav header ══ */}
      <header
        className="fixed top-0 left-0 right-0 z-40 bg-white"
        style={{ borderBottom: "1px solid #000", height: "48px" }}
      >
        <div
          className="page-wrap h-full flex items-center justify-between"
        >
          {/* Brand wordmark */}
          <span
            className="label-caps"
            style={{ letterSpacing: "0.2em", fontSize: "0.75rem" }}
          >
            Growth OS
          </span>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              id="add-goal-btn"
              className="btn-solid"
              onClick={openAddGoal}
            >
              + Add Goal
            </button>

            <button
              id="export-btn"
              className="btn-ghost"
              onClick={exportData}
              title="Export all data as JSON"
            >
              Export
            </button>

            {/* Import — label wraps hidden file input */}
            <label
              id="import-label"
              className="btn-ghost"
              style={{ cursor: "pointer" }}
              title="Import data from JSON"
            >
              Import
              <input
                type="file"
                accept="application/json"
                onChange={importData}
                style={{ display: "none" }}
                aria-label="Import data file"
              />
            </label>
          </div>
        </div>
      </header>

      {/* ══ Main content — pushed below header ══ */}
      <main style={{ paddingTop: "48px" }}>
        <Dashboard
          goals={data.bigGoals}
          audit={data.growthAudit}
          onGoalClick={openDeepDive}
          onAddGoal={openAddGoal}
          onEditGoal={openEditGoal}
          onDeleteGoal={handleDeleteGoal}
          onAuditChange={updateAudit}
        />
      </main>

      {/* ══ Deep Dive overlay ══
           Rendered when a goal is active. Position fixed, starts below header.
           CSS animation class is toggled on open/close.                      */}
      {activeGoalId && activeGoal && (
        <div
          id="deep-dive-panel"
          className={panelClass}
          style={{
            position:   "fixed",
            top:        "48px",    // below header
            left:       0,
            right:      0,
            bottom:     0,
            zIndex:     30,
            background: "#fff",
            overflowY:  "auto",
          }}
        >
          <DeepDive
            goal={activeGoal}
            onBack={closeDeepDive}
            onEditGoal={openEditGoal}
            onDeleteGoal={handleDeleteGoal}
            onAddSubGoal={addSubGoal}
            onUpdateSubGoal={updateSubGoal}
            onDeleteSubGoal={deleteSubGoal}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        </div>
      )}

      {/* ══ Goal Add / Edit modal ══ */}
      {showGoalForm && (
        <GoalForm
          goal={editingGoal}
          onSave={handleGoalSave}
          onClose={closeGoalForm}
        />
      )}
    </div>
  );
}
