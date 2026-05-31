import React, { useState, useEffect } from "react";
import { useGamification } from "../contexts/GamificationContext";
import GoalCompleteSequence from "./GoalCompleteSequence";
import { Link } from "react-router-dom";

function dispatchSave() { window.dispatchEvent(new Event("growth_os_save")); }

export default function Goals() {
  const { awardXP } = useGamification();
  const [epicSequence, setEpicSequence] = useState(null);

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.goals) return parsed.goals;
      } catch (e) {}
    }
    return [];
  });

  const [toast, setToast] = useState({ show: false, message: "" });
  const [expandedGoalId, setExpandedGoalId] = useState(null);
  const [expandedStepId, setExpandedStepId] = useState(null);

  // Fallback builder state
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderData, setBuilderData] = useState({ bigGoal: "", firstStep: "", firstTask: "" });

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.goals = goals;
    localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
    dispatchSave();
  }, [goals]);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const triggerToast = (msg) => setToast({ show: true, message: msg });

  const handleSaveBuilder = () => {
    if (!builderData.bigGoal.trim()) return;
    
    const newGoal = {
      id: Date.now(),
      title: builderData.bigGoal.trim(),
      completed: false,
      pinned: false,
      subgoals: builderData.firstStep.trim() ? [{
        id: Date.now() + 1,
        title: builderData.firstStep.trim(),
        completed: false,
        tasks: builderData.firstTask.trim() ? [{
          id: Date.now() + 2,
          title: builderData.firstTask.trim(),
          completed: false
        }] : []
      }] : []
    };
    
    setGoals(prev => [newGoal, ...prev]);
    setShowBuilder(false);
    setBuilderData({ bigGoal: "", firstStep: "", firstTask: "" });
  };

  const toggleGoal = async (id) => {
    let targetGoal;
    setGoals(prev => {
      const target = prev.find(g => g.id === id);
      targetGoal = target;
      return prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
    });

    if (targetGoal && !targetGoal.completed) {
      const res = await awardXP(`goal_complete_${id}`);
      if (res && res.xpAwarded > 0) {
        setEpicSequence({ result: { ...res, goal: { text: targetGoal.title } } });
      } else {
        triggerToast(`🎉 You did it. ${targetGoal.title} — complete.`);
      }
    }
  };

  const togglePin = (id) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, pinned: !g.pinned } : g));
  };

  const deleteGoal = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const toggleStep = async (goalId, stepId) => {
    let isCompleting = false;
    let targetStep;
    setGoals(prev => prev.map(g => g.id === goalId ? {
      ...g,
      subgoals: g.subgoals.map(s => {
        if (s.id === stepId) {
          isCompleting = !s.completed;
          targetStep = s;
          return { ...s, completed: !s.completed };
        }
        return s;
      })
    } : g));

    if (isCompleting) {
      const res = await awardXP(`step_complete_${stepId}`);
      if (res && res.xpAwarded > 0) {
        triggerToast(`🎯 Step complete — ${targetStep?.title} (+${res.xpAwarded} XP${res.isBonus ? ' ⚡' : ''})`);
      }
    }
  };

  const deleteStep = (goalId, stepId) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, subgoals: g.subgoals.filter(s => s.id !== stepId) } : g));
  };

  const addStep = (goalId, title) => {
    if (!title.trim()) return;
    setGoals(prev => prev.map(g => g.id === goalId ? {
      ...g,
      subgoals: [...(g.subgoals || []), { id: Date.now(), title: title.trim(), completed: false, tasks: [] }]
    } : g));
  };

  const toggleTask = async (goalId, stepId, taskId) => {
    let isCompleting = false;
    setGoals(prev => prev.map(g => g.id === goalId ? {
      ...g,
      subgoals: g.subgoals.map(s => s.id === stepId ? {
        ...s,
        tasks: s.tasks.map(t => {
          if (t.id === taskId) {
            isCompleting = !t.completed;
            return { ...t, completed: !t.completed };
          }
          return t;
        })
      } : s)
    } : g));

    if (isCompleting) {
      await awardXP(`task_complete_${taskId}`);
    }
  };

  const deleteTask = (goalId, stepId, taskId) => {
    setGoals(prev => prev.map(g => g.id === goalId ? {
      ...g,
      subgoals: g.subgoals.map(s => s.id === stepId ? { ...s, tasks: s.tasks.filter(t => t.id !== taskId) } : s)
    } : g));
  };

  const addTask = (goalId, stepId, title) => {
    if (!title.trim()) return;
    setGoals(prev => prev.map(g => g.id === goalId ? {
      ...g,
      subgoals: g.subgoals.map(s => s.id === stepId ? {
        ...s,
        tasks: [...(s.tasks || []), { id: Date.now(), title: title.trim(), completed: false }]
      } : s)
    } : g));
  };

  return (
    <div style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)", maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem" }}>
      
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ margin: "0", fontSize: "2rem", fontWeight: "400", letterSpacing: "-0.02em" }}>Goals</h2>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.95rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
            Break it down. Step by step.
          </p>
        </div>
        <Link to="/journey" className="btn-secondary" style={{ textDecoration: "none" }}>My Journey →</Link>
      </header>

      {epicSequence && (
        <GoalCompleteSequence 
          result={epicSequence.result} 
          onClose={() => setEpicSequence(null)} 
        />
      )}

      {/* Goal Builder / Fallback */}
      <div style={{ marginBottom: "2.5rem" }}>
        {!showBuilder ? (
          <button onClick={() => setShowBuilder(true)} className="btn-primary" style={{ padding: "0.8rem 1.5rem", fontSize: "0.95rem", width: "100%", borderStyle: "dashed" }}>
            + Help me set a goal
          </button>
        ) : (
          <div className="stationery-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "600" }}>What do you want to achieve?</h3>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)", fontStyle: "italic", marginTop: "-1rem" }}>Don't overthink it — just describe it in your own words.</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>1. The Big Goal</label>
                <input type="text" placeholder="e.g. Run a 5k" value={builderData.bigGoal} onChange={e => setBuilderData(p => ({ ...p, bigGoal: e.target.value }))} style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>2. First Step (Milestone)</label>
                <input type="text" placeholder="e.g. Get running shoes" value={builderData.firstStep} onChange={e => setBuilderData(p => ({ ...p, firstStep: e.target.value }))} style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>3. First Task (Action)</label>
                <input type="text" placeholder="e.g. Look up shoes online for 10 mins today" value={builderData.firstTask} onChange={e => setBuilderData(p => ({ ...p, firstTask: e.target.value }))} style={{ width: "100%" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <button onClick={handleSaveBuilder} className="btn-primary" style={{ flex: 1, padding: "0.8rem" }}>Save</button>
              <button onClick={() => setShowBuilder(false)} className="btn-secondary" style={{ flex: 1, padding: "0.8rem" }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Accordion List */}
      <div>
        {goals.map(goal => {
          const isExpanded = expandedGoalId === goal.id;
          const totalTasks = goal.subgoals?.reduce((acc, step) => acc + (step.tasks?.length || 0), 0) || 0;
          const completedTasks = goal.subgoals?.reduce((acc, step) => acc + (step.tasks?.filter(t => t.completed).length || 0), 0) || 0;
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          
          let nextTask = null;
          if (!goal.completed && goal.subgoals) {
            for (const step of goal.subgoals) {
              if (step.tasks) {
                const pending = step.tasks.find(t => !t.completed);
                if (pending) {
                  nextTask = pending.title;
                  break;
                }
              }
            }
          }

          return (
            <div key={goal.id} className="stationery-card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
              
              {/* Big Goal Header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                <input type="checkbox" checked={goal.completed} onChange={() => toggleGoal(goal.id)} style={{ width: "1.2rem", height: "1.2rem", marginTop: "0.2rem" }} />
                
                <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}>
                  <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem", fontWeight: "600", textDecoration: goal.completed ? "line-through" : "none", color: goal.completed ? "var(--text-secondary)" : "var(--text-primary)" }}>
                    {goal.title}
                  </h3>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                    <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ width: `${progress}%`, height: "100%", background: "var(--accent)" }} />
                    </div>
                    <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{progress}%</span>
                  </div>
                  
                  {nextTask && !isExpanded && (
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      <span style={{ fontStyle: "italic", opacity: 0.7 }}>Next task:</span> {nextTask}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => togglePin(goal.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", opacity: goal.pinned ? 1 : 0.3 }} title="Pin to Home">
                    📌
                  </button>
                  <button onClick={() => deleteGoal(goal.id)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.1rem" }}>
                    ✕
                  </button>
                </div>
              </div>

              {/* Expanded: Steps */}
              {isExpanded && (
                <div style={{ marginTop: "1.5rem", paddingLeft: "2.2rem", borderLeft: "2px solid rgba(255,255,255,0.05)" }}>
                  
                  <h4 style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>Steps</h4>
                  
                  {(goal.subgoals || []).map(step => {
                    const isStepExpanded = expandedStepId === step.id;
                    return (
                      <div key={step.id} style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <input type="checkbox" checked={step.completed} onChange={() => toggleStep(goal.id, step.id)} style={{ width: "1rem", height: "1rem" }} />
                          <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setExpandedStepId(isStepExpanded ? null : step.id)}>
                            <span style={{ fontSize: "1rem", fontWeight: "500", textDecoration: step.completed ? "line-through" : "none", color: step.completed ? "var(--text-secondary)" : "var(--text-primary)" }}>
                              {step.title}
                            </span>
                          </div>
                          <button onClick={() => deleteStep(goal.id, step.id)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.9rem" }}>✕</button>
                        </div>

                        {/* Expanded: Tasks */}
                        {isStepExpanded && (
                          <div style={{ marginTop: "1rem", paddingLeft: "1.75rem", borderLeft: "2px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                            <h5 style={{ margin: "0 0 0.75rem 0", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>Today's Tasks</h5>
                            
                            {(step.tasks || []).map(task => (
                              <div key={task.id} style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                                <input type="checkbox" checked={task.completed} onChange={() => toggleTask(goal.id, step.id, task.id)} style={{ width: "0.85rem", height: "0.85rem" }} />
                                <span style={{ fontSize: "0.9rem", flex: 1, textDecoration: task.completed ? "line-through" : "none", color: task.completed ? "var(--text-secondary)" : "var(--text-body)" }}>{task.title}</span>
                                <button onClick={() => deleteTask(goal.id, step.id, task.id)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.8rem" }}>✕</button>
                              </div>
                            ))}

                            <input 
                              type="text" 
                              placeholder="+ Add a task for today..." 
                              onKeyDown={e => {
                                if (e.key === "Enter") {
                                  addTask(goal.id, step.id, e.target.value);
                                  e.target.value = "";
                                }
                              }} 
                              style={{ width: "100%", marginTop: "0.5rem", fontSize: "0.85rem", padding: "0.5rem 0.75rem", background: "transparent", border: "1px dashed rgba(255,255,255,0.2)" }} 
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <input 
                    type="text" 
                    placeholder="+ Add a new step..." 
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        addStep(goal.id, e.target.value);
                        e.target.value = "";
                      }
                    }} 
                    style={{ width: "100%", marginTop: "0.5rem", fontSize: "0.9rem", padding: "0.6rem 0.8rem", background: "transparent", border: "1px dashed rgba(255,255,255,0.2)" }} 
                  />

                </div>
              )}

            </div>
          );
        })}
      </div>

      {toast.show && <div className="toast-notification">{toast.message}</div>}
    </div>
  );
}
