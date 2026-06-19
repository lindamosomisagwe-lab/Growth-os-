import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Home, Scale, Target, Calendar, Lock, Settings } from 'lucide-react';

const navItems = [
  { id: 'home',    icon: Home,     label: 'Home' },
  { id: 'balance', icon: Scale,    label: 'Balance' },
  { id: 'goals',   icon: Target,   label: 'Goals' },
  { id: 'today',   icon: Calendar, label: 'Check-in' },
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
        borderBottom: '1px solid rgba(27,31,29,0.08)',
        marginBottom: '8px'
      }}>
        {/* Wordmark */}
        <div style={{
          fontSize: '22px',
          fontWeight: '700',
          fontFamily: "'Playfair Display', Georgia, serif",
          color: '#1B1D1D',
          letterSpacing: '-0.02em',
          lineHeight: 1
        }}>
          Chapter
        </div>
        <div style={{
          fontSize: '10px',
          color: '#8C918C',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginTop: '6px',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500
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
                    background: '#E6ECE8',
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
                  <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: '#E6ECE8', zIndex: -1 }} />
                  <div style={{ position: 'absolute', left: -4, top: '20%', bottom: '20%', width: 3, borderRadius: '0 3px 3px 0', background: 'var(--amber)' }} />
                </>
              )}

              <Icon size={20} style={{ opacity: isActive ? 1 : 0.75, color: isActive ? '#1B1D1D' : '#5C615C' }} />
              <span className="sidebar-label" style={{ color: isActive ? '#1B1D1D' : '#5C615C' }}>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Profile & Settings Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(27,31,29,0.08)', paddingTop: '16px' }}>
        {/* Avatar / Profile Link */}
        <motion.div 
          onClick={() => setActivePage('profile')}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(27,31,29,0.04)' }}
          whileTap={{ scale: 0.98 }}
          style={{ 
            cursor: 'pointer', 
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            borderRadius: '12px',
            background: activePage === 'profile' ? '#E6ECE8' : 'transparent'
          }}
          title="View profile"
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--bg-app)',
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
          <span style={{ fontSize: '13px', fontWeight: 500, color: activePage === 'profile' ? '#1B1D1D' : '#5C615C' }}>Profile</span>
        </motion.div>

        {/* Settings */}
        <motion.div 
          onClick={() => setActivePage('settings')}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(27,31,29,0.04)' }}
          whileTap={{ scale: 0.98 }}
          style={{ 
            cursor: 'pointer', 
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            borderRadius: '12px',
            background: activePage === 'settings' ? '#E6ECE8' : 'transparent'
          }}
          title="Settings"
        >
          <Settings size={20} style={{ opacity: activePage === 'settings' ? 1 : 0.75, color: activePage === 'settings' ? '#1B1D1D' : '#5C615C', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', fontWeight: 500, color: activePage === 'settings' ? '#1B1D1D' : '#5C615C' }}>Settings</span>
        </motion.div>
      </div>
    </aside>
  );
}
