import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { pageCard } from '../lib/animations';
import { auth } from '../firebase-config';
import { updateProfile } from 'firebase/auth';

function AnimatedXP({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, v => Math.round(v));

  React.useEffect(() => {
    const controls = animate(count, value, {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

function AnimatedProgressBar({ percent, color }) {
  return (
    <div style={{ height: 6, background: 'rgba(27,31,29,0.06)', borderRadius: 3, overflow: 'hidden', width: '100%' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ height: '100%', background: color, borderRadius: 3 }}
      />
    </div>
  );
}

export default function ProfileView({ user }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || 'Traveler');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.photoURL || '');

  const characters = [
    { id: 'wizard', emoji: '🧙‍♂️', label: 'Wizard' },
    { id: 'ninja',  emoji: '🥷', label: 'Ninja' },
    { id: 'astro',  emoji: '🚀', label: 'Astronaut' },
    { id: 'scholar',emoji: '🦊', label: 'Scholar' },
    { id: 'dragon', emoji: '🐉', label: 'Dragon' }
  ];

  const handleSelectAvatar = async (emoji) => {
    setSelectedAvatar(emoji);
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { photoURL: emoji });
      } catch (err) {
        console.error("Failed to update avatar:", err);
      }
    }
  };

  const handleSaveName = async () => {
    setIsEditingName(false);
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: displayName });
      } catch (err) {
        console.error("Failed to update name:", err);
      }
    }
  };

  const stats = {
    streak: 12,
    xp: 1240,
    goals: 4,
    daysLogged: 14
  };

  const currentChapterXP = 1240;
  const nextChapterXP = 2000;
  const progressPercent = Math.min((currentChapterXP / nextChapterXP) * 100, 100);

  const chapters = [
    { name: 'The Beginning', emoji: '🌱', xpRequired: 0, status: 'current', desc: 'Access to goals map & daily mood logs.' },
    { name: 'Finding Your Footing', emoji: '🌿', xpRequired: 2000, status: 'locked', desc: 'Unlocks Time Vault & letters to your future self.' },
    { name: 'Building Momentum', emoji: '🔥', xpRequired: 5000, status: 'locked', desc: 'Unlocks AI goal architect & habit-building guides.' },
    { name: 'The Architect', emoji: '🏛️', xpRequired: 10000, status: 'locked', desc: 'Unlocks analytics reports & custom UI theme templates.' }
  ];

  const initial = displayName.charAt(0).toUpperCase();
  const hasPhoto = user?.photoURL;
  const isUrl = (str) => str && (str.startsWith('http') || str.startsWith('/'));

  return (
    <div className="content-wrap" style={{ paddingBottom: '80px' }}>
      <div className="hud-bar">
        <div>
          <h1 className="page-heading" style={{ fontSize: '32px', fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", color: '#1B1D1D', margin: 0 }}>You.</h1>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Your Character Sheet</div>
        </div>
      </div>

      <motion.div initial="hidden" animate="visible" className="dashboard-grid">
        
        {/* Identity Card */}
        <motion.div 
          custom={0} 
          variants={pageCard} 
          className="card" 
          style={{ 
            background: '#FFFFFF',
            border: '1px solid rgba(27,31,29,0.08)',
            borderLeft: '4px solid var(--amber)',
            padding: 32, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '24px' 
          }}
        >
          <div style={{
            width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
            background: '#E6ECE8',
            color: 'var(--amber)', fontWeight: 800, fontSize: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', border: '1px solid rgba(96,122,102,0.2)'
          }}>
            {hasPhoto && isUrl(user?.photoURL) ? (
              <img src={user.photoURL} alt="Avatar" style={{ width:'100%', height:'100%' }} />
            ) : (
              user?.photoURL || initial
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              {isEditingName ? (
                <input 
                  type="text" 
                  value={displayName} 
                  onChange={e => setDisplayName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                  style={{ background: 'rgba(27,31,29,0.02)', border: '1px solid rgba(27,31,29,0.15)', color: '#1B1D1D', fontSize: '24px', fontWeight: 700, borderRadius: '6px', padding: '2px 8px', outline: 'none' }}
                />
              ) : (
                <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, cursor: 'pointer', color: '#1B1D1D', fontFamily: "'Playfair Display', Georgia, serif" }} onClick={() => setIsEditingName(true)} title="Click to edit">
                  {displayName}'s Journey <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>✏️</span>
                </h2>
              )}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {user?.email || 'No email associated'}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Member since June 2026</span>
              <span style={{ background: '#E6ECE8', color: '#607A66', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, border: '1px solid rgba(96,122,102,0.2)' }}>
                🌱 Chapter 1: The Beginning
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div custom={1} variants={pageCard} className="col-span-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          
          <div className="card stat-chip" style={{ background: '#FFFFFF', border: '1px solid rgba(27,31,29,0.08)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>🔥</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#1B1D1D' }}>{stats.streak}</div>
              <div style={{ margin: 0, color: '#FF6B6B', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Day Streak</div>
            </div>
          </div>
          
          <div className="card stat-chip" style={{ background: '#FFFFFF', border: '1px solid rgba(27,31,29,0.08)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>⚡</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#1B1D1D' }}><AnimatedXP value={stats.xp} /></div>
              <div style={{ margin: 0, color: '#F9D423', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total XP</div>
            </div>
          </div>
          
          <div className="card stat-chip" style={{ background: '#FFFFFF', border: '1px solid rgba(27,31,29,0.08)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>🏆</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#1B1D1D' }}>{stats.goals}</div>
              <div style={{ margin: 0, color: '#43E97B', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Goals Completed</div>
            </div>
          </div>
          
          <div className="card stat-chip" style={{ background: '#FFFFFF', border: '1px solid rgba(27,31,29,0.08)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>📋</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#1B1D1D' }}>{stats.daysLogged}</div>
              <div style={{ margin: 0, color: '#4FACFE', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Days Logged</div>
            </div>
          </div>

        </motion.div>

        {/* Character Avatar Picker */}
        <motion.div custom={1.5} variants={pageCard} className="card col-span-2" style={{ background: '#FFFFFF', border: '1px solid rgba(27,31,29,0.08)', padding: 24 }}>
          <div className="card-eyebrow" style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>🦊 Choose Your Character</div>
          <h3 className="card-title" style={{ marginBottom: '16px', color: '#1B1D1D' }}>Select profile avatar</h3>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {characters.map(char => (
              <motion.button
                key={char.id}
                onClick={() => handleSelectAvatar(char.emoji)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  padding: '16px',
                  borderRadius: '16px',
                  background: selectedAvatar === char.emoji ? '#E6ECE8' : 'rgba(27,31,29,0.02)',
                  border: `2px solid ${selectedAvatar === char.emoji ? 'var(--amber)' : 'rgba(27,31,29,0.08)'}`,
                  cursor: 'pointer', outline: 'none', color: '#1B1D1D', minWidth: '90px'
                }}
              >
                <span style={{ fontSize: '32px' }}>{char.emoji}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{char.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* XP Progress & Chapters */}
        <motion.div custom={2} variants={pageCard} className="card col-span-2" style={{ background: '#FFFFFF', border: '1px solid rgba(27,31,29,0.08)', padding: 24 }}>
          <div className="card-eyebrow" style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>📖 Journey</div>
          
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#1B1D1D' }}>🌱 The Beginning</span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                <strong style={{ color: '#1B1D1D' }}>{currentChapterXP}</strong> / {nextChapterXP} XP
              </span>
            </div>
            <AnimatedProgressBar percent={progressPercent} color="linear-gradient(90deg, #607A66, #8C918C)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 600 }}>Chapter Unlocks</h3>
            
            {chapters.map((ch, i) => (
              <div key={i} style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', 
                padding: '12px 16px', borderRadius: '12px',
                background: ch.status === 'current' ? '#E6ECE8' : 'rgba(27,31,29,0.01)',
                border: ch.status === 'current' ? '1px solid rgba(96,122,102,0.35)' : '1px solid rgba(27,31,29,0.06)',
                opacity: 1
              }}>
                <div style={{ fontSize: '20px', filter: ch.status === 'locked' ? 'grayscale(1)' : 'none' }}>{ch.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: ch.status === 'locked' ? 'var(--text-secondary)' : '#1B1D1D' }}>{ch.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{ch.desc}</div>
                  <div style={{ fontSize: '11px', color: ch.status === 'locked' ? 'var(--text-secondary)' : 'var(--text-muted)', marginTop: '4px' }}>{ch.xpRequired > 0 ? `${ch.xpRequired} XP required` : 'Unlocked'}</div>
                </div>
                {ch.status === 'locked' && <div style={{ fontSize: '16px', opacity: 0.5 }}>🔒</div>}
                {ch.status === 'current' && <div style={{ fontSize: '12px', fontWeight: 600, color: '#607A66' }}>CURRENT</div>}
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
