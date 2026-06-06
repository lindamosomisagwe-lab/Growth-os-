import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const NAV_COLORS = {
  home:    '#7C5CFC',
  balance: '#4FACFE',
  goals:   '#F05A7E',
  today:   '#43E97B',
  vault:   '#A78BFA'
};

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
      <div style={{ padding: '0 12px', marginBottom: '24px' }}>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '15px',
          fontWeight: '700',
          color: '#ffffff',
          letterSpacing: '-0.02em'
        }}>
          Growth OS
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '10px',
          fontWeight: '400',
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginTop: '2px'
        }}>
          Your story is being written
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
              height: '56px', // taller to fit label
              marginBottom: '4px',
              zIndex: 1
            }}
          >
            {/* Sliding background pill */}
            {activePage === item.id && !reduce && (
              <motion.div
                layoutId="nav-active-bg"
                style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.08)',
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
                  width: 3, borderRadius: '0 3px 3px 0',
                  background: NAV_COLORS[item.id],
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}

            {/* Fallback for reduced motion */}
            {activePage === item.id && reduce && (
              <>
                <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'rgba(255,255,255,0.08)', zIndex: -1 }} />
                <div style={{ position: 'absolute', left: -8, top: '20%', bottom: '20%', width: 3, borderRadius: '0 3px 3px 0', background: NAV_COLORS[item.id] }} />
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
          background: 'linear-gradient(135deg, #7C5CFC, #5B3FD4)',
          color: 'white', fontWeight: 700, fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: activePage === 'profile' ? '0 0 0 2px #7C5CFC' : 'none'
        }}>
          {hasPhoto ? <img src={user.photoURL} alt="Avatar" style={{ width:'100%', height:'100%' }} /> : initial}
        </div>
        <span style={{ fontSize: '10px', fontWeight: 500, color: activePage === 'profile' ? '#fff' : 'rgba(255,255,255,0.5)' }}>Profile</span>
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
