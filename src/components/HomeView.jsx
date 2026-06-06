import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase-config';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export default function HomeView({ user }) {
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
        const progressSnap = await getDocs(query(collection(db, 'user_progress'), where('userId', '==', user.uid)));
        if (!progressSnap.empty) {
          setStreakDays(progressSnap.docs[0].data().streakDays || 0);
        }

        // 2. Fetch recent moods for greeting
        let moodAvg = 0;
        const moodSnap = await getDocs(query(collection(db, 'mood_logs'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(3)));
        if (!moodSnap.empty) {
          const moods = moodSnap.docs.map(d => d.data().score); // assuming 1-10 scale
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
        const vaultSnap = await getDocs(query(collection(db, 'vault_letters'), where('userId', '==', user.uid), where('status', '==', 'sealed'), orderBy('revealDate', 'asc'), limit(1)));
        if (!vaultSnap.empty) {
          setNextVaultLetter({ id: vaultSnap.docs[0].id, ...vaultSnap.docs[0].data() });
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
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Loading...</div>
      </div>
    );
  }

  // Vault Countdown Calculation
  let vaultDays = null;
  if (nextVaultLetter && nextVaultLetter.revealDate) {
    // assuming revealDate is a Firestore timestamp or ISO string
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
          color: 'rgba(255,255,255,0.45)',
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
        className="card-hero"
        style={{
          minHeight: '40vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px 32px',
          borderRadius: '16px',
          marginBottom: '20px',
          position: 'relative'
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
          🎯 Today's Quest
        </div>

        {activeGoal ? (
          <>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              {activeGoal.title}
            </h2>
            <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>
              Focus area: <span style={{ color: 'white' }}>{activeGoal.lifeArea || 'Personal Growth'}</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ background: 'var(--teal)', width: `${activeGoal.progressPercent || 0}%`, height: '100%' }} />
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>
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
                padding: '0 20px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px',
                color: 'var(--gold)', fontWeight: 700, fontSize: '14px'
              }}>
                +15 XP
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '18px', color: 'white', marginBottom: '16px' }}>No active quests</div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '24px' }}>Take a moment to set a new goal.</p>
            <motion.button className="btn-primary" whileHover={{ filter: 'brightness(1.1)' }} whileTap={{ scale: 0.98 }} style={{ padding: '12px 24px' }}>
              Set Goal →
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* 3. STREAK CALLOUT */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px'
        }}
      >
        <span style={{ fontSize: '20px' }}>🔥</span>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>
          {streakDays} DAY STREAK
        </div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
          — You're building momentum.
        </div>
      </motion.div>

      {/* 4. SECONDARY CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        
        {/* Life Balance */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-ghost" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer' }} whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', border: '4px solid var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
            7.2
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '4px' }}>Balance</div>
          <div style={{ fontSize: '15px', color: 'white', fontWeight: 500 }}>Wheel of Life</div>
        </motion.div>

        {/* Vault Countdown */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-default" style={{ padding: '24px', borderRadius: '16px', borderLeft: '4px solid var(--rose)', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '16px' }}>💌 A letter from your past self</div>
          {vaultDays !== null && vaultDays > 0 ? (
            <>
              <div style={{ fontSize: '48px', fontWeight: 300, color: 'white', lineHeight: 1 }}>{vaultDays}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>days until it unlocks</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', marginTop: '16px' }}>"{nextVaultLetter.subject ? nextVaultLetter.subject.substring(0, 20) + '...' : 'A sealed memory...'}"</div>
            </>
          ) : vaultDays !== null && vaultDays <= 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📬</div>
              <div style={{ fontSize: '16px', color: 'white', fontWeight: 500 }}>Letter Ready</div>
              <div style={{ fontSize: '13px', color: 'var(--teal)', marginTop: '4px' }}>Tap to open</div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>📭</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Your vault is empty</div>
            </div>
          )}
        </motion.div>

      </div>

    </div>
  );
}
