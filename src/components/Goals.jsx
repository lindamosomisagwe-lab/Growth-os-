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

  // Add step to active goal
  const addStep = (goalId) => {
    const title = prompt("Enter step title:");
    if (!title || !title.trim()) return;
    setGoals(prev => prev.map(g => g.id === goalId ? {
      ...g,
      subgoals: [...(g.subgoals || []), { id: Date.now(), title: title.trim(), completed: false, tasks: [] }]
    } : g));
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
  
  // Toggle step completion
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
        triggerToast(`🎯 Step complete — ${targetStep?.title} (+${res.xpAwarded} XP)`);
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
                  {/* Ink stamp element */}
                  <div
                    className={`rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'scale-125 planet-ring-anim' : ''}`}
                    style={{
                      width: `${nodeSize}px`,
                      height: `${nodeSize}px`,
                      background: isExpanded 
                        ? areaStyle.color 
                        : (isRelated ? `rgba(${areaStyle.rgbValues}, 0.18)` : '#ffffff'),
                      border: `2px solid ${isExpanded ? '#1a1008' : areaStyle.color}`,
                      boxShadow: isExpanded 
                        ? '0 4px 14px rgba(26,16,8,0.18)' 
                        : '0 2px 6px rgba(26,16,8,0.06)',
                      opacity: opacity,
                      position: 'relative'
                    }}
                  >
                    <span style={{ 
                      fontSize: isExpanded ? '24px' : '20px', 
                      transition: 'font-size 0.3s',
                      filter: isExpanded ? 'none' : 'grayscale(0.15)'
                    }}>
                      {item.icon}
                    </span>
                  </div>

                  {/* Serif title underneath */}
                  <div style={{
                    color: isExpanded ? 'var(--ink-dark)' : 'var(--ink-medium)',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '12px',
                    fontWeight: isExpanded ? '700' : '600',
                    marginTop: '10px',
                    textAlign: 'center',
                    maxWidth: '96px',
                    letterSpacing: '0.01em',
                    opacity: opacity,
                    transition: 'all 0.3s ease'
                  }}>
                    {item.title}
                  </div>

                  {/* Cursive progress percentage */}
                  <div style={{
                    color: areaStyle.color,
                    fontFamily: "var(--font-cursive)",
                    fontSize: '14px',
                    marginTop: '-2px',
                    textAlign: 'center',
                    opacity: opacity,
                    transition: 'all 0.3s ease'
                  }}>
                    {item.energy}%
                  </div>
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

      {/* ── Popup Details Notebook Card ── */}
      {activeNodeId && activeItem && activeAreaStyle && (
        <div style={{
          position: isMobile ? 'fixed' : 'absolute',
          top: isMobile ? 'auto' : '80px',
          bottom: isMobile ? '0' : 'auto',
          left: '50%',
          transform: 'translateX(-50%)',
          width: isMobile ? '100%' : '330px',
          maxWidth: '420px',
          background: '#ffffff',
          border: `1px solid var(--ink-faint)`,
          borderTop: `4px solid ${activeAreaStyle.borderColor}`,
          borderRadius: isMobile ? '16px 16px 0 0' : '6px',
          padding: '22px',
          boxShadow: `0 16px 36px rgba(26,16,8,0.12), 0 0 15px rgba(${activeAreaStyle.rgbValues}, 0.08)`,
          zIndex: 300,
          animation: 'fadeUp 0.25s cubic-bezier(0.34,1.56,0.64,1) both'
        }}>
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            {/* Status stamp badge */}
            <div style={{
              padding: '3px 10px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: '700',
              letterSpacing: '0.04em',
              background: activeItem.status === 'completed' 
                ? 'rgba(92,122,92,0.1)' 
                : `rgba(${activeAreaStyle.rgbValues}, 0.1)`,
              color: activeItem.status === 'completed' 
                ? '#5c7a5c' 
                : activeAreaStyle.borderColor,
              border: `1px solid ${activeItem.status === 'completed' ? 'rgba(92,122,92,0.15)' : 'rgba(26,16,8,0.06)'}`
            }}>
              {activeItem.status === 'completed' ? '✓ COMPLETE' : activeItem.status === 'in-progress' ? '● IN PROGRESS' : '○ PENDING'}
            </div>
            
            {/* Date */}
            <span style={{ fontSize: '11px', color: 'var(--ink-medium)', fontFamily: 'monospace' }}>
              {activeItem.date}
            </span>
          </div>

          {/* Goal title (serif) */}
          <div style={{ color: 'var(--ink-dark)', fontSize: '18px', fontFamily: 'var(--font-serif)', fontWeight: '700', marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span>{activeItem.icon}</span>
            <span>{activeItem.title}</span>
          </div>

          {/* Description */}
          <div style={{ color: 'var(--ink-medium)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
            {activeItem.content}
          </div>

          {/* Progress Row */}
          <div style={{ padding: '12px 0', borderTop: '1px solid var(--ink-faint)', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--ink-medium)' }}>Progress Stamp</span>
              <span style={{ fontSize: '12px', color: activeAreaStyle.borderColor, fontWeight: '700' }}>{activeItem.energy}%</span>
            </div>
            <div style={{ height: '6px', background: 'var(--ink-faint)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${activeItem.energy}%`,
                background: activeAreaStyle.borderColor,
                borderRadius: '3px',
                transition: 'width 0.6s ease'
              }}/>
            </div>
          </div>

          {/* Subgoals checklists */}
          <div style={{ borderTop: '1px solid var(--ink-faint)', paddingTop: '12px' }}>
            <div style={{ fontSize: '10px', color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', fontWeight: '700' }}>
              Subgoal Checklist
            </div>
            
            {activeItem.steps.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--ink-light)', fontStyle: 'italic', padding: '4px 0' }}>
                No outline added yet. Append one below.
              </div>
            ) : (
              activeItem.steps.map(step => (
                <div key={step.id} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--ink-faint)'
                }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleStep(activeItem.id, step.id); }}
                    style={{
                      width: '18px', height: '18px', borderRadius: '4px',
                      border: step.completed ? 'none' : '1.5px solid var(--ink-medium)',
                      background: step.completed ? activeAreaStyle.borderColor : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', flexShrink: 0, color: '#fff', cursor: 'pointer', outline: 'none',
                      padding: 0
                    }}
                  >
                    {step.completed ? '✓' : ''}
                  </button>
                  <span style={{
                    fontSize: '13px',
                    color: step.completed ? 'var(--ink-light)' : 'var(--ink-dark)',
                    textDecoration: step.completed ? 'line-through' : 'none'
                  }}>
                    {step.title}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Connected Goals Section */}
          {activeItem.relatedIds && activeItem.relatedIds.length > 0 && (
            <div style={{ borderTop: '1px solid var(--ink-faint)', paddingTop: '12px', marginTop: '12px' }}>
              <div style={{ fontSize: '10px', color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', fontWeight: '700' }}>
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '18px' }}>
            <button 
              className="btn-primary"
              style={{
                flex: 1, 
                padding: '10px 14px', 
                background: activeAreaStyle.borderColor + ' !important', 
                color: '#ffffff !important', 
                border: 'none', 
                boxShadow: `0 3px 0 ${activeAreaStyle.shadowColor} !important`
              }}
              onClick={() => toggleGoal(activeItem.id)}
            >
              {activeItem.status === 'completed' ? 'Mark Incomplete' : 'Complete Goal'}
            </button>
            <button 
              onClick={() => addStep(activeItem.id)}
              className="btn-secondary"
              style={{ padding: '10px 12px' }}
            >
              + Step
            </button>
            <button 
              onClick={() => {
                const newTitle = prompt("Edit Goal Title:", activeItem.title);
                if (newTitle && newTitle.trim()) {
                  setGoals(prev => prev.map(g => g.id === activeItem.id ? { ...g, title: newTitle.trim() } : g));
                }
              }}
              className="btn-secondary"
              style={{ padding: '10px 12px' }}
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
              className="btn-secondary"
              style={{ padding: '10px 12px', color: 'var(--accent-rust) !important' }}
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
