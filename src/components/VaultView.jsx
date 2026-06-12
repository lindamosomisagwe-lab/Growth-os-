import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase-config';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';

const VaultDoorDial = () => (
  <div style={{
    position: 'relative',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #2E345A 0%, #15182B 70%)',
    border: '6px solid #C9A84C', // Gold outer ring
    boxShadow: '0 8px 24px rgba(0,0,0,0.6), inset 0 4px 12px rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      whileHover={{ rotate: [null, 180, 0], transition: { duration: 1.5, ease: 'easeInOut' } }}
      style={{
        width: '76px',
        height: '76px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #E8E0D5 10%, #70778A 80%)', // Metallic finish
        border: '3px solid #1B1F3B',
        boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
        position: 'relative',
        cursor: 'pointer'
      }}
    >
      {/* Vault spokes */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
        <div key={angle} style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '28px',
          height: '4px',
          background: '#4A4F63',
          borderRadius: '2px',
          transformOrigin: 'left center',
          transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(20px)`
        }} />
      ))}
      {/* Center cap */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '26px',
        height: '26px',
        borderRadius: '50%',
        background: '#C9A84C',
        border: '2px solid #1B1F3B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.4)'
      }}>
        🔒
      </div>
    </motion.div>
  </div>
);

export default function VaultView({ user }) {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null); // For reading
  
  // Write Form State
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [revealDateStr, setRevealDateStr] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchLetters();
  }, [user]);

  const fetchLetters = async () => {
    try {
      const q = query(
        collection(db, 'vault_letters'), 
        where('userId', '==', user.uid)
      );
      const snap = await getDocs(q);
      const fetched = snap.docs.map(d => {
        const data = d.data();
        // Check if a sealed letter has reached its reveal date
        const target = data.revealDate?.toDate ? data.revealDate.toDate() : new Date(data.revealDate);
        let status = data.status;
        if (status === 'sealed' && new Date() >= target) {
          status = 'ready'; // it's time to open!
        }
        return { id: d.id, ...data, computedStatus: status, targetDate: target };
      });
      // Sort in memory by revealDate descending (bypassing composite index constraints)
      fetched.sort((a, b) => b.targetDate.getTime() - a.targetDate.getTime());
      setLetters(fetched);
    } catch (err) {
      console.error("Failed to fetch letters", err);
    } finally {
      setLoading(false);
    }
  };

  const setPresetDate = (months) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    setRevealDateStr(d.toISOString().split('T')[0]);
  };

  const handleSaveLetter = async () => {
    if (!subject || !body || !revealDateStr) return;
    setIsSaving(true);
    try {
      const revealDate = new Date(revealDateStr);
      await addDoc(collection(db, 'vault_letters'), {
        userId: user.uid,
        subject,
        body,
        revealDate: Timestamp.fromDate(revealDate),
        createdAt: serverTimestamp(),
        status: 'sealed' // sealed | opened
      });
      setShowModal(false);
      setSubject('');
      setBody('');
      setRevealDateStr('');
      fetchLetters();
    } catch (err) {
      console.error("Failed to save letter", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenLetter = async (letter) => {
    if (letter.computedStatus === 'ready') {
      try {
        await updateDoc(doc(db, 'vault_letters', letter.id), { status: 'opened' });
        // Update local state
        setLetters(prev => prev.map(l => l.id === letter.id ? { ...l, computedStatus: 'opened', status: 'opened' } : l));
        setSelectedLetter({ ...letter, computedStatus: 'opened', status: 'opened' });
      } catch (err) {
        console.error("Failed to open letter", err);
      }
    } else if (letter.computedStatus === 'opened') {
      setSelectedLetter(letter);
    }
  };

  if (loading) {
    return (
      <div className="content-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Opening Time Vault...</div>
      </div>
    );
  }

  return (
    <div className="content-wrap" style={{ padding: '32px 24px 80px', maxWidth: '640px', margin: '0 auto' }}>
      
      {/* VAULT DOOR HEADER GRAPHIC */}
      <VaultDoorDial />

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '32px', fontWeight: 700, color: 'white', margin: 0 }}>Time Vault</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '4px' }}>Seal safe memories for your future self</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(201,168,76,0.1)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          style={{
            border: '1px solid rgba(201,168,76,0.4)', background: 'transparent', color: '#C9A84C',
            padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          + Seal Letter
        </motion.button>
      </div>

      {/* ARCHIVE LIST (styled like lockers/safe deposit boxes) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {letters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ fontSize: '36px', marginBottom: '16px', opacity: 0.5 }}>📭</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>Your vault is empty</div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', marginBottom: '24px' }}>Seal your first memory today.</div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowModal(true)} style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              Write your first letter
            </motion.button>
          </div>
        ) : (
          letters.map((letter, index) => {
            const isReady = letter.computedStatus === 'ready';
            const isOpened = letter.computedStatus === 'opened';
            
            // Progress calculation for sealed
            const createdTime = letter.createdAt?.toDate ? letter.createdAt.toDate().getTime() : (new Date().getTime() - 86400000);
            const targetTime = letter.targetDate.getTime();
            const nowTime = new Date().getTime();
            let pct = Math.max(0, Math.min(100, ((nowTime - createdTime) / (targetTime - createdTime)) * 100));
            if (isReady || isOpened) pct = 100;

            const boxNum = String(letters.length - index).padStart(3, '0');

            return (
              <motion.div 
                key={letter.id}
                onClick={() => handleOpenLetter(letter)}
                whileHover={isReady || isOpened ? { scale: 1.01, backgroundColor: 'rgba(255,255,255,0.03)' } : {}}
                whileTap={isReady || isOpened ? { scale: 0.99 } : {}}
                style={{
                  background: 'linear-gradient(135deg, #1C2038 0%, #151829 100%)', // Metallic gradient
                  border: `1px solid ${isReady ? '#C9A84C' : 'rgba(255,255,255,0.08)'}`,
                  borderLeft: `4px solid ${isOpened ? '#4A9B8E' : isReady ? '#C9A84C' : '#C4596A'}`, // Left colored light tag
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: isReady || isOpened ? 'pointer' : 'default',
                  display: 'flex',
                  gap: '16px',
                  opacity: letter.computedStatus === 'sealed' ? 0.85 : 1,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
              >
                {/* Locker Number Plate */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  width: '56px',
                  height: '56px',
                  flexShrink: 0
                }}>
                  <div style={{ fontSize: '9px', color: '#C9A84C', fontWeight: 800, letterSpacing: '0.05em' }}>BOX</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#E8E0D5', fontFamily: 'monospace' }}>#{boxNum}</div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ fontSize: '11px', color: isOpened ? '#4A9B8E' : isReady ? '#C9A84C' : '#C4596A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                      {isOpened ? 'UNLOCKED' : isReady ? 'READY TO CLAIM' : 'SEALED'} • {letter.targetDate.toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
                    {letter.subject}
                  </div>
                  
                  {letter.computedStatus === 'sealed' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#C4596A', width: `${pct}%` }} />
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                        {Math.ceil((targetTime - nowTime) / (1000*60*60*24))}d left
                      </div>
                    </div>
                  )}

                  {isOpened && (
                    <div style={{ fontSize: '13px', color: 'rgba(232,224,213,0.6)', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                      "{letter.body}"
                    </div>
                  )}
                </div>

                {/* Status indicator badge */}
                <div style={{ fontSize: '24px', display: 'flex', alignItems: 'center' }}>
                  {isOpened ? '🔓' : isReady ? '🔔' : '🔒'}
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* WRITE LETTER MODAL */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '24px' }}>
            <div style={{ position: 'absolute', inset: 0 }} onClick={() => setShowModal(false)} />
            <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none', padding: '32px 24px 48px', borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%', maxWidth: 640, position: 'relative', zIndex: 101 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'white' }}>Seal a Letter in the Vault</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '24px' }}>&times;</button>
              </div>
              
              <input placeholder="Subject (e.g. Note to 30-year-old me)" value={subject} onChange={e => setSubject(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: 14, borderRadius: 10, color: 'white', marginBottom: 16, outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} />
              
              <textarea placeholder="Write what's on your mind... (This letter will be sealed and completely hidden until the unlock date)" value={body} onChange={e => setBody(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: 14, borderRadius: 10, color: 'white', marginBottom: 16, outline: 'none', fontSize: '14px', minHeight: '160px', resize: 'vertical', boxSizing: 'border-box' }} />
              
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.05em' }}>REVEAL PRESETS</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                  <button onClick={() => setPresetDate(3)} style={{ flexShrink: 0, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '16px', color: 'white', fontSize: '13px', cursor: 'pointer' }}>3 Months</button>
                  <button onClick={() => setPresetDate(6)} style={{ flexShrink: 0, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '16px', color: 'white', fontSize: '13px', cursor: 'pointer' }}>6 Months</button>
                  <button onClick={() => setPresetDate(12)} style={{ flexShrink: 0, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '16px', color: 'white', fontSize: '13px', cursor: 'pointer' }}>1 Year</button>
                  <button onClick={() => setPresetDate(24)} style={{ flexShrink: 0, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '16px', color: 'white', fontSize: '13px', cursor: 'pointer' }}>2 Years</button>
                </div>
                <input type="date" value={revealDateStr} onChange={e => setRevealDateStr(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: 14, borderRadius: 10, color: 'white', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveLetter}
                disabled={!subject || !body || !revealDateStr || isSaving}
                style={{ 
                  width: '100%', padding: '16px', borderRadius: '12px', border: 'none', 
                  background: (!subject || !body || !revealDateStr || isSaving) ? 'rgba(201,168,76,0.3)' : '#C9A84C', 
                  color: '#1B1F3B', fontSize: '16px', fontWeight: 700, cursor: (!subject || !body || !revealDateStr || isSaving) ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? 'Sealing in Vault...' : 'Seal Letter in Vault 🔒'}
              </motion.button>
            </motion.div>
          </div>
        )}

        {/* READ LETTER MODAL */}
        {selectedLetter && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '24px' }}>
            <div style={{ position: 'absolute', inset: 0 }} onClick={() => setSelectedLetter(null)} />
            <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none', padding: '32px 24px 48px', borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%', maxWidth: 640, maxHeight: '80vh', overflowY: 'auto', position: 'relative', zIndex: 101 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '4px' }}>UNLOCKED FROM VAULT</div>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'white' }}>{selectedLetter.subject}</h3>
                </div>
                <button onClick={() => setSelectedLetter(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '24px' }}>&times;</button>
              </div>
              <div style={{ fontSize: '15px', color: 'rgba(232,224,213,0.85)', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                "{selectedLetter.body}"
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
