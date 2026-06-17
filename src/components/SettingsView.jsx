import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebase-config';
import { signOut, deleteUser, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, query, where, writeBatch } from 'firebase/firestore';

const SettingsSectionLabel = ({ children, danger }) => (
  <div style={{
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: danger ? 'rgba(239,68,68,0.75)' : 'var(--text-secondary)',
    marginBottom: '4px',
    marginTop: '32px',
    padding: '0 4px'
  }}>
    {children}
  </div>
);

const Chevron = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4l4 4-4 4"
      stroke="rgba(255,255,255,0.25)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Toggle = ({ value, onChange }) => (
  <div 
    className={`toggle-track ${value ? 'on' : ''}`}
    onClick={(e) => { e.stopPropagation(); onChange(!value); }}
    style={{
      width: '44px',
      height: '24px',
      borderRadius: '999px',
      background: value ? '#7C5CFC' : 'rgba(255,255,255,0.1)',
      border: `1px solid ${value ? '#7C5CFC' : 'rgba(255,255,255,0.12)'}`,
      position: 'relative',
      cursor: 'pointer',
      transition: 'background 0.2s ease, border-color 0.2s ease'
    }}
  >
    <div 
      className="toggle-thumb"
      style={{
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        background: 'white',
        position: 'absolute',
        top: '2px',
        left: '2px',
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        transform: value ? 'translateX(20px)' : 'translateX(0px)'
      }}
    />
  </div>
);

const SettingsRow = ({ icon, title, subtitle, right, onClick, danger, noHover }) => (
  <motion.div
    onClick={onClick}
    whileHover={noHover || !onClick ? {} : { backgroundColor: 'rgba(255,255,255,0.03)' }}
    whileTap={onClick && !noHover ? { scale: 0.99 } : {}}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '14px 4px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      cursor: onClick ? 'pointer' : 'default',
      borderRadius: '6px',
    }}
  >
    {icon && (
      <div style={{
        fontSize: '16px',
        width: '20px',
        textAlign: 'center',
        flexShrink: 0,
        opacity: danger ? 0.7 : 0.6,
        color: danger ? 'rgba(239,68,68,1)' : 'inherit'
      }}>
        {icon}
      </div>
    )}
    
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: '14px',
        fontWeight: '500',
        color: danger ? 'rgba(239,68,68,0.8)' : 'rgba(255,255,255,0.85)',
        letterSpacing: '-0.01em'
      }}>
        {title}
      </div>
      {subtitle && (
        <div style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          marginTop: '2px'
        }}>
          {subtitle}
        </div>
      )}
    </div>
    
    {right && (
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {right}
      </div>
    )}
  </motion.div>
);

export default function SettingsPage({ user }) {
  const [prefs, setPrefs] = useState({
    reducedMotion: false,
    compactView: false,
    showXP: true,
    dailyReminder: false,
    reminderTime: '20:00',
    streakAlerts: true,
    vaultAlerts: true
  });
  
  const [showEditName, setShowEditName] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [showSignOut, setShowSignOut] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Load preferences
  useEffect(() => {
    if (!user) return;
    const loadPrefs = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'preferences', 'settings');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setPrefs(prev => ({ ...prev, ...data }));
          if (data.reducedMotion) {
            document.documentElement.setAttribute('data-reduced-motion', 'true');
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    loadPrefs();
  }, [user]);

  const savePref = async (key, value) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    
    if (key === 'reducedMotion') {
      if (value) document.documentElement.setAttribute('data-reduced-motion', 'true');
      else document.documentElement.removeAttribute('data-reduced-motion');
    }

    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'preferences', 'settings'), newPrefs, { merge: true });
    } catch (err) {
      console.error("Failed to save pref:", err);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim() || !user) return;
    try {
      await updateProfile(user, { displayName: newName });
      setShowEditName(false);
      // Optional: sync to user document in Firestore if needed.
    } catch (err) {
      console.error("Update name error", err);
    }
  };

  const exportData = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      const collections = [
        'goals', 'subgoals', 'tasks',
        'mood_logs', 'wheel_scores',
        'vault_letters', 'user_progress',
        'xp_events', 'daily_logs'
      ];
      
      const data = {};
      for (const col of collections) {
        const snap = await getDocs(query(collection(db, col), where('userId', '==', user.uid)));
        data[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chapter-export-${Date.now()}.json`;
      a.click();
    } catch (err) {
      console.error("Export error", err);
    } finally {
      setIsExporting(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      const collections = [
        'goals', 'subgoals', 'tasks', 'mood_logs',
        'wheel_scores', 'vault_letters', 'user_progress',
        'xp_events', 'daily_logs'
      ];
      
      for (const col of collections) {
        const snap = await getDocs(query(collection(db, col), where('userId', '==', user.uid)));
        const batch = writeBatch(db);
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
      
      // Delete user settings
      const prefsRef = doc(db, 'users', user.uid, 'preferences', 'settings');
      await writeBatch(db).delete(prefsRef).commit();

      const onboardRef = doc(db, 'users', user.uid, 'onboarding', 'status');
      await writeBatch(db).delete(onboardRef).commit();
      
      await deleteUser(user); // Triggers re-render in App.js
    } catch (err) {
      console.error("Delete account error", err);
      // In a real app we might prompt them to re-authenticate if token is stale
      alert("Failed to delete account. You may need to log in again and retry.");
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px 80px' }}>
      <h1 className="page-title">Settings</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic', marginTop: '4px' }}>
        Manage your account and preferences
      </p>

      {/* ACCOUNT */}
      <SettingsSectionLabel>Account</SettingsSectionLabel>
      <motion.div
        onClick={() => setShowEditName(true)}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
        whileTap={{ scale: 0.99 }}
        style={{
          display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 4px',
          borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', borderRadius: '6px'
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: '50%', background: '#7C5CFC',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, color: 'white', fontSize: '18px'
        }}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
          ) : (
            (user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>{user?.displayName || 'User'}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user?.email}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 2 }}>Member since {new Date(user?.metadata?.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--amber)', cursor: 'pointer' }}>
          Edit →
        </div>
      </motion.div>

      <SettingsRow icon="↪" title="Sign out" onClick={() => setShowSignOut(true)} />

      {/* NOTIFICATIONS */}
      <SettingsSectionLabel>Notifications</SettingsSectionLabel>
      <SettingsRow 
        title="Daily reminder" subtitle="Remind me to check in each day"
        right={<Toggle value={prefs.dailyReminder} onChange={v => savePref('dailyReminder', v)} />} 
        onClick={() => savePref('dailyReminder', !prefs.dailyReminder)}
      />
      <SettingsRow 
        title="Reminder time" subtitle="When should we remind you?"
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="time" 
              value={prefs.reminderTime} 
              onChange={e => savePref('reminderTime', e.target.value)}
              style={{
                background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)',
                fontSize: '14px', outline: 'none', cursor: 'pointer'
              }}
            />
            <Chevron />
          </div>
        } 
      />
      <SettingsRow 
        title="Streak alerts" subtitle="Notify me before I lose my streak"
        right={<Toggle value={prefs.streakAlerts} onChange={v => savePref('streakAlerts', v)} />} 
        onClick={() => savePref('streakAlerts', !prefs.streakAlerts)}
      />
      <SettingsRow 
        title="Vault unlocks" subtitle="Alert when a letter is ready to open"
        right={<Toggle value={prefs.vaultAlerts} onChange={v => savePref('vaultAlerts', v)} />} 
        onClick={() => savePref('vaultAlerts', !prefs.vaultAlerts)}
      />

      {/* DATA & PRIVACY */}
      <SettingsSectionLabel>Data & Privacy</SettingsSectionLabel>
      <SettingsRow icon="📤" title={isExporting ? "Exporting..." : "Export my data"} subtitle="Download everything as JSON" right={<Chevron />} onClick={exportData} />
      <SettingsRow icon="🔒" title="Privacy policy" subtitle="How we handle your data" right={<Chevron />} onClick={() => window.open('/privacy', '_blank')} />
      <SettingsRow icon="📜" title="Terms of service" subtitle="Your rights and our rules" right={<Chevron />} onClick={() => window.open('/terms', '_blank')} />
      <SettingsRow title="Chapter" subtitle="Built with care ✦" right={<span style={{color:'var(--text-secondary)',fontSize:'13px'}}>v1.0.0</span>} noHover />

      {/* DANGER ZONE */}
      <SettingsSectionLabel danger>Danger Zone</SettingsSectionLabel>
      <SettingsRow icon="🗑" title="Delete account" subtitle="Permanently delete all your data" danger onClick={() => setShowDelete(true)} />

      {/* MODALS */}
      <AnimatePresence>
        {showEditName && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', padding: 24, borderRadius: 16, width: '90%', maxWidth: 360 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600 }}>Edit display name</h3>
              <input value={newName} onChange={e => setNewName(e.target.value)} autoFocus style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: 14, borderRadius: 10, color: 'white', marginBottom: 20, outline: 'none' }} />
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowEditName(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleUpdateName} style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: '#7C5CFC', color: 'white', cursor: 'pointer' }}>Save</button>
              </div>
            </motion.div>
          </div>
        )}

        {showSignOut && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', padding: 24, borderRadius: 16, width: '90%', maxWidth: 360, textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600 }}>Sign out of Chapter?</h3>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button onClick={() => setShowSignOut(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => signOut(auth)} style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}>Sign out</button>
              </div>
            </motion.div>
          </div>
        )}

        {showDelete && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} style={{ background: '#13131f', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '32px 24px', borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%', maxWidth: 640 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 600 }}>Delete your account?</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginBottom: 16 }}>This will permanently delete:</p>
              <ul style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', paddingLeft: 20, marginBottom: 24, lineHeight: 1.6 }}>
                <li>All your goals and progress</li>
                <li>Your mood history</li>
                <li>Your vault letters (cannot be recovered)</li>
                <li>Your XP and streak data</li>
              </ul>
              
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Type DELETE to confirm:</div>
              <input value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: 14, borderRadius: 10, color: 'white', marginBottom: 24, outline: 'none' }} />
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowDelete(false)} style={{ flex: 1, padding: 14, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                <button 
                  onClick={deleteAccount} 
                  disabled={deleteConfirmText !== 'DELETE'}
                  style={{ 
                    flex: 1, padding: 14, borderRadius: 10, border: 'none', 
                    background: deleteConfirmText === 'DELETE' ? '#ef4444' : 'rgba(239,68,68,0.3)', 
                    color: 'white', cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed', 
                    fontWeight: 600, boxShadow: deleteConfirmText === 'DELETE' ? '0 3px 0 #991b1b' : 'none' 
                  }}
                >
                  Delete permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {import.meta.env.DEV && (
        <div style={{ marginTop: '40px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '12px' }}>🛠️ Offline Database Debug Panel</h3>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <strong>Mock User Session:</strong>
            <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px', overflowX: 'auto', marginTop: '4px', color: 'white', fontFamily: 'monospace' }}>
              {JSON.stringify(JSON.parse(localStorage.getItem('firebase_mock_user') || 'null'), null, 2)}
            </pre>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            <strong>Mock database storage (localStorage):</strong>
            <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px', overflowX: 'auto', marginTop: '4px', color: 'white', fontFamily: 'monospace' }}>
              {JSON.stringify(JSON.parse(localStorage.getItem('firebase_mock_db') || 'null'), null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
