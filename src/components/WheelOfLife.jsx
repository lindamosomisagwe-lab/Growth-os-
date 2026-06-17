import React, { useState, useEffect } from "react";
import { useGamification } from "../contexts/GamificationContext";
import { auth, db } from "../firebase-config";
import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

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
  const [loading, setLoading] = useState(true);

  // Core Data
  const [data, setData] = useState(() => {
    const initRatings = {};
    const initNotes = {};
    DIMENSIONS.forEach(d => {
      initRatings[d.key] = 5;
      initNotes[d.key] = "";
    });
    return { ratings: initRatings, notes: initNotes };
  });
  
  const [snapshots, setSnapshots] = useState([]);
  const [compareFromId, setCompareFromId] = useState("");
  const [compareToId, setCompareToId] = useState("");

  // Helper to read db mapped fields back to keys
  const getSnapScore = (snap, dimKey) => {
    if (!snap) return 5;
    const keyMap = {
      mental_health: 'mentalHealth',
      physical_health: 'physicalHealth',
      career_finances: 'careerFinances',
      life_vision: 'lifeVision',
      personal_development: 'personalDevelopment',
      spirituality: 'spirituality',
      creativity: 'creativity',
      relationships: 'relationships'
    };
    return snap[keyMap[dimKey]] ?? 5;
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, "wheel_scores"),
          where("userId", "==", auth.currentUser.uid),
          orderBy("snapshotDate", "desc")
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        setSnapshots(docs);
        
        if (docs.length > 0) {
          const latest = docs[0];
          const ratings = {
            mental_health: latest.mentalHealth ?? 5,
            physical_health: latest.physicalHealth ?? 5,
            career_finances: latest.careerFinances ?? 5,
            life_vision: latest.lifeVision ?? 5,
            personal_development: latest.personalDevelopment ?? 5,
            spirituality: latest.spirituality ?? 5,
            creativity: latest.creativity ?? 5,
            relationships: latest.relationships ?? 5,
          };
          const notes = latest.reflections || {};
          setData({ ratings, notes });
        }
      } catch (e) {
        console.error("Failed to load wheel scores:", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  useEffect(() => {
    if (compareMode && snapshots.length >= 2 && !compareFromId && !compareToId) {
      setCompareFromId(snapshots[snapshots.length - 1].id);
      setCompareToId(snapshots[0].id);
    }
  }, [compareMode, snapshots, compareFromId, compareToId]);

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
    if (!auth.currentUser) return;

    if (snapshots.length > 0) {
      const latest = snapshots[0];
      if (latest.snapshotDate) {
        const latestTime = latest.snapshotDate.toDate ? latest.snapshotDate.toDate().getTime() : new Date(latest.snapshotDate).getTime();
        const now = Date.now();
        // Check if less than 24 hours ago
        // UNCOMMENT THIS to re-enable 24h block after testing
        // if (now - latestTime < 24 * 60 * 60 * 1000) {
        //   triggerToast("You already checked in today. Come back tomorrow to track your progress.");
        //   return;
        // }
      }
    }

    const newDoc = {
      userId: auth.currentUser.uid,
      mentalHealth: data.ratings.mental_health ?? 5,
      physicalHealth: data.ratings.physical_health ?? 5,
      careerFinances: data.ratings.career_finances ?? 5,
      lifeVision: data.ratings.life_vision ?? 5,
      personalDevelopment: data.ratings.personal_development ?? 5,
      spirituality: data.ratings.spirituality ?? 5,
      creativity: data.ratings.creativity ?? 5,
      relationships: data.ratings.relationships ?? 5,
      reflections: data.notes || {},
      snapshotDate: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "wheel_scores"), newDoc);
      
      const localSnap = { ...newDoc, id: docRef.id, snapshotDate: new Date() };
      setSnapshots(prev => [localSnap, ...prev]);
      
      await awardXP("update_life_balance");
      triggerToast("Saved to your story. ✨");
      dispatchSave();
      setCompareMode(false);
    } catch(e) {
      console.error("Error saving snapshot", e);
      triggerToast("Error saving snapshot");
    }
  };

  const toggleNote = (key) => {
    setExpandedNotes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const formatDate = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const snapFrom = snapshots.find(s => s.id === compareFromId);
  const snapTo = snapshots.find(s => s.id === compareToId);

  // Auto-insight generator
  let insightText = "Take a moment to adjust your scores. How are you really doing?";
  if (DIMENSIONS.length > 0 && !compareMode) {
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
  // SVG Wheel calculations
  // ------------------------------------------------------------ //
  const cx = 200;
  const cy = 200;
  const maxR = 145;
  const numSegments = DIMENSIONS.length;
  const angleStep = (2 * Math.PI) / numSegments;
  const rings = [2, 4, 6, 8, 10];

  function labelPos(index) {
    const midAngle = (index + 0.5) * angleStep - Math.PI / 2;
    const r = maxR + 24;
    return {
      x: cx + r * Math.cos(midAngle),
      y: cy + r * Math.sin(midAngle),
    };
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", color: "var(--ink-dark)", maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem" }}>
      
      <header style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 className="page-title">Life Balance</h2>
          <p className="page-subtitle">Check in with where you are right now across all 8 sectors.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {snapshots.length >= 2 && (
            <button onClick={() => setCompareMode(!compareMode)} className="btn-secondary" style={{ padding: "0.6rem 1rem", fontSize: "0.85rem" }}>
              {compareMode ? "Current" : "Compare over time"}
            </button>
          )}
          {!compareMode && (
            <button onClick={saveSnapshot} className="btn-steel" style={{ padding: "0.6rem 1.4rem", fontSize: "0.85rem" }}>
              Save this snapshot
            </button>
          )}
        </div>
      </header>

      {compareMode && snapshots.length >= 2 && (
        <div className="nb-card balance" style={{ padding: "1rem", marginBottom: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--ink-light)" }}>From:</span>
            <select value={compareFromId} onChange={e => setCompareFromId(e.target.value)} style={{ padding: "0.4rem", borderRadius: "4px", background: "rgba(26,16,8,0.05)", border: "1px solid rgba(26,16,8,0.1)", fontSize: "0.85rem" }}>
              {snapshots.map(s => (
                <option key={s.id} value={s.id}>{formatDate(s.snapshotDate)}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--ink-light)" }}>To:</span>
            <select value={compareToId} onChange={e => setCompareToId(e.target.value)} style={{ padding: "0.4rem", borderRadius: "4px", background: "rgba(26,16,8,0.05)", border: "1px solid rgba(26,16,8,0.1)", fontSize: "0.85rem" }}>
              {snapshots.map(s => (
                <option key={s.id} value={s.id}>{formatDate(s.snapshotDate)}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* SVG pizza wheel display */}
      <div className="nb-card balance" style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "1.5rem", boxSizing: "border-box", marginBottom: "1rem" }}>
        <svg
          viewBox="0 0 400 400"
          width="100%"
          style={{ maxWidth: '440px', display: 'block', margin: '0 auto', overflow: 'visible' }}
        >
          {rings.map(ring => (
            <circle key={ring} cx={cx} cy={cy} r={(ring / 10) * maxR} fill="none" stroke="rgba(26,16,8,0.07)" strokeWidth="1" />
          ))}

          <circle cx={cx} cy={cy} r={maxR} fill="none" stroke="rgba(26,16,8,0.15)" strokeWidth="1.5" />

          {DIMENSIONS.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            return (
              <line key={i} x1={cx} y1={cy} x2={cx + maxR * Math.cos(angle)} y2={cy + maxR * Math.sin(angle)} stroke="rgba(26,16,8,0.08)" strokeWidth="1" />
            );
          })}

          {!compareMode ? (
            <polygon
              points={DIMENSIONS.map((dim, i) => {
                const score = data.ratings[dim.key] ?? 5;
                const angle = i * angleStep - Math.PI / 2;
                const r = (score / 10) * maxR;
                return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
              }).join(' ')}
              fill="rgba(92,143,168,0.08)"
              stroke="#5c8fa8"
              strokeWidth="1.5"
              strokeLinejoin="round"
              style={{ transition: 'points 0.3s ease' }}
            />
          ) : (
            <>
              {/* Snapshot A - Dashed Outline */}
              <polygon
                points={DIMENSIONS.map((dim, i) => {
                  const score = getSnapScore(snapFrom, dim.key);
                  const angle = i * angleStep - Math.PI / 2;
                  const r = (score / 10) * maxR;
                  return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
                }).join(' ')}
                fill="none"
                stroke="rgba(26, 16, 8, 0.4)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeLinejoin="round"
                style={{ transition: 'points 0.3s ease' }}
              />
              {/* Snapshot B - Solid Outline */}
              <polygon
                points={DIMENSIONS.map((dim, i) => {
                  const score = getSnapScore(snapTo, dim.key);
                  const angle = i * angleStep - Math.PI / 2;
                  const r = (score / 10) * maxR;
                  return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
                }).join(' ')}
                fill="rgba(255, 107, 53, 0.08)"
                stroke="#FF6B35"
                strokeWidth="2"
                strokeLinejoin="round"
                style={{ transition: 'points 0.3s ease' }}
              />
            </>
          )}

          {!compareMode ? (
            DIMENSIONS.map((dim, i) => {
              const score = data.ratings[dim.key] ?? 5;
              const angle = i * angleStep - Math.PI / 2;
              const r = (score / 10) * maxR;
              const x = cx + r * Math.cos(angle);
              const y = cy + r * Math.sin(angle);
              return (
                <g key={dim.key} style={{ transition: 'transform 0.3s ease' }}>
                  <circle cx={x} cy={y} r={6} fill="white" stroke={dim.color} strokeWidth="2" />
                  <circle cx={x} cy={y} r={3} fill={dim.color} />
                </g>
              );
            })
          ) : (
            DIMENSIONS.map((dim, i) => {
              const scoreTo = getSnapScore(snapTo, dim.key);
              const angle = i * angleStep - Math.PI / 2;
              const rTo = (scoreTo / 10) * maxR;
              const xTo = cx + rTo * Math.cos(angle);
              const yTo = cy + rTo * Math.sin(angle);
              return (
                <g key={`to-${dim.key}`} style={{ transition: 'transform 0.3s ease' }}>
                  <circle cx={xTo} cy={yTo} r={5} fill="white" stroke="#FF6B35" strokeWidth="2" />
                  <circle cx={xTo} cy={yTo} r={2} fill="#FF6B35" />
                </g>
              );
            })
          )}

          {/* Labels & scores text groups */}
          {DIMENSIONS.map((dim, i) => {
            const pos = labelPos(i);
            const midAngle = (i + 0.5) * angleStep - Math.PI / 2;
            const anchor = Math.abs(Math.cos(midAngle)) < 0.2 ? 'middle' : Math.cos(midAngle) > 0 ? 'start' : 'end';
            const score = compareMode ? getSnapScore(snapTo, dim.key) : (data.ratings[dim.key] ?? 5);
            return (
              <g key={dim.key}>
                <text x={pos.x} y={pos.y - 4} textAnchor={anchor} fontFamily="'Inter', sans-serif" fontSize="10" fontWeight="600" fill="rgba(26,16,8,0.55)" letterSpacing="0.04em">
                  {dim.label.toUpperCase()}
                </text>
                <text x={pos.x} y={pos.y + 11} textAnchor={anchor} fontFamily="'Playfair Display', serif" fontSize="13" fontWeight="700" fill={compareMode ? '#FF6B35' : dim.color}>
                  {score}
                </text>
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r={4} fill="rgba(26,16,8,0.2)" />
        </svg>
      </div>
      
      {!compareMode ? (
        <>
          <div style={{ textAlign: "center", marginBottom: "2rem", color: "var(--ink-medium)", fontSize: "0.95rem", fontStyle: "italic" }}>
            {insightText}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {DIMENSIONS.map((dim) => (
              <div key={dim.key} className="nb-card balance" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="card-title" style={{ fontSize: "16px", margin: 0 }}>{dim.label}</span>
                  <span style={{ fontWeight: "700", color: dim.color, fontSize: "1.1rem" }}>
                    {data.ratings[dim.key]} <span style={{ fontSize: "0.85rem", color: "var(--ink-light)", fontWeight: "normal" }}>/ 10</span>
                  </span>
                </div>
                
                <input type="range" min="1" max="10" value={data.ratings[dim.key] ?? 5} onChange={e => changeRating(dim.key, e.target.value)} style={{ accentColor: dim.color }} />
                
                {expandedNotes[dim.key] ? (
                  <textarea autoFocus placeholder={`What's making this a ${data.ratings[dim.key]}?`} value={data.notes[dim.key] || ""} onChange={e => changeNote(dim.key, e.target.value)} rows={2} style={{ width: "100%", marginTop: "0.5rem" }} />
                ) : (
                  <button onClick={() => toggleNote(dim.key)} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--ink-light)", fontSize: "0.85rem", cursor: "pointer", padding: "0.25rem 0", fontStyle: "italic" }}>
                    + Add a reflection
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginBottom: "2rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Score Changes</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {DIMENSIONS.map(dim => {
                const s1 = getSnapScore(snapFrom, dim.key);
                const s2 = getSnapScore(snapTo, dim.key);
                const diff = s2 - s1;
                return (
                  <div key={dim.key} className="nb-card balance" style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, width: "120px" }}>{dim.label}</span>
                    <span style={{ color: "var(--ink-light)", fontSize: "0.9rem" }}>{s1} → {s2}</span>
                    <span style={{ 
                      fontWeight: "bold", width: "40px", textAlign: "right",
                      color: diff > 0 ? "#5c7a5c" : (diff < 0 ? "#C4596A" : "var(--ink-light)") 
                    }}>
                      {diff > 0 ? `+${diff}` : diff === 0 ? "-" : diff}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Snapshot History</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {snapshots.map(snap => {
                const total = DIMENSIONS.reduce((acc, dim) => acc + getSnapScore(snap, dim.key), 0);
                const avg = (total / DIMENSIONS.length).toFixed(1);
                return (
                  <div key={snap.id} className="nb-card balance" style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(26,16,8,0.02)" }}>
                    <span style={{ fontWeight: 500 }}>{formatDate(snap.snapshotDate)}</span>
                    <span style={{ fontSize: "0.9rem", color: "var(--ink-medium)" }}>Avg: <b style={{color: "var(--ink-dark)"}}>{avg}</b> / 10</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {toast.show && <div className="toast-notification" style={{ position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)", background: "#1a1008", color: "#fff", padding: "12px 24px", borderRadius: "8px", zIndex: 100 }}>{toast.message}</div>}
    </div>
  );
}
