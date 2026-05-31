import React, { useState, useEffect } from "react";
import { useGamification } from "../contexts/GamificationContext";
import GoalCompleteSequence from "./GoalCompleteSequence";

function dispatchSave() { window.dispatchEvent(new Event("growth_os_save")); }

export default function Goals() {
  const { awardXP, progress } = useGamification();
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
  const [activeModalGoal, setActiveModalGoal] = useState(null);

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

  const addGoal = () => {
    const title = prompt("Enter a new goal:");
    if (!title) return;
    const newGoal = {
      id: Date.now(),
      title: title.trim(),
      completed: false,
      pinned: false,
      subgoals: []
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const addStep = (goalId) => {
    const title = prompt("Enter a step title:");
    if (!title) return;
    setGoals(prev => prev.map(g => g.id === goalId ? {
      ...g,
      subgoals: [...(g.subgoals || []), { id: Date.now(), title: title.trim(), completed: false, tasks: [] }]
    } : g));
  };

  const addTask = (goalId, stepId) => {
    const title = prompt("Enter a task title:");
    if (!title) return;
    setGoals(prev => prev.map(g => g.id === goalId ? {
      ...g,
      subgoals: g.subgoals.map(s => s.id === stepId ? {
        ...s,
        tasks: [...(s.tasks || []), { id: Date.now(), title: title.trim(), completed: false }]
      } : s)
    } : g));
  };

  const sortedGoals = [...goals].sort((a, b) => {
    if (a.completed && !b.completed) return -1;
    if (!a.completed && b.completed) return 1;
    return 0;
  });

  const nodeSpacing = 160;
  const svgHeight = Math.max(800, sortedGoals.length * nodeSpacing + 250);
  
  let pathD = `M 200 ${svgHeight}`;
  const nodes = sortedGoals.map((goal, i) => {
    const reversedIndex = sortedGoals.length - 1 - i;
    const cy = svgHeight - (i * nodeSpacing) - 150;
    const cx = 200 + Math.sin(i * 1.5) * 80;
    
    if (i === 0) {
      pathD = `M ${cx} ${cy + 100} Q ${cx} ${cy + 50} ${cx} ${cy}`;
    } else {
      const prevCy = svgHeight - ((i - 1) * nodeSpacing) - 150;
      const prevCx = 200 + Math.sin((i - 1) * 1.5) * 80;
      pathD += ` C ${prevCx} ${prevCy - 60}, ${cx} ${cy + 60}, ${cx} ${cy}`;
    }

    // calc progress
    let totalTasks = 0;
    let completedTasks = 0;
    if (goal.subgoals) {
      goal.subgoals.forEach(s => {
        totalTasks++;
        if (s.completed) completedTasks++;
        if (s.tasks) {
          s.tasks.forEach(t => {
            totalTasks++;
            if (t.completed) completedTasks++;
          });
        }
      });
    }
    const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return { ...goal, cx, cy, reversedIndex, percent };
  });

  const closeModal = () => setActiveModalGoal(null);

  // Simple active modal rendering
  const renderModal = () => {
    if (!activeModalGoal) return null;
    const g = goals.find(x => x.id === activeModalGoal);
    if (!g) return null;

    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "flex-end", backdropFilter: "blur(10px)", padding: "1rem" }}>
        <div style={{ background: "var(--bg-elevated)", width: "100%", maxWidth: "600px", padding: "2rem", borderRadius: "28px 28px 28px 28px", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ margin: 0, fontSize: "1.5rem", color: "#FFF" }}>{g.title}</h3>
            <button onClick={closeModal} className="btn-icon">❌</button>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {g.subgoals && g.subgoals.map(s => (
              <div key={s.id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "1rem" }}>
                <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", cursor: "pointer", fontWeight: "bold" }}>
                  <input type="checkbox" checked={s.completed} onChange={() => toggleStep(g.id, s.id)} />
                  <span style={{ textDecoration: s.completed ? "line-through" : "none", color: s.completed ? "var(--text-secondary)" : "#FFF" }}>{s.title}</span>
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                  {s.tasks && s.tasks.map(t => (
                    <label key={t.id} style={{ display: "flex", gap: "0.5rem", alignItems: "center", cursor: "pointer" }}>
                      <input type="checkbox" checked={t.completed} onChange={() => toggleTask(g.id, s.id, t.id)} />
                      <span style={{ textDecoration: t.completed ? "line-through" : "none", color: t.completed ? "var(--text-secondary)" : "var(--text-primary)" }}>{t.title}</span>
                    </label>
                  ))}
                  <button onClick={() => addTask(g.id, s.id)} className="btn-secondary" style={{ marginTop: "0.5rem", alignSelf: "flex-start", padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>+ Add Task</button>
                </div>
              </div>
            ))}
            <button onClick={() => addStep(g.id)} className="btn-secondary" style={{ alignSelf: "flex-start", marginTop: "0.5rem" }}>+ Add Step</button>
          </div>

          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
            <button onClick={() => { toggleGoal(g.id); closeModal(); }} className="btn-goals" style={{ flex: 1, padding: "1rem" }}>
              {g.completed ? "Mark Incomplete" : "🎯 Complete Goal"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)", maxWidth: "100%", margin: "0 auto", paddingBottom: "4rem" }}>
      
      {epicSequence && (
        <GoalCompleteSequence 
          result={epicSequence.result} 
          onClose={() => setEpicSequence(null)} 
        />
      )}

      {renderModal()}

      {sortedGoals.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", textAlign: "center" }}>
          <div style={{ fontSize: "64px", marginBottom: "1rem" }}>🗺️</div>
          <h2 style={{ margin: "0 0 1rem 0", color: "#FFF", fontSize: "1.5rem", fontWeight: "400" }}>Your map is waiting.</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Every great journey starts<br/>with a single destination.</p>
          <button onClick={addGoal} className="btn-goals" style={{ padding: "14px 28px" }}>
            🚀 Set your first goal
          </button>
        </div>
      ) : (
        <div style={{ position: "relative", width: "100%", height: `${svgHeight}px`, overflow: "hidden" }}>
          <svg width="100%" height={svgHeight} style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-200px)", width: "400px", overflow: "visible" }}>
            {/* Base dashed path for upcoming */}
            <path 
              d={pathD} 
              fill="none" 
              stroke="rgba(255,255,255,0.1)" 
              strokeWidth="3" 
              strokeDasharray="8 8" 
            />
            
            <path 
              d={pathD} 
              fill="none" 
              stroke="var(--page-accent)" 
              strokeWidth="6"
              style={{ filter: "drop-shadow(0 0 8px rgba(167,139,250,0.4))", strokeDasharray: 4000, strokeDashoffset: 4000, animation: "pathDraw 2.5s ease-out forwards" }}
            />

            {nodes.map((node, i) => {
              const isCompleted = node.completed;
              const isActive = !isCompleted && (i === 0 || nodes[i-1].completed);
              const isLocked = !isCompleted && !isActive;

              let r = isCompleted ? 32 : (isActive ? 36 : 28);
              
              return (
                <g key={node.id} className={isCompleted ? "node-anim" : ""} style={{ animationDelay: `${0.15 * i}s` }} onClick={() => setActiveModalGoal(node.id)}>
                  {isActive && (
                    <circle cx={node.cx} cy={node.cy} r={r + 8} fill="none" stroke="var(--page-accent)" strokeWidth="2" opacity="0.4" className="anim-pulse-ring" />
                  )}
                  
                  {isLocked ? (
                    <circle 
                      cx={node.cx} cy={node.cy} r={r} 
                      fill="rgba(255,255,255,0.08)"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      style={{ cursor: "pointer" }}
                    />
                  ) : (
                    <circle 
                      cx={node.cx} cy={node.cy} r={r} 
                      fill="var(--page-accent)"
                      style={{ cursor: "pointer", filter: isCompleted ? "drop-shadow(0 0 20px var(--page-accent))" : "none" }}
                    />
                  )}
                  
                  {/* Progress Arc for Active */}
                  {isActive && node.percent > 0 && (
                    <circle 
                      cx={node.cx} cy={node.cy} r={r + 4} 
                      fill="none" stroke="var(--page-accent)" strokeWidth="4"
                      strokeDasharray={`${node.percent * 2.51} 251`}
                      transform={`rotate(-90 ${node.cx} ${node.cy})`}
                    />
                  )}

                  <text x={node.cx} y={node.cy + 5} textAnchor="middle" fill="#FFFFFF" fontSize={isLocked ? "20px" : "24px"} style={{ pointerEvents: "none" }}>
                    {isCompleted ? "✓" : (isLocked ? "🔒" : "⭐")}
                  </text>
                  
                  <text x={node.cx} y={node.cy + r + 20} textAnchor="middle" fill={isLocked ? "rgba(255,255,255,0.4)" : "#FFFFFF"} fontSize="13px" fontWeight="700">
                    {node.title}
                  </text>
                  {isActive && (
                    <text x={node.cx} y={node.cy + r + 36} textAnchor="middle" fill="var(--page-accent)" fontSize="11px" fontWeight="600">
                      In progress ({node.percent}%)
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Start New Adventure Button at very bottom */}
          <div style={{ position: "absolute", bottom: "4rem", left: "50%", transform: "translateX(-50%)" }}>
            <button onClick={addGoal} className="btn-goals" style={{ padding: "16px 32px", fontSize: "16px" }}>
              + Start new adventure
            </button>
          </div>
        </div>
      )}

      {toast.show && <div className="toast-notification">{toast.message}</div>}
    </div>
  );
}
