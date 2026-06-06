import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';



const navItems = [
  { id: 'home',    icon: '⊞', label: 'Home' },
  { id: 'balance', icon: '⚖', label: 'Balance' },
  { id: 'goals',   icon: '◎', label: 'Goals' },
  { id: 'today',   icon: '▦', label: 'Today' },
  { id: 'vault',   icon: '▣', label: 'Vault' },
];

export default function Sidebar({ activePage, setActivePage, user }) {
  const reduce = useReducedMotion();

  // Avatar initial logic
  const initial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : 
                 (user?.email ? user.email.charAt(0).toUpperCase() : 'U');
  
  const hasPhoto = user?.photoURL;

  return (
    <aside className="sidebar">
      {/* Brand logo at the top */}
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid rgba(232,224,213,0.07)',
        marginBottom: '8px'
      }}>
        {/* Wheel mark — SVG */}
        <svg width="28" height="28" viewBox="0 0 64 64"
          style={{ marginBottom: '8px' }}>
          <polygon
            points="32,4 52,12 60,32 52,52 32,60 12,52 4,32 12,12"
            fill="rgba(255,107,53,0.15)"
            stroke="#FF6B35"
            strokeWidth="2"
          />
          <circle cx="32" cy="4" r="3.5" fill="#FF6B35"/>
          <circle cx="60" cy="32" r="3.5" fill="#FF6B35"/>
          <circle cx="32" cy="60" r="3.5" fill="#FF6B35"/>
          <circle cx="4" cy="32" r="3.5" fill="#FF6B35"/>
          <circle cx="52" cy="12" r="2.5" fill="rgba(255,107,53,0.5)"/>
          <circle cx="52" cy="52" r="2.5" fill="rgba(255,107,53,0.5)"/>
          <circle cx="12" cy="52" r="2.5" fill="rgba(255,107,53,0.5)"/>
          <circle cx="12" cy="12" r="2.5" fill="rgba(255,107,53,0.5)"/>
        </svg>

        {/* Wordmark */}
        <div style={{
          fontSize: '17px',
          fontWeight: '700',
          color: '#E8E0D5',
          letterSpacing: '-0.02em',
          lineHeight: 1
        }}>
          Chapter
        </div>
        <div style={{
          fontSize: '10px',
          color: 'rgba(232,224,213,0.28)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginTop: '3px'
        }}>
          your story is being written
        </div>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1, marginTop: '20px' }}>
        {navItems.map(item => (
          <div 
            key={item.id} 
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
            style={{ 
              position: 'relative',
              flexDirection: 'column', 
              gap: '4px',
              height: '56px',
              marginBottom: '4px',
              zIndex: 1,
              fontWeight: activePage === item.id ? 600 : 400
            }}
          >
            {/* Sliding background pill */}
            {activePage === item.id && !reduce && (
              <motion.div
                layoutId="nav-active-bg"
                style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.06)',
                  zIndex: -1
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}

            {/* Sliding left accent bar */}
            {activePage === item.id && !reduce && (
              <motion.div
                layoutId="nav-active-bar"
                style={{
                  position: 'absolute', left: -8, top: '20%', bottom: '20%',
                  width: 2, borderRadius: '0 2px 2px 0',
                  background: 'var(--amber)'
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}

            {/* Fallback for reduced motion */}
            {activePage === item.id && reduce && (
              <>
                <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'rgba(232,224,213,0.08)', zIndex: -1 }} />
                <div style={{ position: 'absolute', left: -8, top: '20%', bottom: '20%', width: 3, borderRadius: '0 3px 3px 0', background: 'var(--amber)' }} />
              </>
            )}

            <span style={{ fontSize: '18px', display: 'block', marginTop: '4px' }}>{item.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Avatar / Profile Link */}
      <motion.div 
        onClick={() => setActivePage('profile')}
        whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
        whileTap={{ scale: 0.95 }}
        style={{ 
          cursor: 'pointer', 
          marginBottom: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px'
        }}
        title="View profile"
      >
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--bg-card)',
          color: 'var(--text-primary)', fontWeight: 700, fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: activePage === 'profile' ? '0 0 0 2px var(--amber)' : 'none'
        }}>
          {hasPhoto ? <img src={user.photoURL} alt="Avatar" style={{ width:'100%', height:'100%' }} /> : initial}
        </div>
        <span style={{ fontSize: '10px', fontWeight: 500, color: activePage === 'profile' ? 'var(--text-primary)' : 'var(--text-muted)' }}>Profile</span>
      </motion.div>

      {/* Settings */}
      <div 
        className={`sidebar-settings ${activePage === 'settings' ? 'active' : ''}`}
        onClick={() => setActivePage('settings')}
        style={{ position: 'relative', flexDirection: 'column', height: '56px', gap: '4px' }}
      >
        <span style={{ fontSize: '18px', marginTop: '4px' }}>⚙️</span>
        <span style={{ fontSize: '10px', fontWeight: 500, color: activePage === 'settings' ? '#fff' : 'rgba(255,255,255,0.5)' }}>Settings</span>
      </div>
    </aside>
  );
}
