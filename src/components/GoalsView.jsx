import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageCard, expandCollapse, slideUp, fade } from '../lib/animations';

function TaskCheckbox({ done, onToggle }) {
  return (
    <motion.div
      onClick={onToggle}
      animate={done
        ? { backgroundColor: '#F05A7E', borderColor: '#F05A7E' }
        : { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.2)' }
      }
      whileTap={{ scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      style={{ width: 22, height: 22, borderRadius: 6, border: '2px solid',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0 }}
    >
      <AnimatePresence>
        {done && (
          <motion.svg width="12" height="10" viewBox="0 0 12 10">
            <motion.path
              d="M1 5L4.5 8.5L11 1"
              stroke="white" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              exit={{ pathLength: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SubgoalRow({ subgoal, onToggle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '8px' }}>
      <TaskCheckbox done={subgoal.completed} onToggle={onToggle} />
      <span className="card-body" style={{ color: subgoal.completed ? 'var(--text-tertiary)' : 'white', textDecoration: subgoal.completed ? 'line-through' : 'none', margin: 0 }}>
        {subgoal.title}
      </span>
    </div>
  );
}

export default function GoalsView() {
  const [expandedGoalId, setExpandedGoalId] = useState(null);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', area: '', description: '' });

  const [goals, setGoals] = useState([
    {
      id: 'g1', title: 'Learn React Native', icon: '📱', completed: false, status: 'active',
      subgoals: [
        { id: 's1', title: 'Setup Expo environment', completed: true },
        { id: 's2', title: 'Build navigation shell', completed: false },
        { id: 's3', title: 'Connect Firebase Auth', completed: false }
      ]
    },
    {
      id: 'g2', title: 'Run a 5K', icon: '🏃', completed: false, status: 'active',
      subgoals: [
        { id: 's4', title: 'Buy running shoes', completed: true },
        { id: 's5', title: 'Run 1K without stopping', completed: false }
      ]
    }
  ]);

  const activeGoal = goals.find(g => g.id === expandedGoalId);

  const toggleSubgoal = (goalId, subgoalId) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      return {
        ...g,
        subgoals: g.subgoals.map(s => 
          s.id === subgoalId ? { ...s, completed: !s.completed } : s
        )
      };
    }));
  };

  const handleAddGoal = () => {
    if (!newGoal.title) return;
    const goal = {
      id: 'g' + Date.now(),
      title: newGoal.title,
      icon: newGoal.area === 'Physical Health' ? '💪' 
            : newGoal.area === 'Career & Finances' ? '💼' 
            : newGoal.area === 'Mental Health' ? '🧠' 
            : newGoal.area === 'Relationships' ? '❤️' 
            : newGoal.area === 'Life Vision' ? '🧭' 
            : newGoal.area === 'Personal Dev.' ? '🌱' 
            : newGoal.area === 'Spirituality' ? '✨' 
            : newGoal.area === 'Creativity' ? '🎨' 
            : '🎯',
      completed: false,
      status: 'active',
      subgoals: []
    };
    setGoals([...goals, goal]);
    setIsAddingGoal(false);
    setNewGoal({ title: '', area: '', description: '' });
  };

  const areas = [
    'Mental Health',
    'Physical Health',
    'Career & Finances',
    'Life Vision',
    'Personal Dev.',
    'Spirituality',
    'Creativity',
    'Relationships'
  ];

  return (
    <div className="content-wrap">
      <div className="hud-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Goals Map.</h1>
          <div className="text-meta" style={{ marginTop: '4px' }}>Chapter 1 — Foundation</div>
        </div>
        <button className="btn-primary" onClick={() => setIsAddingGoal(true)}>+ Add Goal</button>
      </div>

      <motion.div initial="hidden" animate="visible" className="dashboard-grid">
        <motion.div custom={0} variants={pageCard} className="card card-hero page-card col-span-2" style={{ borderLeftColor: '#F05A7E', padding: 24 }}>
          <div className="card-eyebrow">◎ Your Map</div>
          
          <div style={{ display: 'flex', gap: '20px', padding: '20px 0', flexWrap: 'wrap' }}>
            {goals.map(goal => (
              <motion.div
                key={goal.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setExpandedGoalId(goal.id)}
                style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'rgba(240,90,126,0.1)',
                  border: `2px solid #F05A7E`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px', cursor: 'pointer'
                }}
              >
                {goal.icon}
              </motion.div>
            ))}
          </div>

        </motion.div>
      </motion.div>

      {/* Goal Details Bottom Sheet */}
      <AnimatePresence>
        {expandedGoalId && activeGoal && (
          <>
            <motion.div
              variants={fade}
              initial="hidden" animate="visible" exit="exit"
              onClick={() => setExpandedGoalId(null)}
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', zIndex:499 }}
            />
            <motion.div
              variants={slideUp}
              initial="hidden" animate="visible" exit="exit"
              style={{ position:'fixed', bottom:0, left: '240px', right:0, background:'#13131f', borderRadius:'24px 24px 0 0', zIndex:500, padding:'32px', maxHeight:'75vh', overflowY:'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <span style={{ fontSize: '40px' }}>{activeGoal.icon}</span>
                <h2 className="page-title" style={{ margin: 0 }}>{activeGoal.title}</h2>
              </div>
              
              <div>
                <AnimatePresence>
                  {activeGoal.subgoals.map((sg, i) => (
                    <motion.div
                      key={sg.id}
                      custom={i}
                      layout
                      variants={expandCollapse}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <SubgoalRow subgoal={sg} onToggle={() => toggleSubgoal(activeGoal.id, sg.id)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, marginTop: '16px', cursor: 'pointer' }}
              >
                + Add Subgoal
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {isAddingGoal && (
          <div style={{ position:'fixed', inset:0, zIndex:599, display: 'flex', alignItems: 'center', justifyContent: 'center', background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: -1 }} onClick={() => setIsAddingGoal(false)} />
            <motion.div
              variants={slideUp}
              initial="hidden" animate="visible" exit="exit"
              className="card card-default modal"
              style={{ width: '90%', maxWidth: '400px', padding:'32px', position: 'relative' }}
            >
              <h2 className="card-title" style={{ marginBottom: '16px', fontSize: '20px' }}>Create New Goal</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div className="card-eyebrow">Goal Title</div>
                  <input 
                    autoFocus
                    placeholder="e.g. Read 10 books"
                    value={newGoal.title}
                    onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px', borderRadius: '8px', outline: 'none' }}
                  />
                </div>
                
                <div>
                  <div className="card-eyebrow">Life Area</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {areas.map(area => (
                      <div 
                        key={area}
                        onClick={() => setNewGoal({...newGoal, area})}
                        style={{ padding: '6px 12px', borderRadius: '999px', fontSize: '13px', cursor: 'pointer', border: '1px solid', borderColor: newGoal.area === area ? '#FF6B35' : 'rgba(255,255,255,0.2)', background: newGoal.area === area ? 'rgba(255,107,53,0.1)' : 'transparent', color: newGoal.area === area ? '#FF6B35' : 'white' }}
                      >
                        {area}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="card-eyebrow">Description (Optional)</div>
                  <textarea 
                    rows={3}
                    placeholder="Why is this important?"
                    value={newGoal.description}
                    onChange={e => setNewGoal({...newGoal, description: e.target.value})}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px', borderRadius: '8px', outline: 'none', resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsAddingGoal(false)}>Cancel</button>
                  <button className="btn-primary" style={{ flex: 1 }} onClick={handleAddGoal} disabled={!newGoal.title}>Create Goal</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
