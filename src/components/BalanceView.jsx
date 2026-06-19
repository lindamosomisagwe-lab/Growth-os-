import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageCard, expandCollapse } from '../lib/animations';

const DIMENSIONS = [
  { key: 'mental_health',       label: 'Mental Health',       color: '#7a5c8b' },
  { key: 'physical_health',     label: 'Physical Health',     color: '#5c7a5c' },
  { key: 'career_finances',     label: 'Career & Finances',   color: '#c9a96e' },
  { key: 'life_vision',         label: 'Life Vision',         color: '#5c8fa8' },
  { key: 'personal_development',label: 'Personal Dev.',       color: '#8b3a2a' },
  { key: 'spirituality',        label: 'Spirituality',        color: '#8b7a3a' },
  { key: 'creativity',          label: 'Creativity',          color: '#5c8a8a' },
  { key: 'relationships',       label: 'Relationships',       color: '#a8745c' },
];

export default function BalanceView() {
  const [data, setData] = useState(() => {
    const initRatings = {};
    const initNotes = {};
    DIMENSIONS.forEach(d => {
      initRatings[d.key] = 5;
      initNotes[d.key] = "";
    });
    return { ratings: initRatings, notes: initNotes };
  });

  const [expandedNotes, setExpandedNotes] = useState({});

  const changeRating = (key, value) => {
    setData(prev => ({
      ...prev,
      ratings: { ...prev.ratings, [key]: Number(value) }
    }));
  };

  const changeNote = (key, note) => {
    setData(prev => ({
      ...prev,
      notes: { ...prev.notes, [key]: note }
    }));
  };

  const toggleNote = (key) => {
    setExpandedNotes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ------------------------------------------------------------ //
  // SVG Wheel calculations
  // ------------------------------------------------------------ //
  const cx = 200;
  const cy = 200;
  const maxR = 145;
  const numSegments = DIMENSIONS.length;
  const angleStep = (2 * Math.PI) / numSegments;
  const rings = [2, 4, 6, 8, 10];

  function labelPos(index) {
    const angle = index * angleStep - Math.PI / 2;
    const r = maxR + 24;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  }

  return (
    <div className="content-wrap" style={{ paddingBottom: '80px' }}>
      <div className="hud-bar">
        <div>
          <h1 className="page-heading" style={{ fontSize: '32px', fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", color: '#1B1D1D', margin: 0 }}>Life Balance.</h1>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Wheel of Life Assessment</div>
        </div>
      </div>

      <motion.div initial="hidden" animate="visible" className="dashboard-grid">
        {/* The Wheel Chart Card */}
        <motion.div custom={0} variants={pageCard} className="card col-span-2" style={{ background: '#FFFFFF', border: '1px solid rgba(27,31,29,0.08)', borderLeft: '4px solid #5c8fa8', padding: 24 }}>
          
          <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "1rem" }}>
            <svg viewBox="0 0 400 400" width="100%" style={{ maxWidth: '440px', display: 'block', margin: '0 auto', overflow: 'visible' }}>
              {/* Background rings */}
              {rings.map(ring => (
                <circle key={ring} cx={cx} cy={cy} r={(ring / 10) * maxR} fill="none" stroke="rgba(27,31,29,0.08)" strokeWidth="1" />
              ))}

              {/* Spoke lines */}
              {DIMENSIONS.map((_, i) => {
                const angle = i * angleStep - Math.PI / 2;
                return (
                  <line key={`line-${i}`} x1={cx} y1={cy} x2={cx + maxR * Math.cos(angle)} y2={cy + maxR * Math.sin(angle)} stroke="rgba(27,31,29,0.08)" strokeWidth="1" />
                );
              })}

              {/* Polygon connecting all dots */}
              <polygon
                points={DIMENSIONS.map((dim, i) => {
                  const score = data.ratings[dim.key] ?? 5;
                  const angle = i * angleStep - Math.PI / 2;
                  const r = (score / 10) * maxR;
                  return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
                }).join(' ')}
                fill="rgba(92,143,168,0.12)"
                stroke="#5c8fa8"
                strokeWidth="1.5"
                strokeLinejoin="round"
                style={{ transition: 'points 0.3s ease' }}
              />

              {/* Dots at score position */}
              {DIMENSIONS.map((dim, i) => {
                const score = data.ratings[dim.key] ?? 5;
                const angle = i * angleStep - Math.PI / 2;
                const r = (score / 10) * maxR;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                return (
                  <g key={`dot-${dim.key}`} style={{ transition: 'transform 0.3s ease' }}>
                    <circle cx={x} cy={y} r={6} fill="white" stroke={dim.color} strokeWidth="2" />
                    <circle cx={x} cy={y} r={3} fill={dim.color} />
                  </g>
                );
              })}

              {/* Labels */}
              {DIMENSIONS.map((dim, i) => {
                const pos = labelPos(i);
                const angle = i * angleStep - Math.PI / 2;
                const anchor = Math.abs(Math.cos(angle)) < 0.2 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
                const score = data.ratings[dim.key] ?? 5;
                return (
                  <g key={`label-${dim.key}`}>
                    <text x={pos.x} y={pos.y - 4} textAnchor={anchor} fontFamily="'Inter', sans-serif" fontSize="10" fontWeight="600" fill="rgba(27,31,29,0.45)">
                      {dim.label.toUpperCase()}
                    </text>
                    <text x={pos.x} y={pos.y + 12} textAnchor={anchor} fontFamily="'Inter', sans-serif" fontSize="13" fontWeight="700" fill={dim.color}>
                      {score}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </motion.div>

        {/* Sliders Grid */}
        {DIMENSIONS.map((dim, i) => (
          <motion.div 
            key={dim.key} 
            custom={i + 1} 
            variants={pageCard} 
            className="card"
            style={{ 
              padding: '20px', 
              display: 'flex', flexDirection: 'column', gap: '12px',
              background: '#FFFFFF',
              border: '1px solid rgba(27,31,29,0.08)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title" style={{ color: '#1B1D1D' }}>{dim.label}</span>
              <span style={{ fontWeight: '700', color: dim.color, fontSize: '18px' }}>
                {data.ratings[dim.key]} <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ 10</span>
              </span>
            </div>
            
            <input 
              type="range" 
              min="1" max="10" 
              value={data.ratings[dim.key] ?? 5} 
              onChange={e => changeRating(dim.key, e.target.value)} 
              className="flat-slider"
              style={{ accentColor: dim.color, width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(27,31,29,0.08)' }}
            />
            
            <AnimatePresence>
              {expandedNotes[dim.key] ? (
                <motion.div
                  variants={expandCollapse}
                  initial="hidden" animate="visible" exit="exit"
                  style={{ overflow: 'hidden' }}
                >
                  <textarea
                    autoFocus
                    placeholder={`What's making this a ${data.ratings[dim.key]}?`}
                    value={data.notes[dim.key] || ""}
                    onChange={e => changeNote(dim.key, e.target.value)}
                    rows={2}
                    style={{ 
                      width: '100%', marginTop: '8px', background: 'rgba(27,31,29,0.01)', 
                      border: '1px solid rgba(27,31,29,0.12)', color: '#1B1D1D', 
                      borderRadius: '8px', padding: '10px', fontSize: '13px',
                      resize: 'none', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </motion.div>
              ) : (
                <motion.button 
                  onClick={() => toggleNote(dim.key)} 
                  whileHover={{ filter: 'brightness(1.2)' }}
                  whileTap={{ scale: 0.95 }}
                  style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'rgba(27,31,29,0.4)', fontSize: '12px', cursor: 'pointer', padding: '4px 0', fontWeight: 600, outline: 'none' }}
                >
                  + Add reflection
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
