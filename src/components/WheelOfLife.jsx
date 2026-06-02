import React, { useState, useEffect } from "react";
import { useGamification } from "../contexts/GamificationContext";

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

function dispatchSave() {
  window.dispatchEvent(new Event("growth_os_save"));
}

export default function WheelOfLife() {
  const { awardXP } = useGamification();
  const [toast, setToast] = useState({ show: false, message: "" });
  const [compareMode, setCompareMode] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState({});

  // Loading state with backward-compatible key mapping (preserving user historical scores cleanly)
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.wheelOfLife) {
          const normRatings = {};
          const normNotes = {};
          
          DIMENSIONS.forEach(d => {
            let fallbackRating = 5;
            let fallbackNote = "";
            const ratings = parsed.wheelOfLife.ratings || {};
            const notes = parsed.wheelOfLife.notes || {};
            
            if (d.key === 'mental_health') {
              fallbackRating = ratings.mental_health ?? ratings.wellbeing ?? ratings.Learning ?? 5;
              fallbackNote = notes.mental_health ?? notes.wellbeing ?? notes.Learning ?? "";
            } else if (d.key === 'physical_health') {
              fallbackRating = ratings.physical_health ?? ratings.health ?? ratings.Health ?? 5;
              fallbackNote = notes.physical_health ?? notes.health ?? notes.Health ?? "";
            } else if (d.key === 'career_finances') {
              fallbackRating = ratings.career_finances ?? ratings.work ?? ratings.Work ?? ratings.money ?? ratings.Money ?? 5;
              fallbackNote = notes.career_finances ?? notes.work ?? notes.Work ?? notes.money ?? notes.Money ?? "";
            } else if (d.key === 'personal_development') {
              fallbackRating = ratings.personal_development ?? ratings.growth ?? ratings["Personal Growth"] ?? 5;
              fallbackNote = notes.personal_development ?? notes.growth ?? notes["Personal Growth"] ?? "";
            } else if (d.key === 'life_vision') {
              fallbackRating = ratings.life_vision ?? 5;
              fallbackNote = notes.life_vision ?? "";
            } else if (d.key === 'spirituality') {
              fallbackRating = ratings.spirituality ?? 5;
              fallbackNote = notes.spirituality ?? "";
            } else if (d.key === 'creativity') {
              fallbackRating = ratings.creativity ?? ratings.Creativity ?? 5;
              fallbackNote = notes.creativity ?? notes.Creativity ?? "";
            } else if (d.key === 'relationships') {
              fallbackRating = ratings.relationships ?? ratings.Relationships ?? 5;
              fallbackNote = notes.relationships ?? notes.Relationships ?? "";
            }
            
            normRatings[d.key] = ratings[d.key] !== undefined ? ratings[d.key] : fallbackRating;
            normNotes[d.key] = notes[d.key] !== undefined ? notes[d.key] : fallbackNote;
          });
          
          return {
            ratings: normRatings,
            notes: normNotes,
            snapshots: parsed.wheelOfLife.snapshots || []
          };
        }
      } catch (e) {}
    }
    const initRatings = {};
    const initNotes = {};
    DIMENSIONS.forEach(d => {
      initRatings[d.key] = 5;
      initNotes[d.key] = "";
    });
    return { ratings: initRatings, notes: initNotes, snapshots: [] };
  });

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.wheelOfLife = data;
    localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
    dispatchSave();
  }, [data]);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: "" }), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const triggerToast = (msg) => setToast({ show: true, message: msg });

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

  const saveSnapshot = async () => {
    const snapshot = {
      timestamp: new Date().toISOString(),
      ratings: { ...data.ratings }
    };
    
    setData(prev => ({
      ...prev,
      snapshots: [snapshot, ...(prev.snapshots || [])].slice(0, 12)
    }));
    
    await awardXP("update_life_balance");
    triggerToast("Saved to your story. ✨");
  };

  const toggleNote = (key) => {
    setExpandedNotes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Auto-insight generator based on new Dimensions
  let insightText = "Take a moment to adjust your scores. How are you really doing?";
  if (DIMENSIONS.length > 0) {
    let highestDim = DIMENSIONS[0];
    let lowestDim = DIMENSIONS[0];
    DIMENSIONS.forEach(dim => {
      if ((data.ratings[dim.key] || 5) > (data.ratings[highestDim.key] || 5)) highestDim = dim;
      if ((data.ratings[dim.key] || 5) < (data.ratings[lowestDim.key] || 5)) lowestDim = dim;
    });
    
    if (data.ratings[highestDim.key] === data.ratings[lowestDim.key]) {
      insightText = "Things feel pretty even right now.";
    } else {
      insightText = `Your lowest area is ${lowestDim.label} (${data.ratings[lowestDim.key]}/10) — your highest is ${highestDim.label} (${data.ratings[highestDim.key]}/10).`;
    }
  }

  // ------------------------------------------------------------ //
  // SVG pizza-slice Wheel calculations
  // ------------------------------------------------------------ //
  const cx = 200;
  const cy = 200;
  const maxR = 145; // outer ring radius adjusted slightly to fit label overflow
  const numSegments = DIMENSIONS.length;
  const angleStep = (2 * Math.PI) / numSegments;
  const rings = [2, 4, 6, 8, 10];

  // Pizza slice filled path
  function slicePath(index, fillRadius) {
    const startAngle = index * angleStep - Math.PI / 2;
    const endAngle = startAngle + angleStep;
    const x1 = cx + fillRadius * Math.cos(startAngle);
    const y1 = cy + fillRadius * Math.sin(startAngle);
    const x2 = cx + fillRadius * Math.cos(endAngle);
    const y2 = cy + fillRadius * Math.sin(endAngle);
    const largeArc = angleStep > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${fillRadius} ${fillRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  // Comparison snapshot arc path overlay
  function comparisonArcPath(index, compareRadius) {
    const startAngle = index * angleStep - Math.PI / 2;
    const endAngle = startAngle + angleStep;
    const x1 = cx + compareRadius * Math.cos(startAngle);
    const y1 = cy + compareRadius * Math.sin(startAngle);
    const x2 = cx + compareRadius * Math.cos(endAngle);
    const y2 = cy + compareRadius * Math.sin(endAngle);
    const largeArc = angleStep > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${compareRadius} ${compareRadius} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  // Spokes line coordinates
  function spokeLine(index) {
    const angle = index * angleStep - Math.PI / 2;
    return {
      x2: cx + maxR * Math.cos(angle),
      y2: cy + maxR * Math.sin(angle),
    };
  }

  // Dimension labels coordinate mapping
  function labelPos(index) {
    const midAngle = (index + 0.5) * angleStep - Math.PI / 2;
    const r = maxR + 24;
    return {
      x: cx + r * Math.cos(midAngle),
      y: cy + r * Math.sin(midAngle),
    };
  }

  const snapshots = data.snapshots || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", color: "var(--ink-dark)", maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem" }}>
      
      <header style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 className="page-title">Life Balance</h2>
          <p className="page-subtitle">Check in with where you are right now across all 8 sectors.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {snapshots.length > 0 && (
            <button onClick={() => setCompareMode(!compareMode)} className="btn-secondary" style={{ padding: "0.6rem 1rem", fontSize: "0.85rem" }}>
              {compareMode ? "Hide past snapshot" : "Compare with past"}
            </button>
          )}
          <button onClick={saveSnapshot} className="btn-steel" style={{ padding: "0.6rem 1.4rem", fontSize: "0.85rem" }}>
            Save this snapshot
          </button>
        </div>
      </header>

      {/* SVG pizza wheel display */}
      <div className="nb-card balance" style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "1.5rem", boxSizing: "border-box", marginBottom: "1rem" }}>
        <svg
          viewBox="0 0 400 400"
          width="100%"
          style={{ maxWidth: '440px', display: 'block', margin: '0 auto', overflow: 'visible' }}
        >
          {/* Inner background scale rings */}
          {rings.map(ring => (
            <circle
              key={ring}
              cx={cx} cy={cy}
              r={(ring / 10) * maxR}
              fill="none"
              stroke="rgba(26,16,8,0.06)"
              strokeWidth="1"
            />
          ))}

          {/* Solid Outer border ring */}
          <circle
            cx={cx} cy={cy} r={maxR}
            fill="none"
            stroke="rgba(26,16,8,0.15)"
            strokeWidth="1.5"
          />

          {/* Filled Pizza slices segments */}
          {DIMENSIONS.map((dim, i) => {
            const score = data.ratings[dim.key] ?? 5;
            const fillR = (score / 10) * maxR;
            return (
              <path
                key={dim.key}
                d={slicePath(i, fillR)}
                fill={dim.color}
                fillOpacity={0.2}
                stroke={dim.color}
                strokeWidth="1.5"
                strokeOpacity={0.8}
                style={{ transition: 'd 0.3s ease, fill 0.3s ease' }}
              />
            );
          })}

          {/* Optional dashed comparison arc overlays from past snapshots */}
          {compareMode && snapshots.length > 0 && DIMENSIONS.map((dim, i) => {
            const lastSnap = snapshots.find(s => s.timestamp !== snapshots[0].timestamp) || snapshots[snapshots.length - 1];
            if (!lastSnap) return null;
            const lastScore = lastSnap.ratings[dim.key] !== undefined
              ? lastSnap.ratings[dim.key]
              : (lastSnap.ratings[dim.label] !== undefined ? lastSnap.ratings[dim.label] : 5);
            const compareR = (lastScore / 10) * maxR;
            return (
              <path
                key={`compare-${dim.key}`}
                d={comparisonArcPath(i, compareR)}
                fill="none"
                stroke="rgba(26, 16, 8, 0.45)"
                strokeWidth="2"
                strokeDasharray="4 4"
                style={{ transition: 'd 0.3s ease' }}
              />
            );
          })}

          {/* Division spokes lines */}
          {DIMENSIONS.map((_, i) => {
            const sp = spokeLine(i);
            return (
              <line
                key={i}
                x1={cx} y1={cy}
                x2={sp.x2} y2={sp.y2}
                stroke="rgba(26,16,8,0.08)"
                strokeWidth="1"
              />
            );
          })}

          {/* Labels & scores text groups */}
          {DIMENSIONS.map((dim, i) => {
            const pos = labelPos(i);
            const midAngle = (i + 0.5) * angleStep - Math.PI / 2;
            const anchor =
              Math.abs(Math.cos(midAngle)) < 0.2 ? 'middle'
              : Math.cos(midAngle) > 0 ? 'start'
              : 'end';
            const score = data.ratings[dim.key] ?? 5;
            return (
              <g key={dim.key}>
                <text
                  x={pos.x}
                  y={pos.y - 4}
                  textAnchor={anchor}
                  fontFamily="'Inter', sans-serif"
                  fontSize="10"
                  fontWeight="600"
                  fill="rgba(26,16,8,0.55)"
                  letterSpacing="0.04em"
                >
                  {dim.label.toUpperCase()}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 11}
                  textAnchor={anchor}
                  fontFamily="'Playfair Display', serif"
                  fontSize="13"
                  fontWeight="700"
                  fill={dim.color}
                >
                  {score}
                </text>
              </g>
            );
          })}

          {/* Central seal dot */}
          <circle
            cx={cx} cy={cy} r={4}
            fill="rgba(26,16,8,0.2)"
          />
        </svg>
      </div>
      
      {/* Insight check */}
      <div style={{ textAlign: "center", marginBottom: "2rem", color: "var(--ink-medium)", fontSize: "0.95rem", fontStyle: "italic" }}>
        {insightText}
      </div>

      {/* Sliders */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {DIMENSIONS.map((dim) => (
          <div key={dim.key} className="nb-card balance" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="card-title" style={{ fontSize: "16px", margin: 0 }}>{dim.label}</span>
              <span style={{ fontWeight: "700", color: dim.color, fontSize: "1.1rem" }}>
                {data.ratings[dim.key]} <span style={{ fontSize: "0.85rem", color: "var(--ink-light)", fontWeight: "normal" }}>/ 10</span>
              </span>
            </div>
            
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={data.ratings[dim.key] ?? 5} 
              onChange={e => changeRating(dim.key, e.target.value)} 
              style={{
                accentColor: dim.color
              }}
            />
            
            {expandedNotes[dim.key] ? (
              <textarea
                autoFocus
                placeholder={`What's making this a ${data.ratings[dim.key]}?`}
                value={data.notes[dim.key] || ""}
                onChange={e => changeNote(dim.key, e.target.value)}
                rows={2}
                style={{ width: "100%", marginTop: "0.5rem" }}
              />
            ) : (
              <button onClick={() => toggleNote(dim.key)} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--ink-light)", fontSize: "0.85rem", cursor: "pointer", padding: "0.25rem 0", fontStyle: "italic" }}>
                + Add a reflection
              </button>
            )}
          </div>
        ))}
      </div>

      {toast.show && <div className="toast-notification">{toast.message}</div>}
    </div>
  );
}
