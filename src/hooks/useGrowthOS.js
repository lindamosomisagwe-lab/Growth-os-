// src/hooks/useGrowthOS.js
// Central data hook for Growth OS v2.
// All state lives in localStorage under "growth_os_v2".
// Every mutation goes through a single `update(fn)` pathway
// so the lastUpdated timestamp is always kept in sync.

import { makeId } from "../utils/id";
import useLocalStorage from "./useLocalStorage";

// ── Default schema ──────────────────────────────────────────────
const DEFAULT_DATA = {
  version: 2,
  meta: {
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  },
  bigGoals: [],
  growthAudit: { career: 0, health: 0, fun: 0 },
};

// ── Timestamp helper ─────────────────────────────────────────────
function stamp(data) {
  return {
    ...data,
    meta: { ...data.meta, lastUpdated: new Date().toISOString() },
  };
}

// ── Hook ────────────────────────────────────────────────────────
export default function useGrowthOS() {
  const [data, setData] = useLocalStorage("growth_os_v2", DEFAULT_DATA);

  // Functional update wrapper — ensures timestamp is always refreshed
  const update = (fn) => setData((prev) => stamp(fn(prev)));

  // ── Big Goals CRUD ─────────────────────────────────────────────

  const addGoal = (fields) =>
    update((prev) => ({
      ...prev,
      bigGoals: [
        ...prev.bigGoals,
        {
          id:          makeId("goal"),
          title:       fields.title       ?? "",
          description: fields.description ?? "",
          dueDate:     fields.dueDate     ?? null,
          category:    fields.category    ?? "other",
          createdAt:   new Date().toISOString(),
          subGoals:    [],
        },
      ],
    }));

  const updateGoal = (goalId, fields) =>
    update((prev) => ({
      ...prev,
      bigGoals: prev.bigGoals.map((g) =>
        g.id === goalId ? { ...g, ...fields } : g
      ),
    }));

  const deleteGoal = (goalId) =>
    update((prev) => ({
      ...prev,
      bigGoals: prev.bigGoals.filter((g) => g.id !== goalId),
    }));

  // ── Sub-goals CRUD ─────────────────────────────────────────────

  const addSubGoal = (goalId, fields) =>
    update((prev) => ({
      ...prev,
      bigGoals: prev.bigGoals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              subGoals: [
                ...g.subGoals,
                {
                  id:        makeId("sg"),
                  goalId,
                  title:     fields.title   ?? "",
                  dueDate:   fields.dueDate ?? null,
                  createdAt: new Date().toISOString(),
                  tasks:     [],
                },
              ],
            }
          : g
      ),
    }));

  const updateSubGoal = (goalId, sgId, fields) =>
    update((prev) => ({
      ...prev,
      bigGoals: prev.bigGoals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              subGoals: g.subGoals.map((sg) =>
                sg.id === sgId ? { ...sg, ...fields } : sg
              ),
            }
          : g
      ),
    }));

  const deleteSubGoal = (goalId, sgId) =>
    update((prev) => ({
      ...prev,
      bigGoals: prev.bigGoals.map((g) =>
        g.id === goalId
          ? { ...g, subGoals: g.subGoals.filter((sg) => sg.id !== sgId) }
          : g
      ),
    }));

  // ── Tasks CRUD ─────────────────────────────────────────────────

  const addTask = (goalId, sgId, fields) =>
    update((prev) => ({
      ...prev,
      bigGoals: prev.bigGoals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              subGoals: g.subGoals.map((sg) =>
                sg.id === sgId
                  ? {
                      ...sg,
                      tasks: [
                        ...sg.tasks,
                        {
                          id:          makeId("task"),
                          subGoalId:   sgId,
                          title:       fields.title   ?? "",
                          cadence:     fields.cadence ?? "once",
                          dueDate:     fields.dueDate ?? null,
                          completed:   false,
                          completedAt: null,
                          createdAt:   new Date().toISOString(),
                          notes:       fields.notes   ?? "",
                        },
                      ],
                    }
                  : sg
              ),
            }
          : g
      ),
    }));

  const updateTask = (goalId, sgId, taskId, fields) =>
    update((prev) => ({
      ...prev,
      bigGoals: prev.bigGoals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              subGoals: g.subGoals.map((sg) =>
                sg.id === sgId
                  ? {
                      ...sg,
                      tasks: sg.tasks.map((t) =>
                        t.id === taskId ? { ...t, ...fields } : t
                      ),
                    }
                  : sg
              ),
            }
          : g
      ),
    }));

  const toggleTask = (goalId, sgId, taskId) =>
    update((prev) => ({
      ...prev,
      bigGoals: prev.bigGoals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              subGoals: g.subGoals.map((sg) =>
                sg.id === sgId
                  ? {
                      ...sg,
                      tasks: sg.tasks.map((t) =>
                        t.id === taskId
                          ? {
                              ...t,
                              completed:   !t.completed,
                              completedAt: !t.completed
                                ? new Date().toISOString()
                                : null,
                            }
                          : t
                      ),
                    }
                  : sg
              ),
            }
          : g
      ),
    }));

  const deleteTask = (goalId, sgId, taskId) =>
    update((prev) => ({
      ...prev,
      bigGoals: prev.bigGoals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              subGoals: g.subGoals.map((sg) =>
                sg.id === sgId
                  ? { ...sg, tasks: sg.tasks.filter((t) => t.id !== taskId) }
                  : sg
              ),
            }
          : g
      ),
    }));

  // ── Growth Audit ───────────────────────────────────────────────

  const updateAudit = (field, value) =>
    update((prev) => ({
      ...prev,
      growthAudit: { ...prev.growthAudit, [field]: Number(value) },
    }));

  // ── Import / Export ────────────────────────────────────────────

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `growth_os_v2_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (imported.version !== 2) {
          alert(
            "This file uses the old v1 schema.\n\nRun the migration script first:\n  npm run migrate your-file.json\n\nThen re-import the output file."
          );
          return;
        }
        setData(imported);
      } catch (err) {
        console.error("Invalid JSON file", err);
        alert("Import failed — the file is not valid JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // allow re-importing the same file
  };

  return {
    data,
    // Goal CRUD
    addGoal,
    updateGoal,
    deleteGoal,
    // Sub-goal CRUD
    addSubGoal,
    updateSubGoal,
    deleteSubGoal,
    // Task CRUD
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    // Audit
    updateAudit,
    // IO
    exportData,
    importData,
  };
}
