import React, { useState, useEffect, useRef } from "react";
import { useGamification } from "../contexts/GamificationContext";
import GoalCompleteSequence from "./GoalCompleteSequence";

const LIFE_AREA_STYLES = {
  health: {
    active:   'background: #5c7a5c; border-color: #5c7a5c;',
    glow:     '0 0 15px rgba(92,122,92,0.3)',
    pulse:    'rgba(92,122,92,0.25)',
    icon:     '🌿',
    gradStart: '#5c7a5c',
    gradEnd: '#6d8a6d',
    borderColor: '#5c7a5c',
    rgbValues: '92,122,92',
    shadowColor: '#4a614a',
    label:    'Health'
  },
  work: {
    active:   'background: #5c8fa8; border-color: #5c8fa8;',
    glow:     '0 0 15px rgba(92,143,168,0.3)',
    pulse:    'rgba(92,143,168,0.25)',
    icon:     '✒️',
    gradStart: '#5c8fa8',
    gradEnd: '#6fa3bf',
    borderColor: '#5c8fa8',
    rgbValues: '92,143,168',
    shadowColor: '#4a7287',
    label:    'Work'
  },
  relationships: {
    active:   'background: #8b3a2a; border-color: #8b3a2a;',
    glow:     '0 0 15px rgba(139,58,42,0.3)',
    pulse:    'rgba(139,58,42,0.25)',
    icon:     '🤝',
    gradStart: '#8b3a2a',
    gradEnd: '#a34e3e',
    borderColor: '#8b3a2a',
    rgbValues: '139,58,42',
    shadowColor: '#6f2e21',
    label:    'Relationships'
  },
  money: {
    active:   'background: #c9a96e; border-color: #c9a96e;',
    glow:     '0 0 15px rgba(201,169,110,0.3)',
    pulse:    'rgba(201,169,110,0.25)',
    icon:     '🪙',
    gradStart: '#c9a96e',
    gradEnd: '#dbb981',
    borderColor: '#c9a96e',
    rgbValues: '201,169,110',
    shadowColor: '#a18758',
    label:    'Money'
  },
  growth: {
    active:   'background: #7a5c8b; border-color: #7a5c8b;',
    glow:     '0 0 15px rgba(122,92,139,0.3)',
    pulse:    'rgba(122,92,139,0.25)',
    icon:     '✨',
    gradStart: '#7a5c8b',
    gradEnd: '#8e71a0',
    borderColor: '#7a5c8b',
    rgbValues: '122,92,139',
    shadowColor: '#624a6f',
    label:    'Growth'
  },
  fun: {
    active:   'background: #b88d40; border-color: #b88d40;',
    glow:     '0 0 15px rgba(184,141,64,0.3)',
    pulse:    'rgba(184,141,64,0.25)',
    icon:     '🍷',
    gradStart: '#b88d40',
    gradEnd: '#cfa253',
    borderColor: '#b88d40',
    rgbValues: '184,141,64',
    shadowColor: '#937033',
    label:    'Fun'
  },
  creativity: {
    active:   'background: #a85e68; border-color: #a85e68;',
    glow:     '0 0 15px rgba(168,94,104,0.3)',
    pulse:    'rgba(168,94,104,0.25)',
    icon:     '🎨',
    gradStart: '#a85e68',
    gradEnd: '#bc737d',
    borderColor: '#a85e68',
    rgbValues: '168,94,104',
    shadowColor: '#864b53',
    label:    'Creativity'
  },
  learning: {
    active:   'background: #5c707a; border-color: #5c707a;',
    glow:     '0 0 15px rgba(92,112,122,0.3)',
    pulse:    'rgba(92,112,122,0.25)',
    icon:     '📚',
    gradStart: '#5c707a',
    gradEnd: '#6f8591',
    borderColor: '#5c707a',
    rgbValues: '92,112,122',
    shadowColor: '#4a5961',
    label:    'Learning'
  },
  default: {
    active:   'background: #1a1008; border-color: #1a1008;',
    glow:     '0 0 15px rgba(26,16,8,0.3)',
    pulse:    'rgba(26,16,8,0.25)',
    icon:     '🎯',
    gradStart: '#1a1008',
    gradEnd: '#2e1c0e',
    borderColor: '#1a1008',
    rgbValues: '26,16,8',
    shadowColor: '#000000',
    label:    'Goal'
  }
};

function dispatchSave() { window.dispatchEvent(new Event("growth_os_save")); }

function GoalHierarchy({ 
  goal, 
  activeAreaStyle, 
  toggleSubgoalDone, 
  toggleTaskDone, 
  addSubgoal, 
  addTask 
}) {
  const [expandedSubgoals, setExpandedSubgoals] = useState({});
  const [addingSubgoal, setAddingSubgoal] = useState(false);
  const [addingTaskFor, setAddingTaskFor] = useState(null);
  const [newSubgoalTitle, setNewSubgoalTitle] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const toggleSubgoal = (id) => {
    setExpandedSubgoals(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const accentColor = activeAreaStyle.borderColor || '#8b3a2a';
  const rgbValues = activeAreaStyle.rgbValues || '139,58,42';

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Section header */}
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '10px',
        fontWeight: '600',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'rgba(26,16,8,0.35)',
        marginBottom: '12px'
      }}>
        Sub-goals & Tasks
      </div>

      {/* Sub-goals list */}
      {(goal.subgoals || goal.steps || []).length === 0 && !addingSubgoal ? (
        <div style={{ fontSize: '13px', color: 'rgba(26,16,8,0.35)', fontStyle: 'italic', padding: '4px 0', marginBottom: '10px' }}>
          No outline added yet. Append one below.
        </div>
      ) : (
        (goal.subgoals || goal.steps || []).map((subgoal) => (
          <div key={subgoal.id} style={{ marginBottom: '6px' }}>
            {/* Sub-goal row */}
            <div
              onClick={() => toggleSubgoal(subgoal.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                background: expandedSubgoals[subgoal.id]
                  ? `rgba(${rgbValues}, 0.06)`
                  : 'rgba(26,16,8,0.02)',
                borderRadius: '6px',
                border: '1px solid rgba(26,16,8,0.07)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                userSelect: 'none'
              }}
            >
              {/* Subgoal completion circle */}
              <div style={{
                width: '18px', height: '18px',
                borderRadius: '50%',
                border: `2px solid ${(subgoal.done || subgoal.completed) ? accentColor : 'rgba(26,16,8,0.2)'}`,
                background: (subgoal.done || subgoal.completed) ? accentColor : 'transparent',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: 'white',
                fontWeight: '700'
              }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSubgoalDone(goal.id, subgoal.id);
                }}
              >
                {(subgoal.done || subgoal.completed) ? '✓' : ''}
              </div>

              {/* Subgoal title */}
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                fontWeight: '500',
                color: (subgoal.done || subgoal.completed) ? 'rgba(26,16,8,0.3)' : 'rgba(26,16,8,0.8)',
                textDecoration: (subgoal.done || subgoal.completed) ? 'line-through' : 'none',
                flex: 1
              }}>
                {subgoal.title}
              </span>

              {/* Task count badge */}
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '10px',
                fontWeight: '600',
                color: 'rgba(26,16,8,0.35)',
                background: 'rgba(26,16,8,0.06)',
                padding: '2px 7px',
                borderRadius: '999px'
              }}>
                {(subgoal.tasks || []).filter(t => t.done || t.completed).length || 0}/{(subgoal.tasks || []).length || 0}
              </span>

              {/* Expand chevron */}
              <span style={{
                fontSize: '12px',
                color: 'rgba(26,16,8,0.3)',
                transform: expandedSubgoals[subgoal.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}>▾</span>
            </div>

            {/* Tasks — shown when subgoal is expanded */}
            {expandedSubgoals[subgoal.id] && (
              <div style={{
                marginLeft: '28px',
                marginTop: '4px',
                borderLeft: `2px solid rgba(${rgbValues}, 0.2)`,
                paddingLeft: '12px',
                paddingBottom: '4px'
              }}>
                {(subgoal.tasks || []).map(task => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 0',
                      borderBottom: '1px solid rgba(26,16,8,0.05)'
                    }}
                  >
                    {/* Task checkbox */}
                    <div
                      onClick={() => toggleTaskDone(goal.id, subgoal.id, task.id)}
                      style={{
                        width: '16px', height: '16px',
                        borderRadius: '3px',
                        border: `1.5px solid ${(task.done || task.completed) ? accentColor : 'rgba(26,16,8,0.2)'}`,
                        background: (task.done || task.completed) ? accentColor : 'transparent',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        color: 'white',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {(task.done || task.completed) ? '✓' : ''}
                    </div>

                    {/* Task title */}
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '13px',
                      color: (task.done || task.completed) ? 'rgba(26,16,8,0.3)' : 'rgba(26,16,8,0.7)',
                      textDecoration: (task.done || task.completed) ? 'line-through' : 'none',
                      flex: 1
                    }}>
                      {task.title}
                    </span>

                    {/* XP reward preview */}
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '10px',
                      color: '#c9a96e',
                      fontWeight: '600'
                    }}>
                      +10 XP
                    </span>
                  </div>
                ))}

                {/* Add task input */}
                {addingTaskFor === subgoal.id ? (
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    paddingTop: '8px',
                    alignItems: 'center'
                  }}>
                    <input
                      autoFocus
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newTaskTitle.trim()) {
                          addTask(goal.id, subgoal.id, newTaskTitle.trim());
                          setNewTaskTitle('');
                          setAddingTaskFor(null);
                        }
                        if (e.key === 'Escape') {
                          setAddingTaskFor(null);
                          setNewTaskTitle('');
                        }
                      }}
                      placeholder="Task name... (Enter to save)"
                      style={{
                        flex: 1,
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '13px',
                        padding: '6px 10px',
                        border: `1.5px solid ${accentColor}`,
                        borderRadius: '4px',
                        outline: 'none',
                        background: 'white',
                        color: '#1a1008'
                      }}
                    />
                    <button
                      onClick={() => setAddingTaskFor(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'rgba(26,16,8,0.35)',
                        fontSize: '16px'
                      }}
                    >✕</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingTaskFor(subgoal.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '6px',
                      padding: '6px 0',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '12px',
                      fontWeight: '500',
                      color: accentColor,
                      opacity: 0.7
                    }}
                  >
                    + Add task
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}

      {/* Add sub-goal */}
      {addingSubgoal ? (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '8px',
          alignItems: 'center'
        }}>
          <input
            autoFocus
            value={newSubgoalTitle}
            onChange={e => setNewSubgoalTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && newSubgoalTitle.trim()) {
                addSubgoal(goal.id, newSubgoalTitle.trim());
                setNewSubgoalTitle('');
                setAddingSubgoal(false);
              }
              if (e.key === 'Escape') {
                setAddingSubgoal(false);
                setNewSubgoalTitle('');
              }
            }}
            placeholder="Sub-goal name... (Enter to save)"
            style={{
              flex: 1,
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              padding: '8px 12px',
              border: `1.5px solid ${accentColor}`,
              borderRadius: '6px',
              outline: 'none',
              background: 'white',
              color: '#1a1008'
            }}
          />
          <button
            onClick={() => setAddingSubgoal(false)}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer',
              color: 'rgba(26,16,8,0.35)',
              fontSize: '18px'
            }}
          >✕</button>
        </div>
      ) : (
        <button
          onClick={() => setAddingSubgoal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '10px',
            padding: '10px 14px',
            width: '100%',
            background: 'rgba(26,16,8,0.02)',
            border: '1.5px dashed rgba(26,16,8,0.15)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            fontWeight: '500',
            color: 'rgba(26,16,8,0.45)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = accentColor;
            e.currentTarget.style.color = accentColor;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(26,16,8,0.15)';
            e.currentTarget.style.color = 'rgba(26,16,8,0.45)';
          }}
        >
          + Add sub-goal
        </button>
      )}
    </div>
  );
}

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
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [selectedArea, setSelectedArea] = useState("growth");
  
  // Ink specks background
  const [stars, setStars] = useState([]);
  useEffect(() => {
    const generatedStars = Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1.2,
      opacity: Math.random() * 0.12 + 0.05
    }));
    setStars(generatedStars);
  }, []);

  // Majestic slow rotation
  const [rotation, setRotation] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const ROTATION_SPEED = 0.12;

  const containerRef = useRef(null);

  useEffect(() => {
    if (!autoRotate) return;
    let animId;
    const tick = () => {
      setRotation(prev => (prev + ROTATION_SPEED) % 360);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [autoRotate]);

  // Pause rotation on hover
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseEnter = () => setAutoRotate(false);
    const handleMouseLeave = () => {
      if (!activeNodeId) setAutoRotate(true);
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [activeNodeId]);

  // Mobile layout state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save changes to local storage
  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.goals = goals;
    localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
    dispatchSave();
  }, [goals]);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: "" }), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const triggerToast = (msg) => setToast({ show: true, message: msg });

  // Add sub-goal to a goal
  const addSubgoal = (goalId, title) => {
    if (!title || !title.trim()) return;
    setGoals(prev => prev.map(g => g.id === goalId ? {
      ...g,
      subgoals: [...(g.subgoals || []), {
        id: Date.now(),
        title: title.trim(),
        completed: false,
        done: false,
        tasks: []
      }]
    } : g));
    triggerToast(`Sub-goal '${title}' added.`);
  };

  // Add task to a sub-goal
  const addTask = (goalId, subgoalId, title) => {
    if (!title || !title.trim()) return;
    setGoals(prev => prev.map(g => g.id === goalId ? {
      ...g,
      subgoals: (g.subgoals || []).map(s => s.id === subgoalId ? {
        ...s,
        tasks: [...(s.tasks || []), {
          id: Date.now(),
          title: title.trim(),
          completed: false,
          done: false
        }]
      } : s)
    } : g));
    triggerToast(`Task '${title}' added.`);
  };

  // Toggle overall goal completion
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
  
  // Toggle sub-goal completion
  const toggleSubgoalDone = async (goalId, subgoalId) => {
    let isCompleting = false;
    let targetSubgoal;
    setGoals(prev => prev.map(g => g.id === goalId ? {
      ...g,
      subgoals: g.subgoals.map(s => {
        if (s.id === subgoalId) {
          isCompleting = !s.completed;
          targetSubgoal = s;
          const newDone = !s.completed;
          return { ...s, completed: newDone, done: newDone };
        }
        return s;
      })
    } : g));

    if (isCompleting) {
      const res = await awardXP(`subgoal_complete_${subgoalId}`);
      if (res && res.xpAwarded > 0) {
        triggerToast(`🎯 Sub-goal complete — ${targetSubgoal?.title} (+${res.xpAwarded} XP)`);
      }
    }
  };

  // Toggle task completion
  const toggleTaskDone = async (goalId, subgoalId, taskId) => {
    let isCompleting = false;
    let targetTask;
    setGoals(prev => prev.map(g => g.id === goalId ? {
      ...g,
      subgoals: g.subgoals.map(s => {
        if (s.id === subgoalId) {
          return {
            ...s,
            tasks: (s.tasks || []).map(t => {
              if (t.id === taskId) {
                isCompleting = !t.completed;
                targetTask = t;
                const newDone = !t.completed;
                return { ...t, completed: newDone, done: newDone };
              }
              return t;
            })
          };
        }
        return s;
      })
    } : g));

    if (isCompleting) {
      const res = await awardXP(`task_complete_${taskId}`);
      if (res && res.xpAwarded > 0) {
        triggerToast(`✓ Task complete — ${targetTask?.title} (+${res.xpAwarded} XP)`);
      }
    }
  };

  // Dynamic mapping of goals data to orbital items
  const mappedGoals = goals.map((g) => {
    let totalSteps = 0;
    let completedSteps = 0;
    if (g.subgoals) {
      g.subgoals.forEach(s => {
        totalSteps++;
        if (s.completed) completedSteps++;
        if (s.tasks) {
          s.tasks.forEach(t => {
            totalSteps++;
            if (t.completed) completedSteps++;
          });
        }
      });
    }
    const energy = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);
    const status = energy === 100 ? "completed" : (energy > 0 ? "in-progress" : "pending");
    const lifeArea = g.lifeArea || g.category || "growth";
    const areaStyle = LIFE_AREA_STYLES[lifeArea] || LIFE_AREA_STYLES.default;

    return {
      id: g.id,
      title: g.title,
      date: g.dueDate || new Date(g.id).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      content: g.description || "Establish steps to guide your notebook progress.",
      category: lifeArea,
      lifeArea: lifeArea,
      icon: areaStyle.icon,
      relatedIds: g.relatedIds || [],
      status: status,
      energy: energy,
      steps: g.subgoals || []
    };
  });

  const handleAddGoal = (title, area, useAI) => {
    let subgoals = [];
    if (useAI) {
      if (area === 'health') {
        subgoals = [
          { id: Date.now() + 1, title: 'Establish a morning hydration log', completed: false, tasks: [] },
          { id: Date.now() + 2, title: 'Walk 10,000 steps daily', completed: false, tasks: [] },
          { id: Date.now() + 3, title: 'Practice mindfulness for 10m daily', completed: false, tasks: [] }
        ];
      } else if (area === 'work') {
        subgoals = [
          { id: Date.now() + 1, title: 'Set up focused deep work blocks', completed: false, tasks: [] },
          { id: Date.now() + 2, title: 'Organize desk and notes weekly', completed: false, tasks: [] },
          { id: Date.now() + 3, title: 'Review priority deliverables on Mondays', completed: false, tasks: [] }
        ];
      } else if (area === 'money') {
        subgoals = [
          { id: Date.now() + 1, title: 'Draft weekly cash outflow cap', completed: false, tasks: [] },
          { id: Date.now() + 2, title: 'Automate high-yield savings deposit', completed: false, tasks: [] },
          { id: Date.now() + 3, title: 'Eliminate unnecessary monthly subscriptions', completed: false, tasks: [] }
        ];
      } else if (area === 'relationships') {
        subgoals = [
          { id: Date.now() + 1, title: 'Write one postcard or warm message weekly', completed: false, tasks: [] },
          { id: Date.now() + 2, title: 'Schedule focused catch-up dinners', completed: false, tasks: [] },
          { id: Date.now() + 3, title: 'Coordinate a small group outing', completed: false, tasks: [] }
        ];
      } else if (area === 'fun') {
        subgoals = [
          { id: Date.now() + 1, title: 'Plan one weekend adventure monthly', completed: false, tasks: [] },
          { id: Date.now() + 2, title: 'Schedule a game night with friends', completed: false, tasks: [] },
          { id: Date.now() + 3, title: 'Explore a new local trail or park', completed: false, tasks: [] }
        ];
      } else if (area === 'creativity') {
        subgoals = [
          { id: Date.now() + 1, title: 'Doodle or sketch for 15 minutes', completed: false, tasks: [] },
          { id: Date.now() + 2, title: 'Write one journal page weekly', completed: false, tasks: [] },
          { id: Date.now() + 3, title: 'Work on a small craft or handiwork project', completed: false, tasks: [] }
        ];
      } else if (area === 'learning') {
        subgoals = [
          { id: Date.now() + 1, title: 'Read 2 chapters of a non-fiction book', completed: false, tasks: [] },
          { id: Date.now() + 2, title: 'Watch an educational documentary/talk', completed: false, tasks: [] },
          { id: Date.now() + 3, title: 'Practice a new skill or language', completed: false, tasks: [] }
        ];
      } else {
        subgoals = [
          { id: Date.now() + 1, title: 'Read 20 minutes daily', completed: false, tasks: [] },
          { id: Date.now() + 2, title: 'Draft a weekly reflective log', completed: false, tasks: [] },
          { id: Date.now() + 3, title: 'Review balance points monthly', completed: false, tasks: [] }
        ];
      }
    }

    const newGoal = {
      id: Date.now(),
      title: title.trim(),
      category: area,
      lifeArea: area,
      completed: false,
      pinned: false,
      subgoals: subgoals,
      relatedIds: []
    };

    setGoals(prev => [newGoal, ...prev]);
    setNewGoalTitle("");
    setShowAddModal(false);
    triggerToast(`✒️ '${title}' successfully penned in your goals!`);
  };

  const handleNodeClick = (id) => {
    if (activeNodeId === id) {
      setActiveNodeId(null);
      setAutoRotate(true);
    } else {
      setActiveNodeId(id);
      setAutoRotate(false);
      
      // Compute mathematical angle to center the selected node at 270 degrees (Top Center)
      const index = mappedGoals.findIndex(g => g.id === id);
      if (index !== -1) {
        const targetAngle = (270 - (index * 360 / mappedGoals.length)) % 360;
        setRotation(targetAngle >= 0 ? targetAngle : 360 + targetAngle);
      }
    }
  };

  const handleCanvasClick = (e) => {
    if (e.target === e.currentTarget) {
      setActiveNodeId(null);
      setAutoRotate(true);
    }
  };

  const orbitRadius = isMobile ? 120 : 210;
  const activeItem = mappedGoals.find(item => item.id === activeNodeId);
  const activeAreaStyle = activeItem ? (LIFE_AREA_STYLES[activeItem.lifeArea] || LIFE_AREA_STYLES.default) : null;

  return (
    <div style={{ color: "var(--ink-dark)", fontFamily: "var(--font-sans)", maxWidth: "100%", margin: "0 auto", paddingBottom: "4rem", position: "relative" }}>
      <style>{`
        @keyframes orbitRing {
          from { transform: rotate(0deg) scaleX(1); opacity: 0.2; }
          50%  { opacity: 0.5; }
          to   { transform: rotate(360deg) scaleX(1); opacity: 0.2; }
        }
        .planet-ring-anim::after {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 1.2px dashed var(--ink-medium);
          animation: orbitRing 8s linear infinite;
          pointer-events: none;
        }
        @keyframes fadeUp {
          from { transform: translate(-50%, 15px); opacity: 0; }
          to   { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50%       { transform: scale(1.1); opacity: 0.2; }
        }
        .goals-page-bg {
          background-color: #f8f3f1;
          background-image: radial-gradient(
            circle, rgba(26,16,8,0.06) 1.2px, transparent 1.2px
          );
          background-size: 24px 24px;
        }
      `}</style>

      {epicSequence && (
        <GoalCompleteSequence 
          result={epicSequence.result} 
          onClose={() => setEpicSequence(null)} 
        />
      )}

      {/* ── Viewport Constellation Canvas ── */}
      <div 
        ref={containerRef}
        onClick={handleCanvasClick}
        className="goals-page-bg"
        style={{
          position: "relative",
          width: "100%",
          height: isMobile ? "500px" : "680px",
          borderRadius: "6px",
          overflow: "hidden",
          border: "1px solid var(--ink-faint)",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab"
        }}
      >
        {/* Ink Specks (parchment stars) */}
        {stars.map(star => (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              borderRadius: '50%',
              backgroundColor: 'var(--ink-dark)',
              opacity: star.opacity,
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
        ))}

        {/* Empty State Parchment Invitation */}
        {mappedGoals.length === 0 ? (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 50, padding: '2rem', textAlign: 'center'
          }}>
            {/* Pulsing Hand-drawn Orbits */}
            <div style={{
              position: 'absolute',
              width: '380px', height: '380px', borderRadius: '50%',
              border: '1.5px dashed rgba(26, 16, 8, 0.1)',
              animation: 'orbitRing 12s linear infinite'
            }}/>
            <div style={{
              position: 'absolute',
              width: '260px', height: '260px', borderRadius: '50%',
              border: '1.5px dashed rgba(26, 16, 8, 0.06)',
              animation: 'orbitRing 8s linear infinite reverse'
            }}/>
            
            <div style={{ fontSize: '56px', marginBottom: '18px' }}>🖋️</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-dark)', fontSize: '24px', fontWeight: '700', marginBottom: '10px' }}>
              Your digital notebook awaits.
            </h2>
            <p style={{ color: 'var(--ink-medium)', fontSize: '14px', marginBottom: '32px', maxWidth: '320px', lineHeight: '1.6' }}>
              Every goal becomes a custom ink stamp slowly rotating in your personal life layout.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '12px 28px',
                background: 'var(--accent-gold)',
                borderBottom: '4px solid #a18758',
                borderRadius: '4px',
                color: 'var(--ink-dark)', fontSize: '14px', fontWeight: '700',
                boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
              }}
            >
              ✦ Draft your first goal
            </button>
          </div>
        ) : (
          <>
            {/* Orbit Tracks */}
            <div style={{
              position: "absolute",
              width: `${orbitRadius * 2}px`,
              height: `${orbitRadius * 2}px`,
              borderRadius: "50%",
              border: "1.5px dashed rgba(26, 16, 8, 0.08)",
              pointerEvents: "none",
              zIndex: 1
            }}/>
            <div style={{
              position: "absolute",
              width: `${orbitRadius * 2.8}px`,
              height: `${orbitRadius * 2.8}px`,
              borderRadius: "50%",
              border: "1.2px dashed rgba(26, 16, 8, 0.05)",
              pointerEvents: "none",
              zIndex: 1
            }}/>

            {/* Embossed Gold Wax Seal Core */}
            <div style={{
              position: "absolute",
              width: "74px",
              height: "74px",
              borderRadius: "50%",
              background: "#c9a96e",
              boxShadow: "inset 0 0 12px rgba(0,0,0,0.18), 0 4px 12px rgba(26,16,8,0.18)",
              border: "2px double #b88d40",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 5,
              pointerEvents: "none"
            }}>
              <span style={{ fontSize: '24px', color: '#1a1008', filter: 'drop-shadow(0px 1px 1px rgba(255,255,255,0.3))' }}>★</span>
              <div style={{
                position: "absolute",
                color: "var(--ink-medium)",
                fontSize: "9px",
                bottom: "-24px",
                whiteSpace: "nowrap",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontFamily: "var(--font-sans)",
                fontWeight: "700"
              }}>
                your universe
              </div>
            </div>

            {/* Orbiting Planet Stamp Nodes */}
            {mappedGoals.map((item, index) => {
              const angleInRad = ((rotation + (index * 360 / mappedGoals.length)) * Math.PI) / 180;
              const x = Math.cos(angleInRad) * orbitRadius;
              const y = Math.sin(angleInRad) * orbitRadius;

              const isExpanded = activeNodeId === item.id;
              const isRelated = activeNodeId && item.relatedIds.includes(activeNodeId);
              const opacity = activeNodeId ? (isExpanded || isRelated ? 1 : 0.35) : 1;

              const areaStyle = LIFE_AREA_STYLES[item.lifeArea] || LIFE_AREA_STYLES.default;
              const nodeSize = 48 + (item.energy / 100) * 16; 

              return (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(item.id);
                  }}
                  style={{
                    position: "absolute",
                    transform: `translate(${x}px, ${y}px)`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    zIndex: isExpanded ? 50 : 10,
                    transition: "transform 0.1s linear, opacity 0.3s ease"
                  }}
                >
                  {/* Planet Node */}
                  <div
                    style={{
                      width: item.status === 'completed' ? '72px' : '64px',
                      height: item.status === 'completed' ? '72px' : '64px',
                      borderRadius: '50%',
                      background: item.status === 'completed'
                        ? areaStyle.borderColor || '#8b3a2a'
                        : '#f7f3ec',
                      border: `2px solid ${areaStyle.borderColor || '#8b3a2a'}`,
                      boxShadow: isExpanded
                        ? `0 0 0 4px rgba(${areaStyle.rgbValues || '139,58,42'}, 0.15), 0 8px 24px rgba(0,0,0,0.12)`
                        : `0 2px 8px rgba(0,0,0,0.1)`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                      transform: isExpanded ? 'scale(1.15)' : 'scale(1)',
                      position: 'relative',
                      opacity: opacity
                    }}
                  >
                    {/* Life area emoji */}
                    <div style={{ fontSize: '22px', lineHeight: 1 }}>
                      {areaStyle.icon || '🎯'}
                    </div>

                    {/* Completion tick for completed goals */}
                    {item.status === 'completed' && (
                      <div style={{
                        position: 'absolute',
                        top: '-4px', right: '-4px',
                        width: '18px', height: '18px',
                        borderRadius: '50%',
                        background: '#5c7a5c',
                        border: '2px solid #f7f3ec',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: 'white',
                        fontWeight: '700'
                      }}>✓</div>
                    )}

                    {/* Active pulse ring */}
                    {item.status === 'in-progress' && (
                      <div style={{
                        position: 'absolute',
                        inset: '-6px',
                        borderRadius: '50%',
                        border: `1.5px solid ${areaStyle.borderColor || '#8b3a2a'}`,
                        opacity: 0.4,
                        animation: 'pulse 2s ease infinite'
                      }}/>
                    )}
                  </div>

                  {/* Goal title below node — always visible */}
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    marginTop: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#1a1008',
                    letterSpacing: '0.02em',
                    textShadow: '0 1px 3px rgba(247,243,236,0.9), 0 0 8px rgba(247,243,236,1)',
                    maxWidth: '90px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textAlign: 'center',
                    opacity: opacity
                  }}>
                    {item.title}
                  </div>

                  {/* Progress arc — thin ring around node */}
                  <svg style={{
                    position: 'absolute',
                    inset: '-6px',
                    width: 'calc(100% + 12px)',
                    height: 'calc(100% + 12px)',
                    transform: 'rotate(-90deg)',
                    pointerEvents: 'none'
                  }}>
                    <circle
                      cx="50%" cy="50%"
                      r="45%"
                      fill="none"
                      stroke="rgba(26,16,8,0.08)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="50%" cy="50%"
                      r="45%"
                      fill="none"
                      stroke={areaStyle.borderColor || '#8b3a2a'}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${item.energy * 2.83} 283`}
                      opacity="0.7"
                    />
                  </svg>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* ── FAB Add Goal Button (Wax Stamp style) ── */}
      <button
        onClick={() => setShowAddModal(true)}
        style={{
          position: 'fixed',
          bottom: '32px', right: '32px',
          width: '54px', height: '54px',
          borderRadius: '50%',
          background: 'var(--accent-gold)',
          border: 'none',
          boxShadow: '0 4px 0 #a18758, 0 4px 16px rgba(26,16,8,0.15)',
          color: 'var(--ink-dark)', fontSize: '26px', fontWeight: '700',
          cursor: 'pointer', zIndex: 500,
          transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1) rotate(10deg)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        onMouseDown={e => e.currentTarget.style.transform = 'translateY(3px) scale(1)'}
      >
        +
      </button>

      {/* Backdrop when card is open */}
      {activeNodeId && (
        <div
          onClick={() => {
            setActiveNodeId(null);
            setAutoRotate(true);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26,16,8,0.3)',
            zIndex: 499,
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)'
          }}
        />
      )}

      {/* ── Expanded Bottom Sheet Details Card ── */}
      {activeNodeId && activeItem && activeAreaStyle && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: isMobile ? 0 : '220px', /* account for sidebar */
          right: 0,
          background: '#ffffff',
          borderRadius: '20px 20px 0 0',
          borderTop: `3px solid ${activeAreaStyle.borderColor || '#8b3a2a'}`,
          boxShadow: '0 -8px 40px rgba(26,16,8,0.12)',
          padding: '24px 28px 32px',
          zIndex: 500,
          maxHeight: '70vh',
          overflowY: 'auto',
          animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards'
        }}>
          {/* Drag handle */}
          <div style={{
            width: '36px', height: '4px',
            background: 'rgba(26,16,8,0.12)',
            borderRadius: '2px',
            margin: '0 auto 20px',
            cursor: 'pointer'
          }} onClick={() => {
            setActiveNodeId(null);
            setAutoRotate(true);
          }} />

          {/* Header Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px'
          }}>
            <div style={{ flex: 1 }}>
              {/* Status stamp badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: '600',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '8px',
                background: activeItem.status === 'completed' 
                  ? 'rgba(92,122,92,0.1)' 
                  : `rgba(${activeAreaStyle.rgbValues}, 0.1)`,
                color: activeItem.status === 'completed' ? '#5c7a5c' : activeAreaStyle.borderColor,
                border: `1px solid ${activeItem.status === 'completed' ? 'rgba(92,122,92,0.2)' : 'rgba(26,16,8,0.06)'}`
              }}>
                {activeItem.status === 'completed' ? '✓ Complete' : '● In Progress'}
              </div>

              {/* Goal title */}
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '20px',
                fontWeight: '700',
                color: '#1a1008',
                lineHeight: 1.25,
                margin: 0
              }}>
                {activeItem.title}
              </h2>

              {/* Description */}
              {activeItem.content && (
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                  color: 'rgba(26,16,8,0.5)',
                  marginTop: '6px',
                  lineHeight: 1.6,
                  fontStyle: 'italic'
                }}>
                  {activeItem.content}
                </p>
              )}
            </div>

            {/* Date + Close button */}
            <div style={{ textAlign: 'right', marginLeft: '16px' }}>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                color: 'rgba(26,16,8,0.35)',
                letterSpacing: '0.06em',
                marginBottom: '8px'
              }}>
                {activeItem.date}
              </div>
              <button
                onClick={() => {
                  setActiveNodeId(null);
                  setAutoRotate(true);
                }}
                style={{
                  width: '28px', height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(26,16,8,0.06)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'rgba(26,16,8,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >✕</button>
            </div>
          </div>

          {/* Progress section */}
          <div style={{
            padding: '12px 0',
            borderTop: '1px solid rgba(26,16,8,0.07)',
            borderBottom: '1px solid rgba(26,16,8,0.07)',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                fontWeight: '600',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(26,16,8,0.35)'
              }}>Progress</span>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '18px',
                fontWeight: '700',
                color: activeAreaStyle.borderColor || '#8b3a2a'
              }}>{activeItem.energy}%</span>
            </div>
            <div style={{
              height: '4px',
              background: 'rgba(26,16,8,0.07)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${activeItem.energy}%`,
                background: activeAreaStyle.borderColor || '#8b3a2a',
                borderRadius: '2px',
                transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)'
              }}/>
            </div>
          </div>

          {/* Sub-goals and Tasks Hierarchy */}
          <GoalHierarchy
            goal={activeItem}
            activeAreaStyle={activeAreaStyle}
            toggleSubgoalDone={toggleSubgoalDone}
            toggleTaskDone={toggleTaskDone}
            addSubgoal={addSubgoal}
            addTask={addTask}
          />

          {/* Connected Goals Section */}
          {activeItem.relatedIds && activeItem.relatedIds.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(26,16,8,0.05)', paddingTop: '12px', marginBottom: '20px' }}>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '10px',
                fontWeight: '600',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(26,16,8,0.35)',
                marginBottom: '10px'
              }}>
                🔗 Connected Goals
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {activeItem.relatedIds.map(relId => {
                  const relGoal = mappedGoals.find(g => g.id === relId);
                  if (!relGoal) return null;
                  return (
                    <button
                      key={relId}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNodeClick(relId);
                      }}
                      className="btn-secondary"
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>{relGoal.icon}</span>
                      <span>{relGoal.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => {
                if (activeItem.status === 'completed') {
                  toggleGoal(activeItem.id);
                } else {
                  addStep(activeItem.id);
                }
              }}
              style={{
                flex: 1,
                padding: '12px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                fontWeight: '600',
                letterSpacing: '0.03em',
                background: '#1a1008',
                color: '#f7f3ec',
                border: 'none',
                borderRadius: '6px',
                boxShadow: '0 3px 0 rgba(0,0,0,0.35)',
                cursor: 'pointer'
              }}
            >
              {activeItem.status === 'completed' ? 'Mark incomplete' : '+ Add step'}
            </button>
            {activeItem.status !== 'completed' && (
              <button
                onClick={() => toggleGoal(activeItem.id)}
                style={{
                  padding: '12px 16px',
                  background: 'transparent',
                  border: '1.5px solid rgba(26,16,8,0.15)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'rgba(26,16,8,0.8)'
                }}
              >
                ✓ Complete
              </button>
            )}
            <button 
              onClick={() => {
                const newTitle = prompt("Edit Goal Title:", activeItem.title);
                if (newTitle && newTitle.trim()) {
                  setGoals(prev => prev.map(g => g.id === activeItem.id ? { ...g, title: newTitle.trim() } : g));
                }
              }}
              style={{
                padding: '12px 16px',
                background: 'transparent',
                border: '1.5px solid rgba(26,16,8,0.15)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
              title="Edit Goal"
            >
              ✏️
            </button>
            <button 
              onClick={() => {
                if (confirm("Delete this goal?")) {
                  setGoals(prev => prev.filter(g => g.id !== activeItem.id));
                  setActiveNodeId(null);
                  setAutoRotate(true);
                }
              }}
              style={{
                padding: '12px 16px',
                background: 'transparent',
                border: '1.5px solid rgba(26,16,8,0.15)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
              title="Delete Goal"
            >
              🗑️
            </button>
          </div>
        </div>
      )}

      {/* ── Add Goal Parchment Modal ── */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(26,16,8,0.25)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--page-cream)',
            border: '1px solid var(--ink-faint)',
            borderRadius: '6px',
            padding: '24px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: 'var(--shadow-raised)',
            animation: 'fadeUp 0.2s cubic-bezier(0.34,1.56,0.64,1) both'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--ink-dark)', fontWeight: '700', marginBottom: '20px', fontFamily: 'var(--font-serif)' }}>
              Draft New Goal
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="What is your notebook goal?"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1px solid var(--ink-faint)',
                  borderRadius: '4px',
                  padding: '12px 14px',
                  color: 'var(--ink-dark)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '10px', color: 'var(--ink-medium)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', fontWeight: '700' }}>
                Life Area Sector
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(LIFE_AREA_STYLES).filter(([key]) => key !== 'default').map(([key, value]) => {
                  const isSelected = selectedArea === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedArea(key)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: isSelected ? `1.5px solid ${value.borderColor}` : '1.5px solid var(--ink-faint)',
                        background: isSelected ? value.borderColor : '#ffffff',
                        color: isSelected ? '#ffffff' : 'var(--ink-medium)',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                      }}
                    >
                      {value.icon} {value.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => {
                  if (!newGoalTitle.trim()) return alert("Please enter a goal title!");
                  handleAddGoal(newGoalTitle, selectedArea, true);
                }}
                className="btn-primary"
                style={{
                  padding: '12px',
                  background: 'var(--accent-gold) !important',
                  color: 'var(--ink-dark) !important',
                  boxShadow: '0 3px 0 #a18758 !important',
                  borderRadius: '4px !important',
                  fontWeight: '700'
                }}
              >
                ✨ Use AI to build plan steps
              </button>
              <button
                onClick={() => {
                  if (!newGoalTitle.trim()) return alert("Please enter a goal title!");
                  handleAddGoal(newGoalTitle, selectedArea, false);
                }}
                className="btn-secondary"
                style={{
                  padding: '12px',
                  borderRadius: '4px'
                }}
              >
                Write in manually
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ink-medium)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginTop: '4px',
                  fontFamily: 'var(--font-sans)'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && <div className="toast-notification">{toast.message}</div>}
    </div>
  );
}
