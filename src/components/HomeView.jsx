import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase-config';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';

export default function HomeView({ user, setActivePage }) {
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [activeGoal, setActiveGoal] = useState(null);
  const [streakDays, setStreakDays] = useState(0);
  const [nextVaultLetter, setNextVaultLetter] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // 1. Fetch User Progress (for Streak)
        const progressSnap = await getDoc(doc(db, 'user_progress', user.uid));
        if (progressSnap.exists()) {
          setStreakDays(progressSnap.data().streakDays || 0);
        }

        // 2. Fetch recent moods for greeting
        let moodAvg = 0;
        const moodSnap = await getDocs(query(collection(db, 'mood_logs'), where('userId', '==', user.uid)));
        if (!moodSnap.empty) {
          const moodDocs = moodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          moodDocs.sort((a, b) => {
            const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
            const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
            return bTime - aTime;
          });
          const recentMoods = moodDocs.slice(0, 3);
          const moods = recentMoods.map(d => d.score); // assuming 1-10 scale
          moodAvg = moods.reduce((a, b) => a + b, 0) / moods.length;
        }

        // Generate greeting
        const hour = new Date().getHours();
        const timeOfDay = hour < 12 ? 'MORNING' : hour < 18 ? 'AFTERNOON' : 'EVENING';
        const name = user.displayName ? user.displayName.split(' ')[0].toUpperCase() : 'TRAVELER';
        
        if (moodSnap.docs.length >= 3 && moodAvg <= 4) {
          setGreeting("HEY. HOPE TODAY'S A BIT KINDER TO YOU.");
        } else if (streakDays >= 7 && moodAvg >= 7) {
          setGreeting("YOU'RE ON A ROLL. KEEP THIS GOING.");
        } else {
          setGreeting(`GOOD ${timeOfDay}, ${name}`);
        }

        // 3. Fetch active goal
        const goalSnap = await getDocs(query(collection(db, 'goals'), where('userId', '==', user.uid), where('status', '==', 'active'), limit(1)));
        if (!goalSnap.empty) {
          setActiveGoal({ id: goalSnap.docs[0].id, ...goalSnap.docs[0].data() });
        } else {
          setActiveGoal(null); // No active goals
        }

        // 4. Fetch next vault letter
        const vaultSnap = await getDocs(query(collection(db, 'vault_letters'), where('userId', '==', user.uid), where('status', '==', 'sealed')));
        if (!vaultSnap.empty) {
          const vaultDocs = vaultSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          vaultDocs.sort((a, b) => {
            const aTime = a.revealDate?.toDate ? a.revealDate.toDate().getTime() : 0;
            const bTime = b.revealDate?.toDate ? b.revealDate.toDate().getTime() : 0;
            return aTime - bTime;
          });
          setNextVaultLetter(vaultDocs[0]);
        }

      } catch (err) {
        console.error("Failed to fetch Home data:", err);
        // Fallbacks
        setGreeting(`GOOD AFTERNOON, TRAVELER`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, streakDays]);

  if (loading) {
    return (
      <div className="content-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</div>
      </div>
    );
  }

  // Vault Countdown Calculation
  let vaultDays = null;
  if (nextVaultLetter && nextVaultLetter.revealDate) {
    const targetDate = nextVaultLetter.revealDate.toDate ? nextVaultLetter.revealDate.toDate() : new Date(nextVaultLetter.revealDate);
    const diffTime = targetDate.getTime() - new Date().getTime();
    vaultDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="content-wrap" style={{ padding: '32px 24px 80px', maxWidth: '720px', margin: '0 auto' }}>
      
      {/* 1. GREETING */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '24px'
        }}
      >
        {greeting}
      </motion.div>

      {/* 2. TODAY'S QUEST HERO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 30 }}
        className="card"
        style={{
          minHeight: '40vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px 32px',
          borderRadius: 'var(--radius-card, 12px)',
          borderLeft: '4px solid var(--amber)',
          background: '#FFFFFF',
          border: '1px solid rgba(27,31,29,0.08)',
          borderLeftWidth: '4px',
          borderLeftColor: 'var(--amber)',
          marginBottom: '20px',
          position: 'relative',
          opacity: 1
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
          🎯 Today's Focus
        </div>

        {activeGoal ? (
          <>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1B1D1D', fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              {activeGoal.title}
            </h2>
            <div style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
              Focus area: <span style={{ color: '#1B1D1D', fontWeight: 600 }}>{activeGoal.lifeArea || 'Personal Growth'}</span>
            </div>

            <div style={{ background: 'rgba(27,31,29,0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ background: 'var(--teal)', width: `${activeGoal.progressPercent || 0}%`, height: '100%' }} />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
              {activeGoal.progressPercent || 0}% Complete
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.button 
                className="btn-primary"
                whileHover={{ filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.98 }}
                style={{ flex: 1 }}
              >
                ✓ Complete for today
              </motion.button>
              <div style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                padding: '0 20px', background: 'rgba(27,31,29,0.04)', borderRadius: '12px',
                color: 'var(--text-secondary)', fontWeight: 700, fontSize: '14px'
              }}>
                +15 XP
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '18px', color: '#1B1D1D', marginBottom: '16px', fontWeight: 600 }}>No active quests</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Nothing queued. Add a task to a goal, or start your first.</p>
            <motion.button 
              className="btn-primary" 
              whileHover={{ filter: 'brightness(1.1)' }} 
              whileTap={{ scale: 0.98 }} 
              style={{ padding: '12px 24px' }}
              onClick={() => setActivePage('goals')}
            >
              Go to goals
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* 3. STREAK CALLOUT */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ y: -2, backgroundColor: 'rgba(27,31,29,0.04)' }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setActivePage('today')}
        style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-card, 12px)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px',
          cursor: 'pointer',
          border: '1px solid var(--border)',
          transition: 'border-color 0.2s, background-color 0.2s'
        }}
      >
        <span style={{ fontSize: '20px' }}>🔥</span>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1B1D1D' }}>
          {streakDays} DAY STREAK
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          — You're building momentum.
        </div>
      </motion.div>

      {/* 4. SECONDARY CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        
        {/* Life Balance */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }} 
          className="card" 
          style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', opacity: 1, background: '#FFFFFF', border: '1px solid rgba(27,31,29,0.08)' }}
          onClick={() => setActivePage('balance')}
        >
          <div style={{ width: 64, height: 64, borderRadius: '50%', border: '4px solid rgba(27,31,29,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: '#1B1D1D', marginBottom: '16px' }}>
            7.2
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '4px' }}>Balance</div>
          <div style={{ fontSize: '15px', color: '#1B1D1D', fontWeight: 500 }}>Wheel of Life</div>
        </motion.div>

        {/* Vault Countdown */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }} 
          className="card" 
          style={{ padding: '24px', borderLeft: '4px solid var(--rose)', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: 1, background: '#FFFFFF', border: '1px solid rgba(27,31,29,0.08)', borderLeftWidth: '4px', borderLeftColor: 'var(--rose)' }}
          onClick={() => setActivePage('vault')}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '16px' }}>💌 A letter from your past self</div>
          {vaultDays !== null && vaultDays > 0 ? (
            <>
              <div style={{ fontSize: '48px', fontWeight: 300, color: '#1B1D1D', lineHeight: 1 }}>{vaultDays}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>days until it unlocks</div>
              <div style={{ fontSize: '14px', color: '#5C615C', fontStyle: 'italic', marginTop: '16px' }}>"{nextVaultLetter.subject ? nextVaultLetter.subject.substring(0, 20) + '...' : 'A sealed memory...'}"</div>
            </>
          ) : vaultDays !== null && vaultDays <= 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📬</div>
              <div style={{ fontSize: '16px', color: '#1B1D1D', fontWeight: 500 }}>Letter Ready</div>
              <div style={{ fontSize: '13px', color: 'var(--teal)', marginTop: '4px' }}>Tap to open</div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>📭</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Your vault is empty</div>
            </div>
          )}
        </motion.div>

      </div>

    </div>
  );
}
