import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase-config';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';

// Helper: parse date from Firestore Timestamp or ISO string
const parseDate = (val) => {
  if (!val) return new Date();
  if (val && typeof val.toDate === 'function') return val.toDate();
  if (typeof val === 'string') return new Date(val);
  return new Date();
};

// ── Animated Envelope ────────────────────────────────────────────────────────
const AnimatedEnvelope = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'relative', width: 160, height: 116, cursor: 'default' }}
      >
        {/* Ambient glow */}
        <motion.div
          animate={{ opacity: [0.25, 0.55, 0.25], scale: [1, 1.06, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: '-16px',
            borderRadius: '20px',
            background: 'radial-gradient(ellipse at 50% 60%, rgba(196,89,106,0.10) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <svg viewBox="0 0 160 116" width="160" height="116" style={{ overflow: 'visible', position: 'relative', zIndex: 1 }}>
          {/* Drop shadow */}
          <ellipse cx="80" cy="120" rx="52" ry="7" fill="rgba(27,31,29,0.07)" />

          {/* Envelope body */}
          <rect x="6" y="34" width="148" height="76" rx="7" ry="7"
            fill="#FDFAF5" stroke="#1B1D1D" strokeWidth="1.5" />

          {/* Inner crease lines (bottom V) */}
          <line x1="6" y1="110" x2="66" y2="72" stroke="rgba(27,31,29,0.10)" strokeWidth="1" />
          <line x1="154" y1="110" x2="94" y2="72" stroke="rgba(27,31,29,0.10)" strokeWidth="1" />

          {/* Envelope flap — lifts open on hover */}
          <motion.path
            d={hovered
              ? 'M6,34 L80,12 L154,34'    // open — flap lifts flat
              : 'M6,34 L80,72 L154,34'    // closed — flap points down
            }
            fill={hovered ? '#F0EBE0' : '#EAE3D6'}
            stroke="#1B1D1D"
            strokeWidth="1.5"
            strokeLinejoin="round"
            transition={{ duration: 0.52, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* Wax seal — fades/shrinks when open */}
          <motion.g
            animate={hovered
              ? { scale: 0.75, opacity: 0.3 }
              : { scale: 1,    opacity: 1   }
            }
            transition={{ duration: 0.42 }}
            style={{ transformOrigin: '80px 62px' }}
          >
            {/* Outer decorative ring */}
            <circle cx="80" cy="62" r="17" fill="none" stroke="#A3404F" strokeWidth="0.8" strokeDasharray="3 3" />
            {/* Seal body */}
            <circle cx="80" cy="62" r="14" fill="#C4596A" stroke="#A3404F" strokeWidth="1" />
            {/* Petal spokes */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
              const rad = (angle * Math.PI) / 180;
              return (
                <line
                  key={angle}
                  x1={80 + 9 * Math.cos(rad)} y1={62 + 9 * Math.sin(rad)}
                  x2={80 + 14.5 * Math.cos(rad)} y2={62 + 14.5 * Math.sin(rad)}
                  stroke="#A3404F" strokeWidth="1.5"
                />
              );
            })}
            {/* Seal letter */}
            <text x="80" y="67" textAnchor="middle"
              fill="white" fontSize="12" fontWeight="800"
              fontFamily="'Playfair Display', Georgia, serif"
              style={{ userSelect: 'none' }}
            >
              V
            </text>
          </motion.g>

          {/* Divider line when open */}
          <motion.line
            x1="6" y1="72" x2="154" y2="72"
            stroke="rgba(27,31,29,0.07)" strokeWidth="1"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </svg>
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

export default function VaultView({ user }) {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [revealDateStr, setRevealDateStr] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetchLetters();
  }, [user]);

  const fetchLetters = async () => {
    try {
      const q = query(collection(db, 'vault_letters'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      const fetched = snap.docs.map(d => {
        const data = d.data();
        const target = parseDate(data.revealDate);
        let status = data.status;
        if (status === 'sealed' && new Date() >= target) status = 'ready';
        return { id: d.id, ...data, computedStatus: status, targetDate: target };
      });
      fetched.sort((a, b) => b.targetDate.getTime() - a.targetDate.getTime());
      setLetters(fetched);
    } catch (err) {
      console.error('Failed to fetch letters', err);
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
        status: 'sealed',
      });
      setShowModal(false);
      setSubject(''); setBody(''); setRevealDateStr('');
      fetchLetters();
    } catch (err) {
      console.error('Failed to save letter', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenLetter = async (letter) => {
    if (letter.computedStatus === 'ready') {
      try {
        await updateDoc(doc(db, 'vault_letters', letter.id), { status: 'opened' });
        setLetters(prev => prev.map(l => l.id === letter.id ? { ...l, computedStatus: 'opened', status: 'opened' } : l));
        setSelectedLetter({ ...letter, computedStatus: 'opened', status: 'opened' });
      } catch (err) {
        console.error('Failed to open letter', err);
      }
    } else if (letter.computedStatus === 'opened') {
      setSelectedLetter(letter);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Opening vault…</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px 80px', maxWidth: '640px', margin: '0 auto' }}>

      {/* Animated Envelope */}
      <AnimatedEnvelope />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", color: '#1B1D1D', margin: 0 }}>
            Time Vault
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Seal memories for your future self
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(96,122,102,0.08)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          style={{
            border: '1px solid rgba(96,122,102,0.3)', background: 'transparent', color: '#607A66',
            padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          ✉ Seal Letter
        </motion.button>
      </div>

      {/* Letter List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {letters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', border: '1px dashed rgba(27,31,29,0.15)', borderRadius: '16px', background: 'rgba(27,31,29,0.01)' }}>
            <div style={{ fontSize: '36px', marginBottom: '16px', opacity: 0.5 }}>📭</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#1B1D1D' }}>Your vault is empty</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '24px' }}>Seal your first memory today.</div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(true)}
              style={{ background: 'rgba(96,122,102,0.12)', color: '#607A66', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              Write your first letter
            </motion.button>
          </div>
        ) : (
          letters.map((letter, index) => {
            const isReady = letter.computedStatus === 'ready';
            const isOpened = letter.computedStatus === 'opened';
            const createdTime = parseDate(letter.createdAt).getTime();
            const targetTime = letter.targetDate.getTime();
            const nowTime = Date.now();
            let pct = Math.max(0, Math.min(100, ((nowTime - createdTime) / (targetTime - createdTime)) * 100));
            if (isReady || isOpened) pct = 100;
            const boxNum = String(letters.length - index).padStart(3, '0');

            return (
              <motion.div
                key={letter.id}
                onClick={() => handleOpenLetter(letter)}
                whileHover={isReady || isOpened ? { scale: 1.01, backgroundColor: 'rgba(27,31,29,0.01)' } : {}}
                whileTap={isReady || isOpened ? { scale: 0.99 } : {}}
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${isReady ? '#E6DCC3' : 'rgba(27,31,29,0.08)'}`,
                  borderLeft: `4px solid ${isOpened ? '#607A66' : isReady ? '#C9A96E' : '#C4596A'}`,
                  borderRadius: '12px', padding: '20px',
                  cursor: isReady || isOpened ? 'pointer' : 'default',
                  display: 'flex', gap: '16px',
                  opacity: letter.computedStatus === 'sealed' ? 0.85 : 1,
                }}
              >
                {/* Box label */}
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(27,31,29,0.02)', border: '1px solid rgba(27,31,29,0.08)',
                  borderRadius: '6px', width: '56px', height: '56px', flexShrink: 0,
                }}>
                  <div style={{ fontSize: '9px', color: '#607A66', fontWeight: 800, letterSpacing: '0.05em' }}>BOX</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#1B1D1D', fontFamily: 'monospace' }}>#{boxNum}</div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: isOpened ? '#607A66' : isReady ? '#C9A96E' : '#C4596A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '4px' }}>
                    {isOpened ? 'UNLOCKED' : isReady ? 'READY TO CLAIM' : 'SEALED'} · {letter.targetDate.toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1B1D1D', marginBottom: '8px' }}>
                    {letter.subject}
                  </div>

                  {letter.computedStatus === 'sealed' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, height: '4px', background: 'rgba(27,31,29,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#C4596A', width: `${pct}%`, transition: 'width 0.6s ease' }} />
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                        {Math.ceil((targetTime - nowTime) / 86400000)}d left
                      </div>
                    </div>
                  )}

                  {isOpened && (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                      "{letter.body}"
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '24px', display: 'flex', alignItems: 'center' }}>
                  {isOpened ? '🔓' : isReady ? '🔔' : '🔒'}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* WRITE LETTER MODAL */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: '24px' }}>
            <div style={{ position: 'absolute', inset: 0 }} onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ background: '#FFFFFF', border: '1px solid rgba(27,31,29,0.12)', borderBottom: 'none', padding: '32px 24px 48px', borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%', maxWidth: 640, position: 'relative', zIndex: 101 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1B1D1D', fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Seal a Letter in the Vault
                </h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(27,31,29,0.4)', cursor: 'pointer', fontSize: '24px' }}>&times;</button>
              </div>

              <input
                placeholder="Subject (e.g. Note to 30-year-old me)"
                value={subject} onChange={e => setSubject(e.target.value)}
                style={modalInputStyle}
              />

              <textarea
                placeholder="Write what's on your mind… (This letter will be sealed and completely hidden until the unlock date)"
                value={body} onChange={e => setBody(e.target.value)}
                style={{ ...modalInputStyle, minHeight: '160px', resize: 'vertical' }}
              />

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.05em' }}>REVEAL PRESETS</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {[[3, '3 Months'], [6, '6 Months'], [12, '1 Year'], [24, '2 Years']].map(([months, label]) => (
                    <button key={months} onClick={() => setPresetDate(months)}
                      style={{ flexShrink: 0, background: 'rgba(27,31,29,0.02)', border: '1px solid rgba(27,31,29,0.08)', padding: '6px 14px', borderRadius: '16px', color: '#1B1D1D', fontSize: '13px', cursor: 'pointer', outline: 'none' }}>
                      {label}
                    </button>
                  ))}
                </div>
                <input type="date" value={revealDateStr} onChange={e => setRevealDateStr(e.target.value)} style={modalInputStyle} />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={handleSaveLetter}
                disabled={!subject || !body || !revealDateStr || isSaving}
                style={{
                  width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                  background: subject && body && revealDateStr ? '#1B1D1D' : 'rgba(27,31,29,0.1)',
                  color: subject && body && revealDateStr ? '#FFFFFF' : 'rgba(27,31,29,0.3)',
                  fontSize: '16px', fontWeight: 700,
                  cursor: (!subject || !body || !revealDateStr || isSaving) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {isSaving ? 'Sealing in Vault…' : '🔒 Seal Letter in Vault'}
              </motion.button>
            </motion.div>
          </div>
        )}

        {/* READ LETTER MODAL */}
        {selectedLetter && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: '24px' }}>
            <div style={{ position: 'absolute', inset: 0 }} onClick={() => setSelectedLetter(null)} />
            <motion.div
              initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ background: '#FFFFFF', border: '1px solid rgba(27,31,29,0.12)', borderBottom: 'none', padding: '32px 24px 48px', borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%', maxWidth: 640, maxHeight: '80vh', overflowY: 'auto', position: 'relative', zIndex: 101 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#607A66', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '4px' }}>UNLOCKED FROM VAULT</div>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#1B1D1D', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {selectedLetter.subject}
                  </h3>
                </div>
                <button onClick={() => setSelectedLetter(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(27,31,29,0.4)', cursor: 'pointer', fontSize: '24px' }}>&times;</button>
              </div>
              <div style={{ fontSize: '15px', color: '#5C615C', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontStyle: 'italic', background: 'rgba(27,31,29,0.01)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(27,31,29,0.06)' }}>
                "{selectedLetter.body}"
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const modalInputStyle = {
  width: '100%',
  background: 'rgba(27,31,29,0.01)',
  border: '1px solid rgba(27,31,29,0.12)',
  padding: 14,
  borderRadius: 10,
  color: '#1B1D1D',
  marginBottom: 16,
  outline: 'none',
  fontSize: '14px',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};
