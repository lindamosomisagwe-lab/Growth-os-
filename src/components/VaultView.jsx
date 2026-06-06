import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase-config';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';

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
        where('userId', '==', user.uid), 
        orderBy('revealDate', 'desc')
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
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Loading Vault...</div>
      </div>
    );
  }

  return (
    <div className="content-wrap" style={{ padding: '32px 24px 80px', maxWidth: '640px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Time Vault</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '4px' }}>Letters to your future self</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(167,139,250,0.1)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          style={{
            border: '1px solid rgba(167,139,250,0.4)', background: 'transparent', color: '#a78bfa',
            padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          + Write Letter
        </motion.button>
      </div>

      {/* ARCHIVE LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {letters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.5 }}>📭</div>
            <div style={{ fontSize: '16px', fontWeight: 500, color: 'white' }}>Your vault is empty</div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', marginBottom: '24px' }}>Seal your first memory today.</div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowModal(true)} style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              Write your first letter
            </motion.button>
          </div>
        ) : (
          letters.map(letter => {
            const isReady = letter.computedStatus === 'ready';
            const isOpened = letter.computedStatus === 'opened';
            
            // Progress calculation for sealed
            const createdTime = letter.createdAt?.toDate ? letter.createdAt.toDate().getTime() : (new Date().getTime() - 86400000);
            const targetTime = letter.targetDate.getTime();
            const nowTime = new Date().getTime();
            let pct = Math.max(0, Math.min(100, ((nowTime - createdTime) / (targetTime - createdTime)) * 100));
            if (isReady || isOpened) pct = 100;

            return (
              <motion.div 
                key={letter.id}
                onClick={() => handleOpenLetter(letter)}
                whileHover={isReady || isOpened ? { scale: 1.01, backgroundColor: 'rgba(255,255,255,0.02)' } : {}}
                whileTap={isReady || isOpened ? { scale: 0.99 } : {}}
                style={{
                  background: '#13131f',
                  border: `1px solid ${isReady ? '#a78bfa' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: isReady || isOpened ? 'pointer' : 'default',
                  display: 'flex',
                  gap: '16px',
                  opacity: letter.computedStatus === 'sealed' ? 0.8 : 1
                }}
              >
                <div style={{ fontSize: '28px', opacity: letter.computedStatus === 'sealed' ? 0.5 : 1 }}>
                  {isOpened ? '📖' : isReady ? '📬' : '🔒'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: isReady ? '#a78bfa' : 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '4px' }}>
                    {isOpened ? 'Opened' : isReady ? 'Ready to open' : 'Sealed'} • {letter.targetDate.toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>
                    {letter.subject}
                  </div>
                  
                  {letter.computedStatus === 'sealed' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'rgba(255,255,255,0.3)', width: `${pct}%` }} />
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontVariantNumeric: 'tabular-nums' }}>
                        {Math.ceil((targetTime - nowTime) / (1000*60*60*24))}d
                      </div>
                    </div>
                  )}

                  {isOpened && (
                    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {letter.body}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* WRITE LETTER MODAL */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} style={{ background: '#13131f', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '32px 24px 48px', borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%', maxWidth: 640 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Write a Letter</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '24px' }}>&times;</button>
              </div>
              
              <input placeholder="Subject (e.g. Note to 30-year-old me)" value={subject} onChange={e => setSubject(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: 14, borderRadius: 10, color: 'white', marginBottom: 16, outline: 'none', fontSize: '15px' }} />
              
              <textarea placeholder="Write what's on your mind... (It will be hidden until the reveal date)" value={body} onChange={e => setBody(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: 14, borderRadius: 10, color: 'white', marginBottom: 16, outline: 'none', fontSize: '15px', minHeight: '160px', resize: 'vertical' }} />
              
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>REVEAL DATE</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                  <button onClick={() => setPresetDate(3)} style={{ flexShrink: 0, background: 'rgba(255,255,255,0.06)', border: 'none', padding: '6px 12px', borderRadius: '16px', color: 'white', fontSize: '13px', cursor: 'pointer' }}>3 Months</button>
                  <button onClick={() => setPresetDate(6)} style={{ flexShrink: 0, background: 'rgba(255,255,255,0.06)', border: 'none', padding: '6px 12px', borderRadius: '16px', color: 'white', fontSize: '13px', cursor: 'pointer' }}>6 Months</button>
                  <button onClick={() => setPresetDate(12)} style={{ flexShrink: 0, background: 'rgba(255,255,255,0.06)', border: 'none', padding: '6px 12px', borderRadius: '16px', color: 'white', fontSize: '13px', cursor: 'pointer' }}>1 Year</button>
                  <button onClick={() => setPresetDate(24)} style={{ flexShrink: 0, background: 'rgba(255,255,255,0.06)', border: 'none', padding: '6px 12px', borderRadius: '16px', color: 'white', fontSize: '13px', cursor: 'pointer' }}>2 Years</button>
                </div>
                <input type="date" value={revealDateStr} onChange={e => setRevealDateStr(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: 14, borderRadius: 10, color: 'white', outline: 'none' }} />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveLetter}
                disabled={!subject || !body || !revealDateStr || isSaving}
                style={{ 
                  width: '100%', padding: '16px', borderRadius: '12px', border: 'none', 
                  background: (!subject || !body || !revealDateStr || isSaving) ? 'rgba(167,139,250,0.3)' : '#a78bfa', 
                  color: 'white', fontSize: '16px', fontWeight: 600, cursor: (!subject || !body || !revealDateStr || isSaving) ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? 'Sealing...' : 'Seal Letter 🔒'}
              </motion.button>
            </motion.div>
          </div>
        )}

        {/* READ LETTER MODAL */}
        {selectedLetter && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} style={{ background: '#13131f', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '32px 24px 48px', borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%', maxWidth: 640, maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '4px' }}>Written {selectedLetter.createdAt?.toDate ? selectedLetter.createdAt.toDate().toLocaleDateString() : 'in the past'}</div>
                  <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>{selectedLetter.subject}</h3>
                </div>
                <button onClick={() => setSelectedLetter(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '24px' }}>&times;</button>
              </div>
              <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedLetter.body}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
