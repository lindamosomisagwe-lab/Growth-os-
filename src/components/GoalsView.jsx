import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageCard, expandCollapse, slideUp, fade } from '../lib/animations';
import { db } from '../firebase-config';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

const CATEGORY_STYLES = {
  mental_health:        { color: '#7a5c8b', rgb: '122,92,139' },
  physical_health:      { color: '#5c7a5c', rgb: '92,122,92' },
  career_finances:      { color: '#c9a96e', rgb: '201,169,110' },
  life_vision:          { color: '#5c8fa8', rgb: '92,143,168' },
  personal_development: { color: '#8b3a2a', rgb: '139,58,42' },
  spirituality:         { color: '#8b7a3a', rgb: '139,122,58' },
  creativity:           { color: '#5c8a8a', rgb: '92,138,138' },
  relationships:        { color: '#a8745c', rgb: '168,116,92' },
  default:              { color: '#FF6B35', rgb: '255,107,53' }
};

function TaskCheckbox({ done, onToggle }) {
  return (
    <motion.div
      onClick={onToggle}
      animate={done
        ? { backgroundColor: 'var(--teal)', borderColor: 'var(--teal)' }
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
              stroke="#1B1F3B" strokeWidth="2.5"
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
      <span className="card-body" style={{ color: subgoal.completed ? 'var(--text-secondary)' : 'white', textDecoration: subgoal.completed ? 'line-through' : 'none', margin: 0, fontSize: '14px' }}>
        {subgoal.title}
      </span>
    </div>
  );
}

export default function GoalsView({ user }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGoalId, setExpandedGoalId] = useState(null);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', area: '', description: '' });
  const [newSubgoalTitle, setNewSubgoalTitle] = useState('');
  const [isAddingSubgoal, setIsAddingSubgoal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchGoalsAndSubgoals();
  }, [user]);

  const fetchGoalsAndSubgoals = async () => {
    try {
      setLoading(true);
      // Fetch active goals
      const goalsSnap = await getDocs(query(collection(db, 'goals'), where('userId', '==', user.uid), where('status', '==', 'active')));
      const subgoalsSnap = await getDocs(query(collection(db, 'subgoals'), where('userId', '==', user.uid)));
      
      const subgoalsList = subgoalsSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      const goalsList = goalsSnap.docs.map(d => {
        const goalData = d.data();
        const goalId = d.id;
        
        // Match subgoals for this goal
        const matchedSubgoals = subgoalsList.filter(s => s.goalId === goalId);
        
        // Map category IDs to emojis
        const iconMap = {
          mental_health: '🧠',
          physical_health: '💪',
          career_finances: '💼',
          life_vision: '🧭',
          personal_development: '🌱',
          spirituality: '✨',
          creativity: '🎨',
          relationships: '❤️'
        };
        
        const areaKey = goalData.lifeArea ? goalData.lifeArea.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_') : 'other';
        const icon = iconMap[areaKey] || '🎯';

        return {
          id: goalId,
          icon,
          ...goalData,
          subgoals: matchedSubgoals
        };
      });

      setGoals(goalsList);
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    } finally {
      setLoading(false);
    }
  };

  const activeGoal = goals.find(g => g.id === expandedGoalId);

  const toggleSubgoal = async (goalId, subgoalId, currentCompleted) => {
    try {
      const subgoalRef = doc(db, 'subgoals', subgoalId);
      await updateDoc(subgoalRef, {
        completed: !currentCompleted
      });
      // Update local state directly
      setGoals(prev => prev.map(g => {
        if (g.id !== goalId) return g;
        return {
          ...g,
          subgoals: g.subgoals.map(s => 
            s.id === subgoalId ? { ...s, completed: !s.completed } : s
          )
        };
      }));
    } catch (err) {
      console.error("Failed to toggle subgoal completed:", err);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.title || !user) return;
    try {
      await addDoc(collection(db, 'goals'), {
        userId: user.uid,
        title: newGoal.title,
        lifeArea: newGoal.area || 'Personal Growth',
        description: newGoal.description || '',
        status: 'active',
        progressPercent: 0,
        tier: 1,
        createdAt: serverTimestamp()
      });
      setIsAddingGoal(false);
      setNewGoal({ title: '', area: '', description: '' });
      fetchGoalsAndSubgoals();
    } catch (err) {
      console.error("Failed to create new goal:", err);
    }
  };

  const handleAddSubgoalSubmit = async (e) => {
    e.preventDefault();
    if (!newSubgoalTitle.trim() || !expandedGoalId || !user) return;
    try {
      await addDoc(collection(db, 'subgoals'), {
        userId: user.uid,
        goalId: expandedGoalId,
        title: newSubgoalTitle.trim(),
        completed: false,
        createdAt: serverTimestamp()
      });
      setNewSubgoalTitle('');
      setIsAddingSubgoal(false);
      fetchGoalsAndSubgoals();
    } catch (err) {
      console.error("Failed to add subgoal:", err);
    }
  };

  const areas = [
    'Mental Health',
    'Physical Health',
    'Career & Finances',
    'Life Vision',
    'Personal Development',
    'Spirituality',
    'Creativity',
    'Relationships'
  ];

  // Group goals by category
  const categories = {};
  goals.forEach(goal => {
    // Standardize category labels
    let areaName = goal.lifeArea || 'Other';
    if (areaName === 'mental_health') areaName = 'Mental Health';
    else if (areaName === 'physical_health') areaName = 'Physical Health';
    else if (areaName === 'career_finances') areaName = 'Career & Finances';
    else if (areaName === 'life_vision') areaName = 'Life Vision';
    else if (areaName === 'personal_development') areaName = 'Personal Development';
    else if (areaName === 'spirituality') areaName = 'Spirituality';
    else if (areaName === 'creativity') areaName = 'Creativity';
    else if (areaName === 'relationships') areaName = 'Relationships';

    if (!categories[areaName]) categories[areaName] = [];
    categories[areaName].push(goal);
  });

  if (loading && goals.length === 0) {
    return (
      <div className="content-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading Goals Map...</div>
      </div>
    );
  }

  return (
    <div className="content-wrap" style={{ paddingBottom: '80px' }}>
      <div className="hud-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '32px', fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", color: '#1B1D1D', margin: 0 }}>Goals Map.</h1>
          <div className="text-meta" style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '13px' }}>Chapter 1 — Foundation</div>
        </div>
        <button className="btn-primary" onClick={() => setIsAddingGoal(true)} style={{ padding: '10px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>+ Add Goal</button>
      </div>

      {goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', border: '1px dashed rgba(27,31,29,0.15)', borderRadius: '16px', marginTop: '20px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.5 }}>🎯</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#1B1D1D' }}>No active goals found</div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '24px' }}>Write down your first target goal.</div>
          <button className="btn-primary" onClick={() => setIsAddingGoal(true)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Create your first goal
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
          {Object.keys(categories).map(catName => (
            <motion.div
              key={catName}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '24px'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--amber)', marginBottom: '16px', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>◎</span> {catName}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {categories[catName].map(goal => {
                  const completedCount = goal.subgoals.filter(s => s.completed).length;
                  const totalCount = goal.subgoals.length;
                  const blurb = totalCount > 0 
                    ? `${completedCount} of ${totalCount} step${totalCount > 1 ? 's' : ''} completed`
                    : 'No steps added yet';

                  const areaKey = goal.lifeArea ? goal.lifeArea.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_') : 'default';
                  const catStyle = CATEGORY_STYLES[areaKey] || CATEGORY_STYLES.default;

                  return (
                    <motion.div
                      key={goal.id}
                      whileHover={{ scale: 1.02, backgroundColor: 'var(--bg-card-2)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setExpandedGoalId(goal.id)}
                      style={{
                        background: 'rgba(27,31,29,0.02)',
                        border: '1px solid rgba(27,31,29,0.06)',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: `rgba(${catStyle.rgb}, 0.1)`,
                        border: `1px solid rgba(${catStyle.rgb}, 0.35)`,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px', flexShrink: 0
                      }}>
                        {goal.icon}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1B1D1D', margin: '0 0 4px' }}>{goal.title}</h4>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{blurb}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Goal Details Bottom Sheet */}
      <AnimatePresence>
        {expandedGoalId && activeGoal && (
          <>
            <motion.div
              variants={fade}
              initial="hidden" animate="visible" exit="exit"
              onClick={() => {
                setExpandedGoalId(null);
                setIsAddingSubgoal(false);
              }}
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)', zIndex:499 }}
            />
            {(() => {
              const areaKey = activeGoal.lifeArea ? activeGoal.lifeArea.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_') : 'default';
              const catStyle = CATEGORY_STYLES[areaKey] || CATEGORY_STYLES.default;
              return (
                <motion.div
                  variants={slideUp}
                  initial="hidden" animate="visible" exit="exit"
                  style={{ 
                    position:'fixed', 
                    bottom:0, 
                    left: isMobile ? 0 : '240px', 
                    right:0, 
                    background:'#FFFFFF', 
                    borderRadius:'24px 24px 0 0', 
                    zIndex:500, 
                    padding:'32px', 
                    maxHeight:'75vh', 
                    overflowY:'auto', 
                    boxShadow: '0 -8px 24px rgba(27,31,29,0.06)',
                    borderTop: `3px solid ${catStyle.color}` 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: `rgba(${catStyle.rgb}, 0.1)`,
                        border: `1px solid rgba(${catStyle.rgb}, 0.35)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '28px', flexShrink: 0
                      }}>
                        {activeGoal.icon}
                      </div>
                      <div>
                        <h2 className="page-title" style={{ margin: 0, fontSize: '22px', color: '#1B1D1D', fontFamily: "'Playfair Display', Georgia, serif" }}>{activeGoal.title}</h2>
                        {activeGoal.description && (
                          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0', fontStyle: 'italic' }}>
                            "{activeGoal.description}"
                          </p>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setExpandedGoalId(null);
                        setIsAddingSubgoal(false);
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'rgba(27,31,29,0.4)', cursor: 'pointer', fontSize: '24px' }}
                    >
                      &times;
                    </button>
                  </div>
                  
                  <div style={{ marginTop: '16px' }}>
                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '12px' }}>Steps Checklist</h4>
                    
                    <AnimatePresence mode="popLayout">
                      {activeGoal.subgoals.length === 0 ? (
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '12px 0' }}>
                          No steps defined for this goal yet. Add one below!
                        </div>
                      ) : (
                        activeGoal.subgoals.map((sg, i) => (
                          <motion.div
                            key={sg.id}
                            custom={i}
                            layout
                            variants={expandCollapse}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                          >
                            <SubgoalRow subgoal={sg} onToggle={() => toggleSubgoal(activeGoal.id, sg.id, sg.completed)} />
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>

                  {isAddingSubgoal ? (
                    <form onSubmit={handleAddSubgoalSubmit} style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                      <input
                        type="text"
                        autoFocus
                        placeholder="Enter step name... (e.g. Draft outline)"
                        value={newSubgoalTitle}
                        onChange={e => setNewSubgoalTitle(e.target.value)}
                        style={{ flex: 1, background: 'rgba(27,31,29,0.01)', border: '1px solid rgba(27,31,29,0.12)', color: '#1B1D1D', padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '14px' }}
                        required
                      />
                      <button type="submit" className="btn-primary" style={{ padding: '0 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Save</button>
                      <button type="button" className="btn-secondary" onClick={() => setIsAddingSubgoal(false)} style={{ padding: '0 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Cancel</button>
                    </form>
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsAddingSubgoal(true)}
                      className="btn-secondary"
                      style={{ width: '100%', marginTop: '16px', borderRadius: '12px', borderStyle: 'dashed' }}
                    >
                      + Add Step
                    </motion.button>
                  )}
                </motion.div>
              );
            })()}
          </>
        )}
      </AnimatePresence>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {isAddingGoal && (
          <div style={{ position:'fixed', inset:0, zIndex:599, display: 'flex', alignItems: 'center', justifyContent: 'center', background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)', padding: '24px' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: -1 }} onClick={() => setIsAddingGoal(false)} />
            <motion.div
              variants={slideUp}
              initial="hidden" animate="visible" exit="exit"
              className="card modal"
              style={{ width: '90%', maxWidth: '420px', padding:'32px', background: '#FFFFFF', border: '1px solid rgba(27,31,29,0.08)', position: 'relative', opacity: 1, y: 0 }}
            >
              <h2 className="card-title" style={{ marginBottom: '20px', fontSize: '20px', color: '#1B1D1D', fontWeight: 700 }}>Create New Goal</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div className="card-eyebrow" style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase' }}>Goal Title</div>
                  <input 
                    autoFocus
                    placeholder="e.g. Run 10K without stopping"
                    value={newGoal.title}
                    onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                    style={{ width: '100%', background: 'rgba(27,31,29,0.01)', border: '1px solid rgba(27,31,29,0.12)', color: '#1B1D1D', padding: '12px', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                
                <div>
                  <div className="card-eyebrow" style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase' }}>Life Area</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                    {areas.map(area => (
                      <div 
                        key={area}
                        onClick={() => setNewGoal({...newGoal, area})}
                        style={{ 
                          padding: '8px 10px', 
                          borderRadius: '8px', 
                          fontSize: '12px', 
                          cursor: 'pointer', 
                          border: '1px solid', 
                          textAlign: 'center',
                          borderColor: newGoal.area === area ? 'var(--amber)' : 'rgba(27,31,29,0.1)', 
                          background: newGoal.area === area ? '#E6ECE8' : 'rgba(27,31,29,0.02)', 
                          color: newGoal.area === area ? 'var(--amber)' : '#1B1D1D',
                          transition: 'all 0.15s ease',
                          fontWeight: newGoal.area === area ? 600 : 400
                        }}
                      >
                        {area}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="card-eyebrow" style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase' }}>Description (Optional)</div>
                  <textarea 
                    rows={3}
                    placeholder="Why is this goal important to you?"
                    value={newGoal.description}
                    onChange={e => setNewGoal({...newGoal, description: e.target.value})}
                    style={{ width: '100%', background: 'rgba(27,31,29,0.01)', border: '1px solid rgba(27,31,29,0.12)', color: '#1B1D1D', padding: '12px', borderRadius: '8px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button className="btn-secondary" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer' }} onClick={() => setIsAddingGoal(false)}>Cancel</button>
                  <button className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }} onClick={handleAddGoal} disabled={!newGoal.title}>Create Goal</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
