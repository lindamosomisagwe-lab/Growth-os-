import React, { useState, useEffect } from "react";

// ── Empty State component ──────────────────────────────────────────────────────
function EmptyState({ icon, hook, cta, onCta }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.25rem", padding: "3.5rem 2rem", border: "1px dashed var(--border-color)", textAlign: "center" }}>
      <div style={{ fontSize: "2.5rem", opacity: 0.5 }}>{icon}</div>
      <p style={{ margin: 0, fontSize: "1rem", color: "var(--text-secondary)", fontStyle: "italic", maxWidth: "320px", lineHeight: 1.6 }}>
        {hook}
      </p>
      <button onClick={onCta} className="btn-primary" style={{ padding: "0.65rem 1.5rem", fontSize: "0.82rem", letterSpacing: "0.04em" }}>
        {cta}
      </button>
    </div>
  );
}

function dispatchSave() { window.dispatchEvent(new Event("growth_os_save")); }

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
        const lowCats = Object.keys(ratings).filter(cat => ratings[cat] <= 4 && !dismissed.includes(cat) && suggestions[cat]);
        setNudges(lowCats);
      } catch (e) {}
    }
  }, [dismissed]);
  if (nudges.length === 0) return null;
  return (
    <div style={{ marginBottom: "2rem" }}>
      <h3 style={{ margin: "0 0 1rem 0", fontSize: "0.82rem", fontWeight: "800", letterSpacing: "0.08em", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>[SYSTEM SUGGESTIONS]</h3>
      {nudges.map(cat => (
        <div key={cat} className="stationery-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem", marginBottom: "0.75rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span style={{ border: "1px solid var(--border-color)", color: "var(--text-body)", padding: "2px 8px", fontSize: "0.7rem", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
              Low Rating // {cat.toUpperCase()}
            </span>
            <p style={{ margin: "0.6rem 0 0 0", fontSize: "0.9rem", color: "var(--text-primary)" }}>{suggestions[cat]}</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => setDismissed(p => [...p, cat])} className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}>Dismiss</button>
            <button onClick={() => { onAddGoal(suggestions[cat]); setDismissed(p => [...p, cat]); }} className="btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}>Add</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── AI Preview Card: editable tier structure ───────────────────────────────────
function AIPreviewCard({ previewGoal, onConfirm, onEdit }) {
  const [localGoal, setLocalGoal] = useState(previewGoal);

  const updateTitle = (val) => setLocalGoal(prev => ({ ...prev, title: val }));
  const updateSub = (i, val) => setLocalGoal(prev => ({
    ...prev,
    sub: prev.sub.map((s, idx) => idx === i ? { ...s, title: val } : s)
  }));

  return (
    <div style={{ marginTop: "1.5rem", padding: "1.5rem", border: "1px dashed var(--border-color-active)", background: "var(--bg-surface)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", fontWeight: "700" }}>[FINALIZED STRUCTURE — EDIT BEFORE SAVING]</span>
          <div style={{ marginTop: "0.75rem" }}>
            <label style={{ display: "block", fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: "0.3rem", letterSpacing: "0.05em" }}>TIER 1 — MAIN GOAL</label>
            <input
              type="text"
              value={localGoal.title}
              onChange={e => updateTitle(e.target.value)}
              style={{ width: "100%", fontWeight: "700", fontSize: "1rem" }}
            />
          </div>
        </div>
        <button onClick={() => onConfirm(localGoal)} className="btn-primary" style={{ padding: "0.6rem 1.2rem", fontSize: "0.8rem", alignSelf: "flex-end" }}>
          Confirm & Save
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {localGoal.sub.map((s, i) => (
          <div key={i} style={{ padding: "0.75rem 1rem", border: "1px solid var(--border-color)", background: "var(--bg-page)" }}>
            <label style={{ display: "block", fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: "0.3rem", letterSpacing: "0.05em" }}>
              TIER {i + 2} — {i === 0 ? "SUB-GOAL" : i === 1 ? "MILESTONE" : "ACTION STEP"}
            </label>
            <input
              type="text"
              value={s.title}
              onChange={e => updateSub(i, e.target.value)}
              style={{ width: "100%", fontSize: "0.88rem" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Animated loading dots ─────────────────────────────────────────────────────
function ThinkingDots() {
  return (
    <div className="chat-bubble chat-bubble-assistant" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0.75rem 0" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-secondary)", marginRight: "0.5rem" }}>Architect</span>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          display: "inline-block", width: "8px", height: "8px",
          borderRadius: "50%", background: "var(--text-secondary)",
          animation: `thinkBounce 1.2s ${i * 0.2}s infinite ease-in-out`
        }} />
      ))}
      <style>{`@keyframes thinkBounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }`}</style>
    </div>
  );
}

// ── Goals main component ───────────────────────────────────────────────────────
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
          setGoals(parsed.goals.map(g => ({ ...g, sub: (g.sub || []).map(s => ({ ...s, tasks: s.tasks || [] })) })));
        }
      } catch (e) {}
    }
  }, []);

  const [title, setTitle] = useState("");
  const [subInputs, setSubInputs] = useState({});
  const [taskInputs, setTaskInputs] = useState({});
  const [toast, setToast] = useState({ show: false, message: "" });
  const [bouncingTasks, setBouncingTasks] = useState(new Set());

  // Goal Architect state
  const [draftText, setDraftText] = useState("");
  const [isStructuring, setIsStructuring] = useState(false);
  const [previewGoal, setPreviewGoal] = useState(null);
  const [goalDraftingStage, setGoalDraftingStage] = useState("idle");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", text: "What's on your mind? Dump your raw thought here and we'll figure out a plan together." }
  ]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.goals = goals;
    localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
    dispatchSave();
  }, [goals]);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: "" }), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const triggerToast = msg => setToast({ show: true, message: msg });

  const addGoal = (customTitle) => {
    const val = typeof customTitle === "string" ? customTitle : title;
    if (!val.trim()) return;
    setGoals(prev => [...prev, { id: Date.now(), title: val.trim(), completed: false, sub: [] }]);
    if (typeof customTitle !== "string") setTitle("");
    setShowForm(false);
    triggerToast("Objective Created // Target Active");
  };

  const handleSkipCoaching = () => {
    setDraftText(""); setIsStructuring(false);
    setGoalDraftingStage("finalized");
    setPreviewGoal({ title: "New Goal", sub: [{ title: "Define the vision", completed: false }, { title: "First step", completed: false }, { title: "Review progress", completed: false }] });
    setChatHistory(prev => [...prev, { role: "assistant", text: "Got it. Jumping straight to the structure!" }]);
  };

  const handleSendMessage = () => {
    if (!draftText.trim() || isStructuring) return;
    const lowerTxt = draftText.toLowerCase();
    if (lowerTxt.includes("build it") || lowerTxt.includes("that's enough") || lowerTxt.includes("i'm done") || lowerTxt === "skip") {
      handleSkipCoaching(); return;
    }
    const userMsg = { role: "user", text: draftText };
    setChatHistory(prev => [...prev, userMsg]);
    setDraftText(""); setIsStructuring(true);
    if (goalDraftingStage === "idle") setGoalDraftingStage("coaching");
    setTimeout(() => {
      setIsStructuring(false);
      setChatHistory(prev => {
        const histLength = prev.length;
        if (histLength === 2) return [...prev, { role: "assistant", text: "That sounds like a great direction. What does success look like for this?\n\n(Question 1 of 5)" }];
        if (histLength === 4) return [...prev, { role: "assistant", text: "Love that vision. When would you love to see this happen by?\n\n(Question 2 of 5)" }];
        if (histLength === 6) return [...prev, { role: "assistant", text: "What's the very first, smallest step you can take today?\n\n(Question 3 of 5)" }];
        if (histLength === 8) return [...prev, { role: "assistant", text: "And how will we measure progress along the way?\n\n(Question 4 of 5)" }];
        if (histLength === 10) return [...prev, { role: "assistant", text: "Finally, why is this goal relevant to your long-term growth?\n\n(Question 5 of 5)" }];
        setGoalDraftingStage("finalized");
        setPreviewGoal({ title: prev[1].text.split("\n")[0].substring(0, 50), sub: [{ title: "Define the vision", completed: false }, { title: "First step", completed: false }, { title: "Review progress", completed: false }] });
        return [...prev, { role: "assistant", text: "Awesome. I've mapped this out below. Edit each tier before saving." }];
      });
    }, 1500);
  };

  const confirmPreview = (editedGoal) => {
    if (!editedGoal) return;
    setGoals(prev => [...prev, { id: Date.now(), title: editedGoal.title, completed: false, sub: editedGoal.sub.map((s, idx) => ({ id: Date.now() + idx, title: s.title, completed: false, tasks: [] })) }]);
    setDraftText(""); setPreviewGoal(null); setGoalDraftingStage("idle");
    setChatHistory([{ role: "assistant", text: "What's on your mind? Dump your raw thought here and we'll figure out a plan together." }]);
    triggerToast("STRUCTURED OBJECTIVE ADDED");
  };

  const toggleGoal = id => {
    setGoals(prev => {
      const next = prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
      const target = next.find(g => g.id === id);
      if (target) triggerToast(target.completed ? "Objective Completed" : "Objective Re-opened");
      return next;
    });
  };
  const deleteGoal = id => { setGoals(prev => prev.filter(g => g.id !== id)); triggerToast("Objective Removed"); };
  const addSub = (goalId) => {
    const text = subInputs[goalId] || "";
    if (!text.trim()) return;
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, sub: [...g.sub, { id: Date.now(), title: text.trim(), completed: false, tasks: [] }] } : g));
    setSubInputs(prev => ({ ...prev, [goalId]: "" }));
    triggerToast("Sub-goal Added");
  };
  const toggleSub = (goalId, subId) => {
    setGoals(prev => {
      const next = prev.map(g => g.id === goalId ? { ...g, sub: g.sub.map(s => s.id === subId ? { ...s, completed: !s.completed } : s) } : g);
      const sub = next.find(g => g.id === goalId)?.sub.find(s => s.id === subId);
      if (sub) triggerToast(sub.completed ? "Sub-goal Complete" : "Sub-goal Pending");
      return next;
    });
  };
  const deleteSub = (goalId, subId) => { setGoals(prev => prev.map(g => g.id === goalId ? { ...g, sub: g.sub.filter(s => s.id !== subId) } : g)); triggerToast("Sub-goal Removed"); };
  const addTask = (goalId, subId) => {
    const key = `${goalId}-${subId}`;
    const text = taskInputs[key] || "";
    if (!text.trim()) return;
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, sub: g.sub.map(s => s.id === subId ? { ...s, tasks: [...(s.tasks || []), { id: Date.now(), title: text.trim(), completed: false }] } : s) } : g));
    setTaskInputs(prev => ({ ...prev, [key]: "" }));
    triggerToast("Daily Task Added");
  };
  const toggleTask = (goalId, subId, taskId) => {
    setGoals(prev => {
      const g = prev.find(g => g.id === goalId);
      const t = g?.sub.find(s => s.id === subId)?.tasks?.find(t => t.id === taskId);
      if (t && !t.completed) {
        setBouncingTasks(p => new Set(p).add(taskId));
        setTimeout(() => {
          setBouncingTasks(p => { const s = new Set(p); s.delete(taskId); return s; });
          setGoals(prev2 => prev2.map(g2 => g2.id === goalId ? { ...g2, sub: g2.sub.map(s2 => s2.id === subId ? { ...s2, tasks: s2.tasks.map(t2 => t2.id === taskId ? { ...t2, completed: true } : t2) } : s2) } : g2));
          triggerToast("Task Logged");
        }, 200);
        return prev;
      }
      return prev.map(g2 => g2.id === goalId ? { ...g2, sub: g2.sub.map(s2 => s2.id === subId ? { ...s2, tasks: s2.tasks.map(t2 => t2.id === taskId ? { ...t2, completed: false } : t2) } : s2) } : g2);
    });
  };
  const deleteTask = (goalId, subId, taskId) => { setGoals(prev => prev.map(g => g.id === goalId ? { ...g, sub: g.sub.map(s => s.id === subId ? { ...s, tasks: (s.tasks || []).filter(t => t.id !== taskId) } : s) } : g)); triggerToast("Task Removed"); };

  if (!isMounted) return null;

  return (
    <div style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
      <header style={{ marginBottom: "2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
        <h2 style={{ margin: "0", fontSize: "1.6rem", fontWeight: "800", letterSpacing: "-0.03em" }}>Objectives & Task Hierarchies</h2>
        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
          Tier 1 (Big Goal) // Tier 2 (Sub-Goal) // Tier 3 (Daily Task)
        </p>
      </header>

      <ReflectiveNudges onAddGoal={addGoal} />

      {/* Goal Architect */}
      <div style={{ marginBottom: "2rem", padding: "1.5rem", background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: "800", letterSpacing: "0.02em" }}>Goal Architect</h3>
        <div className="chat-container">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"}`}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                {msg.role === "user" ? "You" : "Architect"}
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
            </div>
          ))}
          {isStructuring && <ThinkingDots />}
        </div>

        {goalDraftingStage !== "finalized" && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", maxWidth: "650px", margin: "0 auto" }}>
            <textarea
              value={draftText}
              onChange={e => setDraftText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              placeholder={goalDraftingStage === "idle" ? "I want to start a podcast…" : "Type your answer…"}
              style={{ flex: 1, height: "60px", resize: "vertical" }}
            />
            <button onClick={handleSendMessage} className="btn-primary" disabled={isStructuring || !draftText.trim()} style={{ height: "60px", padding: "0 1.5rem" }}>
              Send
            </button>
            <button onClick={handleSkipCoaching} className="btn-secondary" disabled={isStructuring} style={{ height: "60px", padding: "0 1.25rem", fontSize: "0.82rem" }}>
              Add manually instead
            </button>
          </div>
        )}

        {/* Editable AI Preview Card */}
        {previewGoal && goalDraftingStage === "finalized" && (
          <AIPreviewCard previewGoal={previewGoal} onConfirm={confirmPreview} />
        )}
      </div>

      {/* Quick add bar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Enter new core objective (Tier 1)…"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addGoal()}
          style={{ flex: 1, padding: "0.8rem 1rem", fontSize: "0.9rem" }}
        />
        <button onClick={() => addGoal()} className="btn-secondary" style={{ padding: "0.8rem 1.6rem", fontSize: "0.85rem" }}>
          Add Manually
        </button>
      </div>

      {/* Goals list */}
      <div style={{ overflowY: "auto", maxHeight: "550px", paddingRight: "0.5rem" }}>
        {goals.length === 0 ? (
          <EmptyState
            icon="🎯"
            hook="What are you building toward? Every great journey starts with a single intention."
            cta="Set Your First Goal"
            onCta={() => document.querySelector("textarea.chat-textarea, textarea")?.focus()}
          />
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {goals.map((g, gIdx) => (
              <li key={g.id} style={{ background: "var(--bg-surface)", padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", flex: 1 }}>
                    <input type="checkbox" checked={g.completed} onChange={() => toggleGoal(g.id)} style={{ width: "1.2rem", height: "1.2rem" }} />
                    <span style={{ fontSize: "1.1rem", fontWeight: "800", letterSpacing: "-0.01em", textDecoration: g.completed ? "line-through" : "none", color: g.completed ? "var(--text-secondary)" : "var(--text-primary)" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--text-secondary)", marginRight: "0.5rem" }}>[{String(gIdx + 1).padStart(2, "0")}]</span>
                      {g.title}
                    </span>
                  </label>
                  <button onClick={() => deleteGoal(g.id)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
                </div>
                <div style={{ paddingLeft: "1.2rem", borderLeft: "1px solid var(--border-color)", marginLeft: "0.6rem" }}>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {(g.sub || []).map(s => {
                      const taskKey = `${g.id}-${s.id}`;
                      return (
                        <li key={s.id} style={{ marginBottom: "1rem", borderBottom: "1px dashed var(--border-color)", paddingBottom: "1rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", flex: 1 }}>
                              <input type="checkbox" checked={s.completed} onChange={() => toggleSub(g.id, s.id)} style={{ width: "1rem", height: "1rem" }} />
                              <span style={{ fontWeight: "600", fontSize: "0.95rem", textDecoration: s.completed ? "line-through" : "none", color: s.completed ? "var(--text-secondary)" : "var(--text-primary)" }}>{s.title}</span>
                            </label>
                            <button onClick={() => deleteSub(g.id, s.id)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.9rem" }}>✕</button>
                          </div>
                          <div style={{ paddingLeft: "1.2rem", borderLeft: "1px dashed var(--border-color)", marginLeft: "0.5rem", marginTop: "0.5rem" }}>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                              {(s.tasks || []).map(t => (
                                <li key={t.id} className={bouncingTasks.has(t.id) ? "task-completed-bounce" : ""} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.25rem 0" }}>
                                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", flex: 1 }}>
                                    <input type="checkbox" checked={t.completed} onChange={() => toggleTask(g.id, s.id, t.id)} style={{ width: "0.85rem", height: "0.85rem" }} />
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", textDecoration: t.completed ? "line-through" : "none", color: t.completed ? "var(--text-secondary)" : "var(--text-body)" }}>{t.title}</span>
                                  </label>
                                  <button onClick={() => deleteTask(g.id, s.id, t.id)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.8rem" }}>✕</button>
                                </li>
                              ))}
                            </ul>
                            <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.5rem" }}>
                              <input type="text" placeholder="Add daily action…" value={taskInputs[taskKey] || ""} onChange={e => setTaskInputs(p => ({ ...p, [taskKey]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addTask(g.id, s.id)} style={{ flex: 1, fontSize: "0.8rem" }} />
                              <button onClick={() => addTask(g.id, s.id)} className="btn-primary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}>+ Task</button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem" }}>
                    <input type="text" placeholder="Add strategic sub-goal (Tier 2)…" value={subInputs[g.id] || ""} onChange={e => setSubInputs(p => ({ ...p, [g.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addSub(g.id)} style={{ flex: 1, fontSize: "0.85rem" }} />
                    <button onClick={() => addSub(g.id)} className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>+ Sub-Goal</button>
                  </div>
                </div>
                {(() => {
                  const totalSub = g.sub?.length || 0;
                  const completedSub = g.sub?.filter(s => s.completed).length || 0;
                  const progressPercent = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;
                  return (
                    <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                        <span>Progress</span><span>{progressPercent}% ({completedSub}/{totalSub})</span>
                      </div>
                      <div style={{ width: "100%", height: "3px", background: "rgba(0,0,0,0.08)" }}>
                        <div style={{ width: `${progressPercent}%`, height: "100%", background: "var(--accent-gold)", transition: "width 0.3s ease", boxShadow: "0 0 6px rgba(201,168,76,0.4)" }} />
                      </div>
                    </div>
                  );
                })()}
              </li>
            ))}
          </ul>
        )}
      </div>

      {toast.show && <div className="toast-notification">{toast.message}</div>}
    </div>
  );
}
