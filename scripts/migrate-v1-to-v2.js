#!/usr/bin/env node
/**
 * migrate-v1-to-v2.js
 * ─────────────────────────────────────────────────────────────────
 * Migrates the "Japanese Stationery" Growth OS data shape (v1) to
 * the new 3-tier Neo-Minimalist schema (v2).
 *
 * V1 shape:
 *   { projects: [], creativeLog: [], growthAudit: { career, fun, health } }
 *
 * V2 shape:
 *   { version: 2, meta: {…}, bigGoals: [ Goal → SubGoal → Task ], growthAudit: {…} }
 *
 * Usage:
 *   node scripts/migrate-v1-to-v2.js <input.json> [output.json]
 *
 * If no input file is given, reads from stdin.
 * Output defaults to "growth_os_v2.json" in the current directory.
 * ─────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync } from "fs";

// ── Tiny ID generator (no external deps needed) ──────────────────
function nanoid(n = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: n }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

function makeId(prefix) {
  return `${prefix}_${nanoid(8)}`;
}

// ── Input / output paths ──────────────────────────────────────────
const [, , inputPath, outputPath = "growth_os_v2.json"] = process.argv;

let raw;
if (inputPath) {
  raw = readFileSync(inputPath, "utf-8");
} else {
  // Read from stdin if no file provided
  raw = readFileSync("/dev/stdin", "utf-8");
}

let oldData;
try {
  oldData = JSON.parse(raw);
} catch (err) {
  console.error("✗ Failed to parse input JSON:", err.message);
  process.exit(1);
}

// ── Detect if already migrated ────────────────────────────────────
if (oldData.version === 2) {
  console.warn("⚠ Input is already v2 schema. Aborting to prevent data loss.");
  process.exit(0);
}

const now = new Date().toISOString();

// ── Helper: map a v1 task object → v2 task ───────────────────────
// Attempts graceful field-name fallbacks for common variations.
function mapTask(t, subGoalId) {
  return {
    id:          t.id          ?? makeId("task"),
    subGoalId,
    title:       t.title       ?? t.name    ?? t.text ?? "Untitled Task",
    cadence:     t.cadence     ?? t.repeat  ?? "once",
    dueDate:     t.dueDate     ?? t.due     ?? null,
    completed:   t.completed   ?? t.done    ?? false,
    completedAt: t.completedAt ?? (t.done ? now : null),
    createdAt:   t.createdAt   ?? now,
    notes:       t.notes       ?? t.note    ?? "",
  };
}

// ── Helper: map a v1 sub-goal / milestone → v2 subGoal ───────────
function mapSubGoal(sg, goalId) {
  const sgId = sg.id ?? makeId("sg");
  return {
    id:        sgId,
    goalId,
    title:     sg.title     ?? sg.name     ?? sg.milestone ?? "Untitled Sub-goal",
    dueDate:   sg.dueDate   ?? sg.due      ?? null,
    createdAt: sg.createdAt ?? now,
    tasks: (sg.tasks ?? sg.items ?? sg.steps ?? []).map((t) =>
      mapTask(t, sgId)
    ),
  };
}

// ── Migrate projects → bigGoals ───────────────────────────────────
// Supports field-name variations: name/title, milestones/subGoals, etc.
const bigGoals = (oldData.projects ?? []).map((project) => {
  const goalId = project.id ?? makeId("goal");

  // A project without sub-goals gets one default sub-goal so structure is intact
  const rawSubGoals =
    project.subGoals    ??
    project.milestones  ??
    project.phases      ??
    project.stages      ??
    [];

  // If the project had a flat task list (no sub-goals), wrap them
  const flatTasks = project.tasks ?? project.items ?? [];
  let subGoals;

  if (rawSubGoals.length > 0) {
    subGoals = rawSubGoals.map((sg) => mapSubGoal(sg, goalId));
  } else if (flatTasks.length > 0) {
    // Wrap flat tasks under a single auto-generated sub-goal
    const wrapperId = makeId("sg");
    subGoals = [
      {
        id:        wrapperId,
        goalId,
        title:     "General Tasks",
        dueDate:   null,
        createdAt: now,
        tasks:     flatTasks.map((t) => mapTask(t, wrapperId)),
      },
    ];
  } else {
    subGoals = [];
  }

  return {
    id:          goalId,
    title:       project.title       ?? project.name ?? "Untitled Goal",
    description: project.description ?? project.desc ?? "",
    dueDate:     project.dueDate     ?? project.due  ?? null,
    category:    project.category    ?? project.area ?? "other",
    createdAt:   project.createdAt   ?? now,
    subGoals,
  };
});

// ── Migrate growthAudit (1:1 compatible, just ensure all keys exist) ──
const v1Audit = oldData.growthAudit ?? {};
const growthAudit = {
  career: v1Audit.career ?? 0,
  health: v1Audit.health ?? 0,
  fun:    v1Audit.fun    ?? 0,
};

// ── Preserve creativeLog under a legacy key ────────────────────────
// creativeLog doesn't cleanly map to the 3-tier hierarchy.
// It's preserved so no data is lost; you can re-integrate it later.
const legacyCreativeLog = oldData.creativeLog ?? [];

// ── Assemble v2 output ─────────────────────────────────────────────
const v2 = {
  version: 2,
  meta: {
    createdAt:    now,
    lastUpdated:  now,
    migratedFrom: "v1",
  },
  bigGoals,
  growthAudit,
  ...(legacyCreativeLog.length > 0
    ? { _legacyCreativeLog: legacyCreativeLog }
    : {}),
};

// ── Write output ──────────────────────────────────────────────────
writeFileSync(outputPath, JSON.stringify(v2, null, 2), "utf-8");

// ── Summary report ────────────────────────────────────────────────
const totalSubGoals = bigGoals.reduce((n, g) => n + g.subGoals.length, 0);
const totalTasks    = bigGoals.reduce(
  (n, g) => n + g.subGoals.reduce((m, sg) => m + sg.tasks.length, 0),
  0
);

console.log("\n✓ Migration complete");
console.log("─────────────────────────────────");
console.log(`  Output file:              ${outputPath}`);
console.log(`  Big Goals migrated:       ${bigGoals.length}`);
console.log(`  Sub-goals migrated:       ${totalSubGoals}`);
console.log(`  Tasks migrated:           ${totalTasks}`);
console.log(`  Growth Audit preserved:   ✓`);
if (legacyCreativeLog.length > 0) {
  console.log(`  Creative Log (legacy):    ${legacyCreativeLog.length} entries → _legacyCreativeLog`);
}
console.log("─────────────────────────────────\n");
console.log("Next step: Import", outputPath, "in the app, or load it via the Import Data button.\n");
