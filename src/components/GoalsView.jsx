import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageCard, expandCollapse, slideUp, fade, listItem } from '../lib/animations';

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
      <span style={{ fontSize: '14px', color: subgoal.completed ? 'var(--text-tertiary)' : 'white', textDecoration: subgoal.completed ? 'line-through' : 'none' }}>
        {subgoal.title}
      </span>
    </div>
  );
}

export default function GoalsView() {
  const [expandedGoalId, setExpandedGoalId] = useState(null);

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
      id: 'g2', title: 'Run a 5K', icon: '🏃', completed: false, status: 'locked',
      subgoals: []
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

  return (
    <div className="content-wrap">
      <div className="hud-bar">
        <div>
          <h1 className="page-heading">Goals Map.</h1>
          <div className="page-subheading">Chapter 1 — Foundation</div>
        </div>
      </div>

      <motion.div initial="hidden" animate="visible" className="dashboard-grid">
        <motion.div custom={0} variants={pageCard} className="nb-card col-span-2" style={{ background: '#161622', padding: 24, borderRadius: 24, borderTop: '3px solid #F05A7E' }}>
          <div className="card-eyebrow">◎ Your Map</div>
          
          <div style={{ display: 'flex', gap: '20px', padding: '20px 0' }}>
            {goals.map(goal => (
              <motion.div
                key={goal.id}
                whileHover={goal.status === 'active' ? { scale: 1.05 } : {}}
                whileTap={goal.status === 'active' ? { scale: 0.95 } : {}}
                onClick={() => goal.status === 'active' && setExpandedGoalId(goal.id)}
                style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: goal.status === 'locked' ? 'rgba(255,255,255,0.05)' : 'rgba(240,90,126,0.1)',
                  border: `2px ${goal.status === 'locked' ? 'dashed rgba(255,255,255,0.2)' : 'solid #F05A7E'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px', cursor: goal.status === 'active' ? 'pointer' : 'default',
                  opacity: goal.status === 'locked' ? 0.5 : 1
                }}
              >
                {goal.status === 'locked' ? '🔒' : goal.icon}
              </motion.div>
            ))}
          </div>

        </motion.div>
      </motion.div>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {expandedGoalId && activeGoal && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={fade}
              initial="hidden" animate="visible" exit="exit"
              onClick={() => setExpandedGoalId(null)}
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', zIndex:499 }}
            />

            {/* Bottom sheet */}
            <motion.div
              variants={slideUp}
              initial="hidden" animate="visible" exit="exit"
              style={{ position:'fixed', bottom:0, left: '68px', right:0, background:'#161622', borderRadius:'24px 24px 0 0', zIndex:500, padding:'32px', maxHeight:'75vh', overflowY:'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <span style={{ fontSize: '40px' }}>{activeGoal.icon}</span>
                <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>{activeGoal.title}</h2>
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
    </div>
  );
}
