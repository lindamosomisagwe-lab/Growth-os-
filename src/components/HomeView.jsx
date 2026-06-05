import React from 'react';
import { motion } from 'framer-motion';
import { pageCard } from '../lib/animations';

function AnimatedGreeting({ text }) {
  const words = text.split(' ');
  return (
    <h1 className="page-heading page-greeting" style={{ display: 'flex', gap: '0.25em' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.4,
            delay: i * 0.08,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          style={{ display: 'inline-block' }}
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}

export default function HomeView() {
  const cards = [
    {
      id: 'quest',
      className: 'nb-card home card-focus col-span-2',
      content: (
        <>
          <div className="card-eyebrow">⚔️ Today's Quest</div>
          <h2 className="card-title" style={{ fontSize: '22px', marginBottom: '6px' }}>
            Build the Home View
          </h2>
          <p className="card-body" style={{ color: 'var(--ink-light)' }}>
            Part of: React Refactor
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
            <motion.button
              whileHover={{ scale: 1.02, filter: 'brightness(1.08)' }}
              whileTap={{ scale: 0.96, y: 3 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="btn-primary"
            >
              ✓ Done!
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="btn-secondary"
            >
              ↷ Tomorrow
            </motion.button>
          </div>
        </>
      )
    },
    {
      id: 'balance',
      className: 'nb-card card-balance',
      content: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', border: '4px solid #4FACFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>7.2</div>
          <div>
            <div className="card-eyebrow" style={{ margin: 0 }}>Balance</div>
            <div className="card-title" style={{ fontSize: '15px', margin: 0 }}>Wheel of Life</div>
          </div>
        </div>
      )
    },
    {
      id: 'today',
      className: 'nb-card card-today',
      content: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', border: '4px solid #43E97B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📋</div>
          <div>
            <div className="card-eyebrow" style={{ margin: 0 }}>Today</div>
            <div className="card-title" style={{ fontSize: '15px', margin: 0 }}>Logged Check-in</div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="content-wrap">
      <div className="hud-bar">
        <div>
          <AnimatedGreeting text="Good afternoon." />
          <div className="page-subheading">Monday, June 1</div>
        </div>
        <div className="hud-chips">
          {/* Animated XP logic to come */}
          <div className="hud-chip hud-xp">
            <span className="hud-chip-number">1,240</span>
            <span className="hud-chip-label">XP</span>
          </div>
        </div>
      </div>

      <motion.div
        className="dashboard-grid"
        initial="hidden"
        animate="visible"
      >
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            custom={i}
            variants={pageCard}
            className={card.className}
            whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{ 
              background: '#161622',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderTop: '3px solid var(--color-accent)',
              borderRadius: '24px',
              padding: '24px',
              position: 'relative'
            }}
          >
            {card.content}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
