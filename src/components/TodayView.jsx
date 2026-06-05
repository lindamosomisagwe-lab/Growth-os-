import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageCard } from '../lib/animations';

export default function TodayView() {
  const [glasses, setGlasses] = useState(Array(8).fill(false));
  const [selectedMood, setSelectedMood] = useState(null);

  const toggleGlass = (index) => {
    setGlasses(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const filledCount = glasses.filter(Boolean).length;

  const moods = [
    { id: 'happy',   emoji: '😊', label: 'Happy',   selectedBg: 'rgba(254,214,35,0.18)',  borderColor: '#FED623' },
    { id: 'content', emoji: '😌', label: 'Content', selectedBg: 'rgba(67,233,123,0.18)',  borderColor: '#43E97B' },
    { id: 'neutral', emoji: '😐', label: 'Neutral', selectedBg: 'rgba(79,172,254,0.18)',  borderColor: '#4FACFE' },
    { id: 'sad',     emoji: '😢', label: 'Sad',     selectedBg: 'rgba(167,139,250,0.18)', borderColor: '#A78BFA' },
    { id: 'angry',   emoji: '😠', label: 'Angry',   selectedBg: 'rgba(240,90,126,0.18)',  borderColor: '#F05A7E' }
  ];

  return (
    <div className="content-wrap">
      <div className="hud-bar">
        <div>
          <h1 className="page-heading">Today's Log.</h1>
          <div className="page-subheading">Check in, track your day</div>
        </div>
      </div>
      
      <motion.div initial="hidden" animate="visible" className="dashboard-grid">
        {/* Hydration Tracker */}
        <motion.div custom={0} variants={pageCard} className="nb-card col-span-2" style={{ background: '#161622', padding: 24, borderRadius: 24, borderTop: '3px solid #4FACFE' }}>
          <div className="card-eyebrow">💧 Hydration</div>
          <h2 className="card-title" style={{ fontSize: '20px', marginBottom: '16px' }}>Water Intake</h2>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {glasses.map((filled, i) => (
              <motion.div
                key={i}
                onClick={() => toggleGlass(i)}
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  border: `2px solid ${filled ? '#4FACFE' : 'rgba(255,255,255,0.15)'}`,
                  background: filled ? 'rgba(79,172,254,0.15)' : 'transparent',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {!filled && <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '20px' }}>💧</span>}
                <AnimatePresence>
                  {filled && (
                    <motion.div
                      initial={{ y: '100%' }}
                      animate={{ y: '0%' }}
                      exit={{ y: '100%', transition: { duration: 0.2 } }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%',
                        background: 'rgba(79,172,254,0.8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <span style={{ color: 'white', fontSize: '20px' }}>💧</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {filledCount} of 8 glasses logged
          </div>
        </motion.div>

        {/* Mood Tracker */}
        <motion.div custom={1} variants={pageCard} className="nb-card col-span-2" style={{ background: '#161622', padding: 24, borderRadius: 24, borderTop: '3px solid #7a5c8b' }}>
          <div className="card-eyebrow">🧠 Mood</div>
          <h2 className="card-title" style={{ fontSize: '20px', marginBottom: '16px' }}>How are you feeling?</h2>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {moods.map(mood => (
              <motion.button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                animate={selectedMood === mood.id
                  ? { scale: 1.05, backgroundColor: mood.selectedBg, borderColor: mood.borderColor }
                  : { scale: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }
                }
                whileHover={selectedMood !== mood.id ? { scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' } : {}}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  padding: '16px', borderRadius: '16px', border: '2px solid',
                  cursor: 'pointer', outline: 'none', color: 'white',
                  opacity: selectedMood && selectedMood !== mood.id ? 0.5 : 1,
                  filter: selectedMood && selectedMood !== mood.id ? 'grayscale(0.5)' : 'none'
                }}
              >
                <motion.span
                  animate={selectedMood === mood.id ? { scale: 1.3 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  style={{ display: 'inline-block', fontSize: '28px' }}
                >
                  {mood.emoji}
                </motion.span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{mood.label}</span>
              </motion.button>
            ))}
          </div>

          {selectedMood && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '20px' }}>
              <motion.button
                whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.96 }}
                className="btn-primary"
              >
                ✓ Log Mood
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
