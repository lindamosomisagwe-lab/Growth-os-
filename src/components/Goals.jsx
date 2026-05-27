import React, { useState, useEffect } from "react";

const suggestions = {
  career: "Set one career boundary or quarterly plan this week.",
  business: "Outline three simple business workflows today.",
  fun: "Block out two hours for completely unproductive play.",
  creativity: "Dedicate 15 minutes to sketching or pure journaling.",
  health: "Complete a focused 20-minute movement routine.",
  academics: "Extract notes from one informative publication.",
  finance: "Audit weekly expenditure metrics for 10 minutes."
};

function ReflectiveNudges({ onAddGoal }) {
  const [nudges, setNudges] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try {
        const ratings = JSON.parse(saved).wheelOfLife?.ratings || {};
        const lowCategories = Object.keys(ratings).filter(
          cat => ratings[cat] <= 4 && !dismissed.includes(cat) && suggestions[cat]
        );
        setNudges(lowCategories);
      } catch (e) {}
    }
  }, [dismissed]);

  if (nudges.length === 0) return null;

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h3 style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", fontWeight: "800", letterSpacing: "0.08em", textTransform: "uppercase", color: "#888888", fontFamily: "var(--font-mono)" }}>
        [💡 SYSTEM SUGGESTIONS]
      </h3>
      {nudges.map(cat => (
        <div key={cat} className="stationery-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem", marginBottom: "0.75rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span style={{ border: "1px solid #ffffff", color: "#ffffff", padding: "2px 8px", fontSize: "0.7rem", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
              LOW RATINGS // {cat.toUpperCase()}
            </span>
            <p style={{ margin: "0.6rem 0 0 0", fontSize: "0.9rem", color: "#ffffff" }}>{suggestions[cat]}</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => setDismissed(p => [...p, cat])} className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", textTransform: "uppercase" }}>Dismiss</button>
            <button onClick={() => { onAddGoal(suggestions[cat]); setDismissed(p => [...p, cat]); }} className="btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", textTransform: "uppercase" }}>Add</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Goals() {
  const [isMounted, setIsMounted] = useState(false);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.goals) {
          setGoals(parsed.goals.map(g => ({
            ...g,
            sub: (g.sub || []).map(s => ({
              ...s,
              tasks: s.tasks || []
            }))
          })));
        }
      } catch (e) {}
    }
  }, []);

  const [title, setTitle] = useState("");
  const [subInputs, setSubInputs] = useState({});
  const [taskInputs, setTaskInputs] = useState({});
  const [toast, setToast] = useState({ show: false, message: "" });
  
  // Drafting Board State
  const [draftText, setDraftText] = useState("");
  const [isStructuring, setIsStructuring] = useState(false);
  const [previewGoal, setPreviewGoal] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.goals = goals;
    localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
  }, [goals]);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: "" }), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const triggerToast = msg => setToast({ show: true, message: msg });

  // Tier 1: Big Goal Actions
  const addGoal = (customTitle) => {
    const val = typeof customTitle === "string" ? customTitle : title;
    if (!val.trim()) return;
    setGoals(prev => [...prev, { id: Date.now(), title: val.trim(), completed: false, sub: [] }]);
    if (typeof customTitle !== "string") setTitle("");
    triggerToast("OBJECTIVE CREATED // TARGET ACTIVE");
  };

  const handleStructureGoal = () => {
    if (!draftText.trim()) return;
    setIsStructuring(true);
    setPreviewGoal(null);
    
    // Simulate AI parsing delay
    setTimeout(() => {
      setIsStructuring(false);
      setPreviewGoal({
        title: draftText.split('\n')[0].substring(0, 40) + (draftText.length > 40 ? "..." : ""),
        sub: [
          { title: "Define scope and initial requirements", completed: false },
          { title: "Execute core implementation phases", completed: false },
          { title: "Review and finalize deliverables", completed: false }
        ]
      });
    }, 2000);
  };

  const confirmPreview = () => {
    if (!previewGoal) return;
    setGoals(prev => [...prev, {
      id: Date.now(),
      title: previewGoal.title,
      completed: false,
      sub: previewGoal.sub.map((s, idx) => ({ id: Date.now() + idx, title: s.title, completed: false, tasks: [] }))
    }]);
    setDraftText("");
    setPreviewGoal(null);
    triggerToast("STRUCTURED OBJECTIVE ADDED");
  };

  const toggleGoal = id => {
    setGoals(prev => {
      const next = prev.map(g => (g.id === id ? { ...g, completed: !g.completed } : g));
      const target = next.find(g => g.id === id);
      if (target) triggerToast(target.completed ? "OBJECTIVE COMPLETED" : "OBJECTIVE RE-OPENED");
      return next;
    });
  };

  const deleteGoal = id => {
    setGoals(prev => prev.filter(g => g.id !== id));
    triggerToast("OBJECTIVE REMOVED // FILE PURGED");
  };

  // Tier 2: Sub-goal Actions
  const addSub = (goalId) => {
    const text = subInputs[goalId] || "";
    if (!text.trim()) return;
    setGoals(prev => prev.map(g => g.id === goalId ? {
      ...g,
      sub: [...g.sub, { id: Date.now(), title: text.trim(), completed: false, tasks: [] }]
    } : g));
    setSubInputs(prev => ({ ...prev, [goalId]: "" }));
    triggerToast("SUB-GOAL ADDED");
  };

  const toggleSub = (goalId, subId) => {
    setGoals(prev => {
      const next = prev.map(g => g.id === goalId ? {
        ...g,
        sub: g.sub.map(s => s.id === subId ? { ...s, completed: !s.completed } : s)
      } : g);
      const subGoal = next.find(g => g.id === goalId)?.sub.find(s => s.id === subId);
      if (subGoal) triggerToast(subGoal.completed ? "SUB-GOAL COMPLETE" : "SUB-GOAL PENDING");
      return next;
    });
  };

  const deleteSub = (goalId, subId) => {
    setGoals(prev => prev.map(g => g.id === goalId ? {
      ...g,
      sub: g.sub.filter(s => s.id !== subId)
    } : g));
    triggerToast("SUB-GOAL REMOVED");
  };

  // Tier 3: Daily Task Actions
  const addTask = (goalId, subId) => {
    const key = `${goalId}-${subId}`;
    const text = taskInputs[key] || "";
    if (!text.trim()) return;
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          sub: g.sub.map(s => {
            if (s.id === subId) {
              const prevTasks = s.tasks || [];
              return {
                ...s,
                tasks: [...prevTasks, { id: Date.now(), title: text.trim(), completed: false }]
              };
            }
            return s;
          })
        };
      }
      return g;
    }));
    setTaskInputs(prev => ({ ...prev, [key]: "" }));
    triggerToast("DAILY TASK ADDED // TICKER RUNNING");
  };

  const toggleTask = (goalId, subId, taskId) => {
    setGoals(prev => {
      const next = prev.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            sub: g.sub.map(s => {
              if (s.id === subId) {
                const prevTasks = s.tasks || [];
                return {
                  ...s,
                  tasks: prevTasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
                };
              }
              return s;
            })
          };
        }
        return g;
      });
      const t = next.find(g => g.id === goalId)?.sub.find(s => s.id === subId)?.tasks?.find(t => t.id === taskId);
      if (t) triggerToast(t.completed ? "TASK LOGGED" : "TASK RETURNED");
      return next;
    });
  };

  const deleteTask = (goalId, subId, taskId) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          sub: g.sub.map(s => {
            if (s.id === subId) {
              const prevTasks = s.tasks || [];
              return {
                ...s,
                tasks: prevTasks.filter(t => t.id !== taskId)
              };
            }
            return s;
          })
        };
      }
      return g;
    }));
    triggerToast("TASK REMOVED");
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div style={{ color: "#ffffff", fontFamily: "var(--font-sans)" }}>
      <header style={{ marginBottom: "2rem", borderBottom: "1px solid #222222", paddingBottom: "1rem" }}>
        <h2 style={{ margin: "0", fontSize: "1.6rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "-0.03em", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span>🎯</span> Objectives &amp; Task Hierarchies
        </h2>
        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#888888", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          TIER 1 (BIG GOAL) // TIER 2 (SUB-GOAL) // TIER 3 (DAILY TASK)
        </p>
      </header>

      <ReflectiveNudges onAddGoal={addGoal} />

      {/* Drafting Board */}
      <div style={{ marginBottom: "2rem", padding: "1.5rem", background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Drafting Board
        </h3>
        <p style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Dump your unfiltered thoughts below. Our AI will extract a structured SMART goal hierarchy.
        </p>
        <textarea
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder="I want to launch a new podcast about design by next month, including 3 episodes..."
          style={{ width: "100%", height: "100px", resize: "vertical", marginBottom: "1rem" }}
        />
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button 
            onClick={handleStructureGoal} 
            className={`btn-primary ${isStructuring ? "loading-glow" : ""}`}
            disabled={isStructuring || !draftText.trim()}
          >
            {isStructuring ? "Structuring..." : "Structure Goal"}
          </button>
        </div>

        {/* AI Preview Card */}
        {previewGoal && (
          <div style={{ marginTop: "1.5rem", padding: "1.5rem", border: "1px dashed var(--text-primary)", background: "var(--bg-page)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>[PREVIEW]</span>
                <h4 style={{ margin: "0.5rem 0", fontSize: "1.2rem", fontWeight: "800", textTransform: "uppercase" }}>{previewGoal.title}</h4>
              </div>
              <button onClick={confirmPreview} className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>Confirm & Add</button>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {previewGoal.sub.map((s, i) => (
                <li key={i} style={{ fontSize: "0.9rem", color: "var(--text-secondary)", padding: "0.25rem 0" }}>
                  - {s.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Main Big Goal Input */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="ENTER NEW CORE OBJECTIVE (TIER 1)..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addGoal()}
          style={{ flex: 1, padding: "0.8rem 1rem", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.02em" }}
        />
        <button onClick={() => addGoal()} className="btn-secondary" style={{ padding: "0.8rem 1.6rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Add Manually
        </button>
      </div>

      <div style={{ overflowY: "auto", maxHeight: "550px", paddingRight: "0.5rem" }}>
        {goals.length === 0 ? (
          <p style={{ fontStyle: "italic", textAlign: "center", color: "#888888", padding: "3rem", border: "1px dashed #222222", fontSize: "0.9rem" }}>
            NO ACTIVE GOALS DETECTED. INITIALIZE A TARGET STRATEGY AT THE TOP.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {goals.map((g, gIdx) => (
              <li key={g.id} style={{ background: "#0a0a0a", padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid #222222" }}>
                {/* Tier 1 Big Goal Item */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={g.completed}
                      onChange={() => toggleGoal(g.id)}
                      style={{ width: "1.2rem", height: "1.2rem", cursor: "pointer" }}
                    />
                    <span style={{
                      fontSize: "1.1rem",
                      fontWeight: "800",
                      textTransform: "uppercase",
                      letterSpacing: "-0.01em",
                      textDecoration: g.completed ? "line-through" : "none",
                      color: g.completed ? "#444444" : "#ffffff"
                    }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "#888888", marginRight: "0.5rem" }}>
                        [{String(gIdx + 1).padStart(2, '0')}]
                      </span>
                      {g.title}
                    </span>
                  </label>
                  <button
                    onClick={() => deleteGoal(g.id)}
                    style={{ background: "none", border: "none", color: "#444444", cursor: "pointer", fontSize: "1.1rem" }}
                    title="Remove Objective"
                  >
                    ✕
                  </button>
                </div>

                {/* Tier 2 Sub-goals Container */}
                <div style={{ paddingLeft: "1.2rem", borderLeft: "1px solid #222222", marginLeft: "0.6rem" }}>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {(g.sub || []).map(s => {
                      const taskKey = `${g.id}-${s.id}`;
                      return (
                        <li key={s.id} style={{ marginBottom: "1rem", borderBottom: "1px dashed #111111", paddingBottom: "1rem" }}>
                          {/* Tier 2 Item */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", flex: 1 }}>
                              <input
                                type="checkbox"
                                checked={s.completed}
                                onChange={() => toggleSub(g.id, s.id)}
                                style={{ width: "1rem", height: "1rem", cursor: "pointer" }}
                              />
                              <span style={{
                                fontWeight: "600",
                                fontSize: "0.95rem",
                                textDecoration: s.completed ? "line-through" : "none",
                                color: s.completed ? "#444444" : "#ffffff"
                              }}>
                                {s.title}
                              </span>
                            </label>
                            <button
                              onClick={() => deleteSub(g.id, s.id)}
                              style={{ background: "none", border: "none", color: "#444444", cursor: "pointer", fontSize: "0.9rem" }}
                              title="Remove Sub-goal"
                            >
                              ✕
                            </button>
                          </div>

                          {/* Tier 3 Daily Tasks Container */}
                          <div style={{ paddingLeft: "1.2rem", borderLeft: "1px dashed #333333", marginLeft: "0.5rem", marginTop: "0.5rem" }}>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                              {(s.tasks || []).map(t => (
                                <li key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.25rem 0" }}>
                                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", flex: 1 }}>
                                    <input
                                      type="checkbox"
                                      checked={t.completed}
                                      onChange={() => toggleTask(g.id, s.id, t.id)}
                                      style={{ width: "0.85rem", height: "0.85rem", cursor: "pointer" }}
                                    />
                                    <span style={{
                                      fontFamily: "var(--font-mono)",
                                      fontSize: "0.8rem",
                                      textDecoration: t.completed ? "line-through" : "none",
                                      color: t.completed ? "#444444" : "#888888"
                                    }}>
                                      {t.title}
                                    </span>
                                  </label>
                                  <button
                                    onClick={() => deleteTask(g.id, s.id, t.id)}
                                    style={{ background: "none", border: "none", color: "#333333", cursor: "pointer", fontSize: "0.8rem" }}
                                    title="Remove Daily Task"
                                  >
                                    ✕
                                  </button>
                                </li>
                              ))}
                            </ul>

                            {/* Add Tier 3 Task Input */}
                            <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.5rem" }}>
                              <input
                                type="text"
                                placeholder="Add daily action..."
                                value={taskInputs[taskKey] || ""}
                                onChange={e => setTaskInputs(p => ({ ...p, [taskKey]: e.target.value }))}
                                onKeyDown={e => e.key === "Enter" && addTask(g.id, s.id)}
                                style={{ flex: 1, padding: "0.3rem 0.5rem !important", fontSize: "0.8rem", background: "#050505" }}
                              />
                              <button
                                onClick={() => addTask(g.id, s.id)}
                                className="btn-primary"
                                style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", textTransform: "uppercase" }}
                              >
                                + Task
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Add Tier 2 Sub-goal Input */}
                  <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem" }}>
                    <input
                      type="text"
                      placeholder="Add strategic sub-goal (Tier 2)..."
                      value={subInputs[g.id] || ""}
                      onChange={e => setSubInputs(p => ({ ...p, [g.id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && addSub(g.id)}
                      style={{ flex: 1, padding: "0.4rem 0.6rem !important", fontSize: "0.85rem" }}
                    />
                    <button
                      onClick={() => addSub(g.id)}
                      className="btn-secondary"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", textTransform: "uppercase" }}
                    >
                      + Sub-Goal
                    </button>
                  </div>
                </div>

                {/* SMART Goal Progress Bar */}
                {(() => {
                  const totalSub = g.sub?.length || 0;
                  const completedSub = g.sub?.filter(s => s.completed).length || 0;
                  const progressPercent = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;
                  return (
                    <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                        <span>SMART PROGRESS</span>
                        <span>{progressPercent}% ({completedSub}/{totalSub})</span>
                      </div>
                      <div style={{ width: "100%", height: "4px", background: "var(--border-color)", borderRadius: "0px" }}>
                        <div style={{ width: `${progressPercent}%`, height: "100%", background: "var(--text-primary)", transition: "width 0.3s ease" }}></div>
                      </div>
                    </div>
                  );
                })()}
              </li>
            ))}
          </ul>
        )}
      </div>

      {toast.show && <div className="toast-notification"><span>⚡</span> {toast.message}</div>}
    </div>
  );
}
