import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageCard, expandCollapse } from '../lib/animations';
import { DIMENSION_META, getTopResourcesForDimension } from '../data/resources';

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

export default function BalanceView({ setActivePage }) {
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

  // Compute lowest-scoring dimension for post-assessment prompt
  const lowestDim = useMemo(() => {
    let lowest = DIMENSIONS[0];
    DIMENSIONS.forEach(d => {
      if ((data.ratings[d.key] ?? 5) < (data.ratings[lowest.key] ?? 5)) {
        lowest = d;
      }
    });
    return lowest;
  }, [data.ratings]);

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

      {/* Post-Assessment Resource Prompt */}
      {lowestDim && (
        <PostAssessmentPrompt
          dimension={lowestDim}
          score={data.ratings[lowestDim.key]}
          setActivePage={setActivePage}
        />
      )}
    </div>
  );
}

// ── Post-Assessment Resource Prompt ──────────────────────────────────────────

function PostAssessmentPrompt({ dimension, score, setActivePage }) {
  const meta = DIMENSION_META[dimension.key];
  const resources = getTopResourcesForDimension(dimension.key, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="card col-span-2"
      style={{
        background: '#FFFFFF',
        border: `1px solid rgba(27,31,29,0.08)`,
        borderLeft: `4px solid ${meta?.color || '#5c8fa8'}`,
        padding: '24px',
        marginTop: '16px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
            Where to start
          </div>
          <h2 style={{ margin: 0, fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', fontWeight: 700, color: '#1B1D1D', lineHeight: 1.3 }}>
            Your {dimension.label} could use some attention.
          </h2>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
            You rated it {score}/10. Here are some hand-picked resources to help you grow in this area.
          </p>
        </div>
        <div style={{ fontSize: '36px', flexShrink: 0 }}>{meta?.icon}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {resources.map(resource => (
          <MiniResourceCard key={resource.id} resource={resource} />
        ))}
      </div>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(27,31,29,0.06)' }}>
        <button
          onClick={() => setActivePage && setActivePage('library')}
          style={{
            background: 'none', border: '1px solid rgba(27,31,29,0.15)', borderRadius: '8px',
            padding: '8px 16px', fontSize: '13px', fontWeight: 600, color: '#1B1D1D',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
            transition: 'all 0.15s ease'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(27,31,29,0.04)'}
          onMouseOut={e => e.currentTarget.style.background = 'none'}
        >
          📚 Browse the full Library
        </button>
      </div>
    </motion.div>
  );
}

function MiniResourceCard({ resource }) {
  const [playing, setPlaying] = useState(false);

  if (resource.type === 'book') {
    return (
      <a
        href={resource.amazonLink || resource.goodreadsLink || '#'}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px',
          background: 'rgba(27,31,29,0.02)', border: '1px solid rgba(27,31,29,0.08)',
          borderRadius: '10px', textDecoration: 'none', color: 'inherit',
          transition: 'background 0.15s ease'
        }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(27,31,29,0.05)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(27,31,29,0.02)'}
      >
        <img
          src={resource.coverImageUrl}
          alt={resource.title}
          style={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>📚 Book</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1B1D1D', lineHeight: 1.3, marginTop: 2 }}>{resource.title}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 2 }}>{resource.author}</div>
        </div>
      </a>
    );
  }

  if (resource.type === 'video' || resource.type === 'podcast') {
    const thumb = `https://img.youtube.com/vi/${resource.youtubeId}/mqdefault.jpg`;
    return (
      <div
        style={{
          background: 'rgba(27,31,29,0.02)', border: '1px solid rgba(27,31,29,0.08)',
          borderRadius: '10px', overflow: 'hidden'
        }}
      >
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${resource.youtubeId}?autoplay=1`}
            style={{ width: '100%', height: '140px', border: 0 }}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={resource.title}
          />
        ) : (
          <div
            style={{ position: 'relative', cursor: 'pointer', height: '120px', overflow: 'hidden' }}
            onClick={() => setPlaying(true)}
          >
            <img src={thumb} alt={resource.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.35)'
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#1B1D1D"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>
        )}
        <div style={{ padding: '10px 12px 12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
            {resource.type === 'podcast' ? '🎙 Podcast' : '▶ Video'}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1B1D1D', lineHeight: 1.3, marginTop: 2 }}>{resource.title}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 2 }}>{resource.author}</div>
        </div>
      </div>
    );
  }

  if (resource.type === 'article') {
    return (
      <a
        href={resource.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block', padding: '12px',
          background: 'rgba(27,31,29,0.02)', border: '1px solid rgba(27,31,29,0.08)',
          borderRadius: '10px', textDecoration: 'none', color: 'inherit',
          transition: 'background 0.15s ease'
        }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(27,31,29,0.05)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(27,31,29,0.02)'}
      >
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>📄 Article</div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1B1D1D', lineHeight: 1.3, marginTop: 2 }}>{resource.title}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 2 }}>{resource.author}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>Read →</div>
      </a>
    );
  }

  return null;
}
