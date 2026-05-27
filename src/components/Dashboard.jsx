// src/components/Dashboard.jsx
// The primary view: goal grid + category filter + growth audit section.

import React, { useState } from "react";
import GoalCard from "./GoalCard";

const CATEGORIES = ["all", "career", "health", "fun", "learning", "other"];

// ── Growth Audit inline ──────────────────────────────────────────
function GrowthAudit({ audit, onAuditChange }) {
  return (
    <section aria-label="Growth Audit" style={{ borderTop: "1px solid #000", paddingTop: "3rem", marginTop: "4rem" }}>
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="heading-lg">Growth Audit</h2>
        <p className="body-sm">Self-assessed 0 – 100</p>
      </div>

      <div className="flex flex-col gap-0" style={{ border: "1px solid #000" }}>
        {Object.entries(audit).map(([key, val], i) => (
          <div
            key={key}
            className="flex items-center gap-6"
            style={{
              padding:     "1.25rem 1.5rem",
              borderTop:   i > 0 ? "1px solid #E5E5E5" : "none",
            }}
          >
            {/* Label */}
            <span
              className="label-caps"
              style={{ width: "80px", flexShrink: 0, letterSpacing: "0.14em" }}
            >
              {key.toUpperCase()}
            </span>

            {/* Slider */}
            <div className="flex-1 relative" style={{ height: "2px", background: "#E5E5E5" }}>
              {/* Filled portion */}
              <div
                style={{
                  position:        "absolute",
                  left:            0,
                  top:             0,
                  height:          "100%",
                  width:           `${val}%`,
                  backgroundColor: "#000",
                  transition:      "width 150ms ease",
                  pointerEvents:   "none",
                }}
              />
              {/* The actual range input — transparent, sits on top */}
              <input
                type="range"
                min={0}
                max={100}
                value={val}
                onChange={(e) => onAuditChange(key, e.target.value)}
                aria-label={`${key} score: ${val}`}
                style={{
                  position:   "absolute",
                  inset:      "-10px 0",
                  width:      "100%",
                  opacity:    0,
                  cursor:     "pointer",
                  margin:     0,
                  padding:    0,
                  height:     "24px",
                }}
              />
            </div>

            {/* Value */}
            <span
              className="mono-tag"
              style={{
                width:     "36px",
                textAlign: "right",
                flexShrink: 0,
                fontSize:  "0.875rem",
                color:     "#000",
                fontWeight: 500,
              }}
            >
              {val}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Empty state ──────────────────────────────────────────────────
function EmptyState({ onAdd, filter }) {
  const isFiltered = filter !== "all";
  return (
    <div
      className="flex flex-col items-center justify-center py-24 text-center"
      style={{ border: "1px solid #E5E5E5" }}
    >
      <p
        className="label-caps mb-4"
        style={{ letterSpacing: "0.18em", color: "#A3A3A3" }}
      >
        {isFiltered ? `No ${filter} goals` : "No goals yet"}
      </p>
      <div
        style={{
          width:           "32px",
          borderTop:       "1px solid #D4D4D4",
          marginBottom:    "1.5rem",
        }}
      />
      <p className="body-sm mb-6">
        {isFiltered
          ? `You have no goals in the "${filter}" category.`
          : "Start by setting your first big, measurable goal."}
      </p>
      {!isFiltered && (
        <button className="btn-solid" onClick={onAdd}>
          + Add First Goal
        </button>
      )}
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────
export default function Dashboard({
  goals,
  audit,
  onGoalClick,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onAuditChange,
}) {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all" ? goals : goals.filter((g) => g.category === filter);

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === "all" ? goals.length : goals.filter((g) => g.category === cat).length;
    return acc;
  }, {});

  return (
    <div className="page-wrap py-10">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="heading-xl">Goals</h1>
          <p className="body-sm mt-1">
            {goals.length === 0
              ? "No goals tracked yet"
              : `${goals.length} big goal${goals.length !== 1 ? "s" : ""} tracked`}
          </p>
        </div>
      </div>

      {/* ── Category filter strip ── */}
      <div
        className="flex items-center gap-0 mb-8"
        style={{ borderBottom: "1px solid #000", overflowX: "auto" }}
        role="tablist"
        aria-label="Filter by category"
      >
        {CATEGORIES.map((cat) => {
          const count  = categoryCounts[cat];
          const active = filter === cat;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(cat)}
              className="label-caps"
              style={{
                padding:         "0.625rem 1rem",
                marginBottom:    "-1px",
                color:           active ? "#000" : "#737373",
                whiteSpace:      "nowrap",
                background:      "none",
                border:          "none",
                borderBottom:    active ? "2px solid #000" : "2px solid transparent",
                cursor:          "pointer",
                letterSpacing:   "0.1em",
                transition:      "color 100ms",
              }}
            >
              {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              {count > 0 && (
                <span
                  className="mono-tag ml-1.5"
                  style={{ color: active ? "#000" : "#A3A3A3" }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Goal grid ── */}
      {filtered.length === 0 ? (
        <EmptyState onAdd={onAddGoal} filter={filter} />
      ) : (
        /*
          Newspaper grid: `gap: 1px` on a black-background container.
          Each card has a white background, so the 1px gaps appear as
          hairline black borders between cells. Zero individual card borders.
        */
        <div
          style={{
            display:               "grid",
            gridTemplateColumns:   "repeat(auto-fill, minmax(300px, 1fr))",
            gap:                   "1px",
            backgroundColor:       "#000",
            border:                "1px solid #000",
          }}
          role="list"
          aria-label="Goal cards"
        >
          {filtered.map((goal) => (
            <div key={goal.id} style={{ backgroundColor: "#fff" }} role="listitem">
              <GoalCard
                goal={goal}
                onClick={() => onGoalClick(goal.id)}
                onEdit={onEditGoal}
                onDelete={onDeleteGoal}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Growth Audit ── */}
      <GrowthAudit audit={audit} onAuditChange={onAuditChange} />
    </div>
  );
}
