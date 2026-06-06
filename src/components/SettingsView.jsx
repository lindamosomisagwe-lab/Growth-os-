import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageCard, slideUp, fade } from '../lib/animations';

export default function SettingsView({ user }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const initial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'T';
  const hasPhoto = user?.photoURL;

  return (
    <div className="content-wrap">
      <div className="hud-bar">
        <div>
          <h1 className="page-title">Settings.</h1>
          <div className="text-meta" style={{ marginTop: '4px' }}>Manage your preferences</div>
        </div>
      </div>

      <motion.div initial="hidden" animate="visible" className="dashboard-grid">
        
        {/* Account Section */}
        <motion.div custom={0} variants={pageCard} className="card card-default page-card col-span-2" style={{ padding: 24 }}>
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Account</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #7C5CFC, #5B3FD4)',
              color: 'white', fontWeight: 800, fontSize: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {hasPhoto ? <img src={user.photoURL} alt="Avatar" style={{ width:'100%', height:'100%' }} /> : initial}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>{user?.displayName || 'Traveler'}</div>
              <div className="text-meta">{user?.email || 'No email associated'}</div>
            </div>
          </div>
          <button className="btn-secondary" style={{ width: '100%', borderColor: 'rgba(255,255,255,0.1)' }}>Sign out</button>
        </motion.div>

        {/* Preferences Section */}
        <motion.div custom={1} variants={pageCard} className="card card-default page-card col-span-2" style={{ padding: 24 }}>
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Preferences</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: 'white', marginBottom: '4px' }}>Daily Notifications</div>
                <div className="text-meta">Reminders to log your check-ins</div>
              </div>
              <motion.div 
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                style={{ width: 44, height: 24, borderRadius: 12, background: notificationsEnabled ? '#43E97B' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', padding: 2 }}
              >
                <motion.div 
                  animate={{ x: notificationsEnabled ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{ width: 20, height: 20, borderRadius: 10, background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                />
              </motion.div>
            </div>

            <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: 'white', marginBottom: '4px' }}>Reduced Motion</div>
                <div className="text-meta">Minimize interface animations</div>
              </div>
              <motion.div 
                onClick={() => setReducedMotion(!reducedMotion)}
                style={{ width: 44, height: 24, borderRadius: 12, background: reducedMotion ? '#7C5CFC' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', padding: 2 }}
              >
                <motion.div 
                  animate={{ x: reducedMotion ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{ width: 20, height: 20, borderRadius: 10, background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Data Section */}
        <motion.div custom={2} variants={pageCard} className="card card-default page-card col-span-2" style={{ padding: 24 }}>
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Data & Privacy</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}>
              📄 Export my data
            </button>
            
            <button 
              className="btn-secondary" 
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              style={{ width: '100%', justifyContent: 'flex-start', border: '1px solid rgba(240,90,126,0.2)', color: '#F05A7E', background: showDeleteConfirm ? 'rgba(240,90,126,0.1)' : 'transparent' }}
            >
              ⚠️ Delete Account
            </button>
            
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: '16px', background: 'rgba(240,90,126,0.1)', borderRadius: '8px', border: '1px solid rgba(240,90,126,0.2)', marginTop: '8px' }}>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                      This action is permanent and cannot be undone. All your check-ins, goals, and vault capsules will be erased.
                    </p>
                    <button style={{ width: '100%', background: '#F05A7E', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                      Yes, delete my account
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div custom={3} variants={pageCard} className="card card-ghost page-card col-span-2" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>Growth OS</div>
          <div className="text-meta" style={{ marginBottom: '16px' }}>Version 1.0.0 (Build 42)</div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '13px' }}>
            <a href="#" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Privacy Policy</a>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <a href="#" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
