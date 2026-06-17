import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageCard } from '../lib/animations';
import { db } from '../firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function WaterDropIcon({ filled }) {
  return (
    <svg width="24" height="32" viewBox="0 0 24 32" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="dropGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#00C6FF" />
          <stop offset="100%" stopColor="#4FACFE" />
        </linearGradient>
      </defs>
      <path
        d="M12 2 C12 2 21 13.5 21 19.5 C21 24.7 16.9 29 12 29 C7.1 29 3 24.7 3 19.5 C3 13.5 12 2 12 2 Z"
        fill={filled ? "url(#dropGrad)" : "rgba(79, 172, 254, 0.08)"}
        stroke={filled ? "#4FACFE" : "rgba(232, 224, 213, 0.25)"}
        strokeWidth="2"
        style={{ transition: 'fill 0.35s ease, stroke 0.35s ease' }}
      />
    </svg>
  );
}

export default function TodayView({ user }) {
  const [glasses, setGlasses] = useState(Array(8).fill(false));
  const [selectedMood, setSelectedMood] = useState(null);
  const [isLogging, setIsLogging] = useState(false);
  const [logMessage, setLogMessage] = useState('');

  const toggleGlass = (index) => {
    setGlasses(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const filledCount = glasses.filter(Boolean).length;

  const moods = [
    { id: 'happy',   emoji: '😊', label: 'Happy',   className: 'mood-happy' },
    { id: 'content', emoji: '😌', label: 'Content', className: 'mood-content' },
    { id: 'neutral', emoji: '😐', label: 'Neutral', className: 'mood-neutral' },
    { id: 'sad',     emoji: '😢', label: 'Sad',     className: 'mood-sad' },
    { id: 'angry',   emoji: '😠', label: 'Angry',   className: 'mood-angry' }
  ];

  const handleLogMood = async () => {
    if (!selectedMood) return;
    if (!user) {
      setLogMessage('You must be logged in to log your mood.');
      return;
    }
    setIsLogging(true);
    setLogMessage('');
    try {
      const scoreMap = {
        happy: 10,
        content: 8,
        neutral: 5,
        sad: 3,
        angry: 1
      };
      
      await addDoc(collection(db, 'mood_logs'), {
        userId: user.uid,
        score: scoreMap[selectedMood] || 5,
        mood: selectedMood,
        createdAt: serverTimestamp()
      });
      
      setLogMessage('Mood logged successfully! ✨');
      setSelectedMood(null);
      setTimeout(() => setLogMessage(''), 3000);
    } catch (err) {
      console.error('Error logging mood:', err);
      setLogMessage('Failed to log mood. Please check database permissions.');
    } finally {
      setIsLogging(false);
    }
  };

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
        <motion.div custom={0} variants={pageCard} className="card card-default page-card col-span-2" style={{ padding: 24 }}>
          <div className="card-eyebrow">💧 Hydration</div>
          <h2 className="card-title" style={{ marginBottom: '16px' }}>Water Intake</h2>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {glasses.map((filled, i) => (
              <motion.div
                key={i}
                onClick={() => toggleGlass(i)}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                style={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  padding: '4px'
                }}
              >
                <WaterDropIcon filled={filled} />
              </motion.div>
            ))}
          </div>
          <div className="text-meta">
            {filledCount} of 8 glasses logged
          </div>
        </motion.div>

        {/* Mood Tracker */}
        <motion.div custom={1} variants={pageCard} className="card card-default page-card col-span-2" style={{ padding: 24 }}>
          <div className="card-eyebrow">🧠 Mood</div>
          <h2 className="card-title" style={{ marginBottom: '16px' }}>How are you feeling?</h2>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {moods.map(mood => (
              <motion.button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`mood-btn ${mood.className} ${selectedMood === mood.id ? 'selected' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  padding: '16px',
                  cursor: 'pointer', outline: 'none',
                  color: selectedMood === mood.id ? '#1B1F3B' : 'white'
                }}
              >
                <motion.span style={{ display: 'inline-block', fontSize: '28px' }}>
                  {mood.emoji}
                </motion.span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: selectedMood === mood.id ? '#1B1F3B' : 'var(--text-secondary)' }}>{mood.label}</span>
              </motion.button>
            ))}
          </div>

          {selectedMood && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
              <motion.button
                whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.96 }}
                className="btn-primary"
                onClick={handleLogMood}
                disabled={isLogging}
                style={{ opacity: isLogging ? 0.7 : 1 }}
              >
                {isLogging ? 'Logging...' : '✓ Log Mood'}
              </motion.button>
            </motion.div>
          )}

          {logMessage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '16px', fontSize: '14px', fontWeight: 600, color: logMessage.includes('Failed') || logMessage.includes('must') ? 'var(--rose)' : 'var(--teal)' }}>
              {logMessage}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
