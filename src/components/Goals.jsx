import React, { useState, useEffect, useRef } from "react";
import { useGamification } from "../contexts/GamificationContext";
import GoalCompleteSequence from "./GoalCompleteSequence";

const LIFE_AREA_STYLES = {
  health: {
    active:   'background: linear-gradient(135deg,#43E97B,#38F9D7); border-color: #43E97B;',
    glow:     '0 0 22px rgba(67,233,123,0.7)',
    pulse:    'rgba(67,233,123,0.45)',
    icon:     '💚',
    gradStart: '#43E97B',
    gradEnd: '#38F9D7',
    borderColor: '#43E97B',
    rgbValues: '67,233,123',
    shadowColor: '#2db860'
  },
  work: {
    active:   'background: linear-gradient(135deg,#4FACFE,#00C6FF); border-color: #4FACFE;',
    glow:     '0 0 22px rgba(79,172,254,0.7)',
    pulse:    'rgba(79,172,254,0.45)',
    icon:     '💼',
    gradStart: '#4FACFE',
    gradEnd: '#00C6FF',
    borderColor: '#4FACFE',
    rgbValues: '79,172,254',
    shadowColor: '#2d8fe0'
  },
  money: {
    active:   'background: linear-gradient(135deg,#F9D423,#F83600); border-color: #F9D423;',
    glow:     '0 0 22px rgba(249,212,35,0.7)',
    pulse:    'rgba(249,212,35,0.45)',
    icon:     '💰',
    gradStart: '#F9D423',
    gradEnd: '#F83600',
    borderColor: '#F9D423',
    rgbValues: '249,212,35',
    shadowColor: '#c4a200'
  },
  relationships: {
    active:   'background: linear-gradient(135deg,#F05A7E,#E83B6A); border-color: #F05A7E;',
    glow:     '0 0 22px rgba(240,90,126,0.7)',
    pulse:    'rgba(240,90,126,0.45)',
    icon:     '❤️',
    gradStart: '#F05A7E',
    gradEnd: '#E83B6A',
    borderColor: '#F05A7E',
    rgbValues: '240,90,126',
    shadowColor: '#9e2847'
  },
  growth: {
    active:   'background: linear-gradient(135deg,#A78BFA,#8B5CF6); border-color: #A78BFA;',
    glow:     '0 0 22px rgba(167,139,250,0.7)',
    pulse:    'rgba(167,139,250,0.45)',
    icon:     '✨',
    gradStart: '#A78BFA',
    gradEnd: '#8B5CF6',
    borderColor: '#A78BFA',
    rgbValues: '167,139,250',
    shadowColor: '#7c5cfc'
  },
  default: {
    active:   'background: linear-gradient(135deg,#667EEA,#764BA2); border-color: #667EEA;',
    glow:     '0 0 22px rgba(102,126,234,0.7)',
    pulse:    'rgba(102,126,234,0.45)',
    icon:     '🎯',
    gradStart: '#667EEA',
    gradEnd: '#764BA2',
    borderColor: '#667EEA',
    rgbValues: '102,126,234',
    shadowColor: '#3D28A0'
  }
};

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
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [selectedArea, setSelectedArea] = useState("growth");
  
  // Stars Background
  const [stars, setStars] = useState([]);
  useEffect(() => {
    const generatedStars = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.2 + 0.05
    }));
    setStars(generatedStars);
  }, []);

  // Rotation setup
  const [rotation, setRotation] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const ROTATION_SPEED = 0.15; // slow majestic rotation

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

  // Handle auto-rotate pause on mouse enter/leave on the container
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

  // Responsive adjustments
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Persist goals back to local storage
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

  // Add Step inside details modal
  const addStep = (goalId) => {
    const title = prompt("Enter step title:");
    if (!title || !title.trim()) return;
    setGoals(prev => prev.map(g => g.id === goalId ? {
      ...g,
      subgoals: [...(g.subgoals || []), { id: Date.now(), title: title.trim(), completed: false, tasks: [] }]
    } : g));
  };

  // Complete / Incomplete overall goal
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
  
  // Toggle step complete
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

  // Mapped goal node data calculated dynamically
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
    
    // Support category vs life_area mapping
    const lifeArea = g.lifeArea || g.category || "growth";
    const areaStyle = LIFE_AREA_STYLES[lifeArea] || LIFE_AREA_STYLES.default;

    return {
      id: g.id,
      title: g.title,
      date: g.dueDate || new Date(g.id).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      content: g.description || "Set steps to progress this star in your universe.",
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
          { id: Date.now() + 1, title: 'Establish a morning routine', completed: false, tasks: [] },
          { id: Date.now() + 2, title: 'Track daily hydration', completed: false, tasks: [] },
          { id: Date.now() + 3, title: 'Exercise 3x per week', completed: false, tasks: [] }
        ];
      } else if (area === 'work') {
        subgoals = [
          { id: Date.now() + 1, title: 'Define weekly milestones', completed: false, tasks: [] },
          { id: Date.now() + 2, title: 'Set up focused deep work blocks', completed: false, tasks: [] },
          { id: Date.now() + 3, title: 'Review progress every Friday', completed: false, tasks: [] }
        ];
      } else if (area === 'money') {
        subgoals = [
          { id: Date.now() + 1, title: 'Create monthly budget outline', completed: false, tasks: [] },
          { id: Date.now() + 2, title: 'Set up automated savings logic', completed: false, tasks: [] },
          { id: Date.now() + 3, title: 'Track all discretionary spend', completed: false, tasks: [] }
        ];
      } else if (area === 'relationships') {
        subgoals = [
          { id: Date.now() + 1, title: 'Schedule a weekly catch-up night', completed: false, tasks: [] },
          { id: Date.now() + 2, title: 'Send appreciation notes weekly', completed: false, tasks: [] },
          { id: Date.now() + 3, title: 'Plan an outdoor activity together', completed: false, tasks: [] }
        ];
      } else {
        subgoals = [
          { id: Date.now() + 1, title: 'Read 20 minutes daily', completed: false, tasks: [] },
          { id: Date.now() + 2, title: 'Complete a weekly retrospective log', completed: false, tasks: [] },
          { id: Date.now() + 3, title: 'Practice mindfulness for 5m daily', completed: false, tasks: [] }
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
    triggerToast(`🌌 ${title} successfully summoned in your universe!`);
  };

  const handleNodeClick = (id) => {
    if (activeNodeId === id) {
      setActiveNodeId(null);
      setAutoRotate(true);
    } else {
      setActiveNodeId(id);
      setAutoRotate(false);
    }
  };

  const handleCanvasClick = (e) => {
    // Only close if clicking outside of specific nodes and overlays
    if (e.target === e.currentTarget) {
      setActiveNodeId(null);
      setAutoRotate(true);
    }
  };

  const orbitRadius = isMobile ? 120 : 210;
  const activeItem = mappedGoals.find(item => item.id === activeNodeId);
  const activeAreaStyle = activeItem ? (LIFE_AREA_STYLES[activeItem.lifeArea] || LIFE_AREA_STYLES.default) : null;

  return (
    <div style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)", maxWidth: "100%", margin: "0 auto", paddingBottom: "4rem", position: "relative" }}>
      <style>{`
        @keyframes orbitRing {
          from { transform: rotate(0deg) scaleX(1); opacity: 0.3; }
          50%  { opacity: 0.65; }
          to   { transform: rotate(360deg) scaleX(1); opacity: 0.3; }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.25; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.55; }
        }
        .planet-ring-anim::after {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 255, 255, 0.22);
          animation: orbitRing 4s linear infinite;
          pointer-events: none;
        }
      `}</style>

      {epicSequence && (
        <GoalCompleteSequence 
          result={epicSequence.result} 
          onClose={() => setEpicSequence(null)} 
        />
      )}

      {/* ── Viewport Galaxy Canvas ── */}
      <div 
        ref={containerRef}
        onClick={handleCanvasClick}
        style={{
          position: "relative",
          width: "100%",
          height: isMobile ? "500px" : "680px",
          borderRadius: "28px",
          overflow: "hidden",
          background: "linear-gradient(135deg, #200818 0%, #4a0d2a 50%, #0f0308 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "inset 0 0 80px rgba(0,0,0,0.8), 0 12px 48px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab"
        }}
      >
        {/* Ambient Stars */}
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
              backgroundColor: '#FFFFFF',
              opacity: star.opacity,
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
        ))}

        {/* Empty State Invitation */}
        {mappedGoals.length === 0 ? (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 50, padding: '2rem', textAlign: 'center'
          }}>
            {/* Pulsing Ghost Orbits */}
            <div style={{
              position: 'absolute',
              width: '380px', height: '380px', borderRadius: '50%',
              border: '1.5px dashed rgba(240, 90, 126, 0.12)',
              animation: 'orbitRing 12s linear infinite'
            }}/>
            <div style={{
              position: 'absolute',
              width: '260px', height: '260px', borderRadius: '50%',
              border: '1.5px dashed rgba(240, 90, 126, 0.07)',
              animation: 'orbitRing 8s linear infinite reverse'
            }}/>
            
            {/* Center Callout */}
            <div style={{ fontSize: '56px', marginBottom: '18px' }}>🌌</div>
            <h2 style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: '800', marginBottom: '10px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Your universe is waiting.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '32px', maxWidth: '320px', lineHeight: '1.6' }}>
              Every goal you set becomes a majestic star orbiting in your digital sky.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #F05A7E, #E83B6A)',
                borderBottom: '5px solid #9e2847',
                borderRadius: '16px', border: 'none',
                color: '#fff', fontSize: '15px', fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 0 25px rgba(240,90,126,0.4)',
                position: 'relative', zIndex: 10
              }}
            >
              ✦ Name your first star
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
              border: "1.5px solid rgba(240, 90, 126, 0.12)",
              pointerEvents: "none",
              zIndex: 1
            }}/>
            <div style={{
              position: "absolute",
              width: `${orbitRadius * 2.8}px`,
              height: `${orbitRadius * 2.8}px`,
              borderRadius: "50%",
              border: "1.2px dashed rgba(240, 90, 126, 0.06)",
              pointerEvents: "none",
              zIndex: 1
            }}/>

            {/* Pulsing Central Core */}
            <div style={{
              position: "absolute",
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #F05A7E, #E83B6A, #A78BFA)",
              boxShadow: "0 0 40px rgba(240,90,126,0.65)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 5,
              pointerEvents: "none"
            }}>
              {/* Inner glowing core */}
              <div style={{ width: "16px", height: "16px", borderRadius: "50%", bg: "#FFF", backgroundColor: "#fff", opacity: 0.9, boxShadow: "0 0 10px #fff" }} />
              
              <div style={{
                position: "absolute",
                color: "rgba(255,255,255,0.4)",
                fontSize: "8px",
                bottom: "-22px",
                whiteSpace: "nowrap",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontWeight: "700"
              }}>
                your universe
              </div>
            </div>

            {/* Orbiting Planet Nodes */}
            {mappedGoals.map((item, index) => {
              const angleInRad = ((rotation + (index * 360 / mappedGoals.length)) * Math.PI) / 180;
              const x = Math.cos(angleInRad) * orbitRadius;
              const y = Math.sin(angleInRad) * orbitRadius;

              const isExpanded = activeNodeId === item.id;
              const isRelated = activeNodeId && item.relatedIds.includes(activeNodeId);
              const opacity = activeNodeId ? (isExpanded || isRelated ? 1 : 0.3) : 1;

              const areaStyle = LIFE_AREA_STYLES[item.lifeArea] || LIFE_AREA_STYLES.default;
              const nodeSize = 48 + (item.energy / 100) * 16; // 48px to 64px based on progress

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
                  {/* Glowing Node Ball */}
                  <div
                    className={`rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isExpanded ? 'scale-125 planet-ring-anim' : ''}`}
                    style={{
                      width: `${nodeSize}px`,
                      height: `${nodeSize}px`,
                      background: isExpanded || isRelated 
                        ? `linear-gradient(135deg, ${areaStyle.gradStart}, ${areaStyle.gradEnd})`
                        : 'rgba(15, 8, 30, 0.82)',
                      borderColor: isExpanded || isRelated 
                        ? areaStyle.borderColor 
                        : 'rgba(255,255,255,0.22)',
                      boxShadow: isExpanded 
                        ? areaStyle.glow 
                        : isRelated 
                          ? `0 0 15px ${areaStyle.pulse}` 
                          : 'none',
                      opacity: opacity,
                      position: 'relative'
                    }}
                  >
                    <span style={{ fontSize: isExpanded ? '24px' : '20px', transition: 'font-size 0.3s' }}>
                      {item.icon}
                    </span>
                  </div>

                  {/* Title underneath */}
                  <div style={{
                    color: isExpanded ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                    fontSize: '11px',
                    fontWeight: isExpanded ? '700' : '500',
                    marginTop: '10px',
                    textAlign: 'center',
                    maxWidth: '90px',
                    textShadow: '0 1px 8px rgba(0,0,0,0.9)',
                    letterSpacing: '0.02em',
                    opacity: opacity,
                    transition: 'all 0.3s ease'
                  }}>
                    {item.title}
                  </div>

                  {/* Progress Percent underneath */}
                  <div style={{
                    color: areaStyle.borderColor,
                    fontSize: '10px',
                    fontWeight: '600',
                    marginTop: '2px',
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

      {/* ── FAB Add Goal Button ── */}
      <button
        onClick={() => setShowAddModal(true)}
        style={{
          position: 'fixed',
          bottom: '32px', right: '32px',
          width: '56px', height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #F05A7E, #E83B6A)',
          border: 'none',
          boxShadow: '0 4px 0 #9e2847, 0 0 24px rgba(240,90,126,0.5)',
          color: 'white', fontSize: '26px', fontWeight: '800',
          cursor: 'pointer', zIndex: 500,
          transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          display: 'flex', alignItems: 'center', justifyText: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12) rotate(15deg)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        onMouseDown={e => e.currentTarget.style.transform = 'translateY(3px) scale(1.05)'}
      >
        +
      </button>

      {/* ── Popup Details Card ── */}
      {activeNodeId && activeItem && activeAreaStyle && (
        <div style={{
          position: isMobile ? 'fixed' : 'absolute',
          top: isMobile ? 'auto' : '80px',
          bottom: isMobile ? '0' : 'auto',
          left: '50%',
          transform: isMobile ? 'translateX(-50%)' : 'translateX(-50%)',
          width: isMobile ? '100%' : '330px',
          maxWidth: '420px',
          background: 'rgba(11, 6, 22, 0.96)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: `1px solid rgba(255,255,255,0.12)`,
          borderTop: `4px solid ${activeAreaStyle.borderColor}`,
          borderRadius: isMobile ? '28px 28px 0 0' : '24px',
          padding: '24px',
          boxShadow: `0 24px 64px rgba(0,0,0,0.7), 0 0 35px ${activeAreaStyle.pulse}`,
          zIndex: 300,
          animation: 'fadeUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both'
        }}>
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            {/* Status */}
            <div style={{
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '10px',
              fontWeight: '700',
              letterSpacing: '0.06em',
              background: activeItem.status === 'completed' 
                ? 'rgba(67,233,123,0.18)' 
                : `rgba(${activeAreaStyle.rgbValues}, 0.18)`,
              color: activeItem.status === 'completed' 
                ? '#43E97B' 
                : activeAreaStyle.borderColor,
              border: `1px solid ${activeItem.status === 'completed' ? 'rgba(67,233,123,0.3)' : 'rgba(255,255,255,0.08)'}`
            }}>
              {activeItem.status === 'completed' ? '✓ Complete' : activeItem.status === 'in-progress' ? '● In Progress' : '○ Pending'}
            </div>
            
            {/* Date Target */}
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
              {activeItem.date}
            </span>
          </div>

          {/* Goal title */}
          <div style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '800', marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span>{activeItem.icon}</span>
            <span>{activeItem.title}</span>
          </div>

          {/* Description */}
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
            {activeItem.content}
          </div>

          {/* Progress Section */}
          <div style={{ padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>⚡ Progress</span>
              <span style={{ fontSize: '11px', color: activeAreaStyle.borderColor, fontWeight: '700' }}>{activeItem.energy}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${activeItem.energy}%`,
                background: `linear-gradient(90deg, ${activeAreaStyle.gradStart}, ${activeAreaStyle.gradEnd})`,
                borderRadius: '3px',
                transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)'
              }}/>
            </div>
          </div>

          {/* Steps List */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Universe Steps
            </div>
            
            {activeItem.steps.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', padding: '4px 0' }}>
                No steps added yet. Add a step below to build path.
              </div>
            ) : (
              activeItem.steps.map(step => (
                <div key={step.id} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)'
                }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleStep(activeItem.id, step.id); }}
                    style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      border: step.completed ? 'none' : '1.5px solid rgba(255,255,255,0.3)',
                      background: step.completed ? activeAreaStyle.borderColor : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', flexShrink: 0, color: '#fff', cursor: 'pointer', outline: 'none'
                    }}
                  >
                    {step.completed ? '✓' : ''}
                  </button>
                  <span style={{
                    fontSize: '13px',
                    color: step.completed ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)',
                    textDecoration: step.completed ? 'line-through' : 'none'
                  }}>
                    {step.title}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Action buttons at bottom */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '18px' }}>
            <button style={{
              flex: 1, padding: '11px',
              background: `linear-gradient(135deg, ${activeAreaStyle.gradStart}, ${activeAreaStyle.gradEnd})`,
              borderBottom: `4px solid ${activeAreaStyle.shadowColor}`,
              borderRadius: '12px', border: 'none',
              color: '#fff', fontSize: '12px', fontWeight: '800',
              cursor: 'pointer'
            }}
              onClick={() => toggleGoal(activeItem.id)}
            >
              {activeItem.status === 'completed' ? 'Mark Incomplete' : 'Complete Goal'}
            </button>
            <button 
              onClick={() => addStep(activeItem.id)}
              style={{
                padding: '11px 14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderBottom: '4px solid rgba(0,0,0,0.3)',
                borderRadius: '12px',
                color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: '600',
                cursor: 'pointer'
              }}
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
              style={{
                padding: '11px 14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderBottom: '4px solid rgba(0,0,0,0.3)',
                borderRadius: '12px',
                color: 'rgba(255,255,255,0.7)', fontSize: '12px',
                cursor: 'pointer'
              }}
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
                padding: '11px 14px',
                background: 'rgba(220,53,69,0.1)',
                border: '1px solid rgba(220,53,69,0.3)',
                borderBottom: '4px solid rgba(0,0,0,0.3)',
                borderRadius: '12px',
                color: 'rgba(220,53,69,0.85)', fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              🗑️
            </button>
          </div>
        </div>
      )}

      {/* ── Add Goal Modal ── */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'rgba(15, 8, 30, 0.96)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '24px',
            padding: '28px',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 40px rgba(167, 139, 250, 0.15)',
            animation: 'fadeUp 0.25s cubic-bezier(0.34,1.56,0.64,1) both'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#FFF', fontWeight: '800', marginBottom: '20px', letterSpacing: '0.01em' }}>
              Create Cosmic Goal
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="What do you want to achieve?"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', fontWeight: '700' }}>
                Which area of life is this?
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(LIFE_AREA_STYLES).filter(([key]) => key !== 'default').map(([key, value]) => {
                  const isSelected = selectedArea === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedArea(key)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '999px',
                        border: isSelected ? `1.5px solid ${value.borderColor}` : '1.5px solid rgba(255,255,255,0.12)',
                        background: isSelected ? value.active : 'rgba(255,255,255,0.04)',
                        color: '#fff',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: isSelected ? `0 0 15px ${value.pulse}` : 'none',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      {value.icon} {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => {
                  if (!newGoalTitle.trim()) return alert("Please enter a goal title!");
                  handleAddGoal(newGoalTitle, selectedArea, true);
                }}
                style={{
                  padding: '14px',
                  background: 'linear-gradient(135deg, #F05A7E, #E83B6A)',
                  borderBottom: '4px solid #9e2847',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(240,90,126,0.3)'
                }}
              >
                ✨ Use AI to build a plan
              </button>
              <button
                onClick={() => {
                  if (!newGoalTitle.trim()) return alert("Please enter a goal title!");
                  handleAddGoal(newGoalTitle, selectedArea, false);
                }}
                style={{
                  padding: '14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderBottom: '4px solid rgba(0,0,0,0.3)',
                  borderRadius: '12px',
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                Add manually instead
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginTop: '4px'
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

