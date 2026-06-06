import React from 'react';
import { motion } from 'framer-motion';
import { pageCard } from '../lib/animations';

export default function VaultView() {
  const capsules = [
    { id: 1, date: 'May 1, 2026', revealDate: 'June 1, 2026', status: 'unlocked', excerpt: 'I hope by the time you read this...' },
    { id: 2, date: 'June 1, 2026', revealDate: 'Dec 31, 2026', status: 'locked', excerpt: '' }
  ];

  return (
    <div className="content-wrap">
      <div className="hud-bar">
        <div>
          <h1 className="page-heading">Time Vault.</h1>
          <div className="page-subheading">Letters to your future self</div>
        </div>
      </div>
      
      <motion.div initial="hidden" animate="visible" className="dashboard-grid">
        
        <motion.div custom={0} variants={pageCard} className="card card-hero page-card col-span-2" style={{ borderLeftColor: '#A78BFA', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 0 20px rgba(167,139,250,0.2)' }}>
              🔒
            </div>
            <div style={{ flex: 1 }}>
              <div className="card-eyebrow">Vault</div>
              <h2 className="card-title" style={{ fontSize: '20px', marginBottom: '4px' }}>Time Vault</h2>
              <p className="card-body">Write letters to your future self.</p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
            {capsules.map((capsule, i) => (
              <motion.div
                key={capsule.id}
                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(167,139,250,0.15)' }}
                whileTap={{ scale: 0.98 }}
                className="card card-ghost"
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>
                  {capsule.status === 'locked' ? '⏳' : '💌'}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>
                  {capsule.status === 'locked' ? 'Sealed Capsule' : 'Opened Letter'}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: 0 }}>
                  {capsule.status === 'locked' ? `Unlocks: ${capsule.revealDate}` : `Written: ${capsule.date}`}
                </p>
                {capsule.status === 'locked' && (
                  <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '16px', opacity: 0.5 }}>🔒</div>
                )}
              </motion.div>
            ))}

            <motion.div
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px dashed rgba(255,255,255,0.2)',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <div style={{ fontSize: '24px', opacity: 0.5 }}>✍️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Write new letter</div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
