import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageCard } from '../lib/animations';
import { db } from '../firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className={`hydration-drop ${filled ? 'filled' : ''}`}
                style={{
                  fontSize: '40px',
                  lineHeight: 1,
                  userSelect: 'none'
                }}
              >
                💧
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
                whileTap={{ scale: 0.94 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  padding: '16px',
                  cursor: 'pointer', outline: 'none', color: 'white'
                }}
              >
                <motion.span style={{ display: 'inline-block', fontSize: '28px' }}>
                  {mood.emoji}
                </motion.span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{mood.label}</span>
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
