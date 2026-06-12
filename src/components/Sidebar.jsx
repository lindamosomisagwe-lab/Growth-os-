import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Home, Scale, Target, Calendar, Lock, Settings } from 'lucide-react';

const navItems = [
  { id: 'home',    icon: Home,     label: 'Home' },
  { id: 'balance', icon: Scale,    label: 'Balance' },
  { id: 'goals',   icon: Target,   label: 'Goals' },
  { id: 'today',   icon: Calendar, label: 'Today' },
  { id: 'vault',   icon: Lock,     label: 'Vault' },
];

export default function Sidebar({ activePage, setActivePage, user }) {
  const reduce = useReducedMotion();

  // Avatar initial logic
  const initial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : 
                 (user?.email ? user.email.charAt(0).toUpperCase() : 'U');
  
  const hasPhoto = user?.photoURL;
  const isUrl = (str) => str && (str.startsWith('http') || str.startsWith('/'));

  return (
    <aside className="sidebar">
      {/* Brand logo at the top */}
      <div style={{
        padding: '12px 12px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '8px'
      }}>
        {/* Growth Compass Logo SVG */}
        <svg width="36" height="36" viewBox="0 0 32 32" fill="none" style={{ marginBottom: '16px', display: 'block' }}>
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B35" />
              <stop offset="100%" stopColor="#FF8E53" />
            </linearGradient>
          </defs>
          <path d="M16 2L30 10V22L16 30L2 22V10L16 2Z" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M16 2V30" stroke="url(#logoGrad)" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M2 10H30" stroke="url(#logoGrad)" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx="16" cy="16" r="6" fill="url(#logoGrad)" />
          <circle cx="16" cy="16" r="3" fill="#0a0a10" />
        </svg>

        {/* Wordmark */}
        <div style={{
          fontSize: '20px',
          fontWeight: '800',
          color: '#FFFFFF',
          letterSpacing: '-0.02em',
          lineHeight: 1
        }}>
          Chapter
        </div>
        <div style={{
          fontSize: '10px',
          color: '#FFFFFF',
          opacity: 0.8,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginTop: '6px'
        }}>
          your story is being written
        </div>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1, marginTop: '12px' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <div 
              key={item.id} 
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
              style={{ 
                position: 'relative',
                zIndex: 1,
                fontWeight: isActive ? 600 : 400
              }}
            >
              {/* Sliding background pill */}
              {isActive && !reduce && (
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
              {isActive && !reduce && (
                <motion.div
                  layoutId="nav-active-bar"
                  style={{
                    position: 'absolute', left: -4, top: '20%', bottom: '20%',
                    width: 3, borderRadius: '0 2px 2px 0',
                    background: 'var(--amber)'
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Fallback for reduced motion */}
              {isActive && reduce && (
                <>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'rgba(255,255,255,0.08)', zIndex: -1 }} />
                  <div style={{ position: 'absolute', left: -4, top: '20%', bottom: '20%', width: 3, borderRadius: '0 3px 3px 0', background: 'var(--amber)' }} />
                </>
              )}

              <Icon size={20} style={{ opacity: isActive ? 1 : 0.75 }} />
              <span className="sidebar-label" style={{ color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.6)' }}>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Profile & Settings Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
        {/* Avatar / Profile Link */}
        <motion.div 
          onClick={() => setActivePage('profile')}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.04)' }}
          whileTap={{ scale: 0.98 }}
          style={{ 
            cursor: 'pointer', 
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            borderRadius: '12px',
            background: activePage === 'profile' ? 'rgba(255,255,255,0.06)' : 'transparent'
          }}
          title="View profile"
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)', fontWeight: 700, fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: activePage === 'profile' ? '0 0 0 2px var(--amber)' : 'none'
          }}>
            {hasPhoto && isUrl(user?.photoURL) ? (
              <img src={user.photoURL} alt="Avatar" style={{ width:'100%', height:'100%' }} />
            ) : (
              user?.photoURL || initial
            )}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 500, color: activePage === 'profile' ? '#FFFFFF' : 'rgba(255,255,255,0.6)' }}>Profile</span>
        </motion.div>

        {/* Settings */}
        <motion.div 
          onClick={() => setActivePage('settings')}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.04)' }}
          whileTap={{ scale: 0.98 }}
          style={{ 
            cursor: 'pointer', 
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            borderRadius: '12px',
            background: activePage === 'settings' ? 'rgba(255,255,255,0.06)' : 'transparent'
          }}
          title="Settings"
        >
          <Settings size={20} style={{ opacity: activePage === 'settings' ? 1 : 0.75, color: 'white', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', fontWeight: 500, color: activePage === 'settings' ? '#FFFFFF' : 'rgba(255,255,255,0.6)' }}>Settings</span>
        </motion.div>
      </div>
    </aside>
  );
}
