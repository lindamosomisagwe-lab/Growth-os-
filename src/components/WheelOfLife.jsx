import React, { useState, useEffect } from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from "recharts";
import { useGamification } from "../contexts/GamificationContext";

const defaultCategories = ["Health", "Work", "Relationships", "Money", "Personal Growth"];
const extendedCategories = ["Fun", "Creativity", "Learning"];

function dispatchSave() {
  window.dispatchEvent(new Event("growth_os_save"));
}

export default function WheelOfLife() {
  const { awardXP } = useGamification();
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.wheelOfLife) return parsed.wheelOfLife;
      } catch (e) {}
    }
    const initRatings = {};
    const initNotes = {};
    [...defaultCategories, ...extendedCategories].forEach(c => {
      initRatings[c] = 5;
      initNotes[c] = "";
    });
    return { ratings: initRatings, notes: initNotes, snapshots: [] };
  });

  const [toast, setToast] = useState({ show: false, message: "" });
  const [compareMode, setCompareMode] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState({});

  const activeCategories = showMore ? [...defaultCategories, ...extendedCategories] : defaultCategories;

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

  const changeRating = (cat, value) => {
    setData(prev => ({ ...prev, ratings: { ...prev.ratings, [cat]: Number(value) } }));
  };

  const changeNote = (cat, note) => {
    setData(prev => ({ ...prev, notes: { ...prev.notes, [cat]: note } }));
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

  const currentChartData = activeCategories.map(cat => ({
    subject: cat,
    current: data.ratings[cat] || 5
  }));

  const snapshots = data.snapshots || [];
  let lastSnapshotData = null;
  if (snapshots.length > 0) {
    const lastSnap = snapshots.find(s => s.timestamp !== snapshots[0].timestamp) || snapshots[snapshots.length - 1];
    lastSnapshotData = activeCategories.map(cat => ({
      subject: cat,
      lastTime: lastSnap.ratings[cat] || 5
    }));
  }

  const chartData = compareMode && lastSnapshotData 
    ? activeCategories.map((cat, i) => ({
        subject: cat,
        current: data.ratings[cat] || 5,
        lastTime: lastSnapshotData[i].lastTime
      })) 
    : currentChartData;

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: "rgba(26,21,53,0.92)", backdropFilter: "blur(8px)", padding: "0.6rem 1rem",
          border: "1px solid rgba(167,139,250,0.3)", borderRadius: "8px", fontSize: "0.85rem", color: "var(--text-primary)"
        }}>
          {payload.map((p, i) => (
            <div key={i}>
              {p.name}: <strong style={{ color: "var(--accent)" }}>{p.value}</strong> / 10
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const toggleNote = (cat) => {
    setExpandedNotes(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Auto-insight generator
  let insightText = "Take a moment to adjust your scores. How are you really doing?";
  if (activeCategories.length > 0) {
    let highest = activeCategories[0];
    let lowest = activeCategories[0];
    activeCategories.forEach(cat => {
      if ((data.ratings[cat] || 5) > (data.ratings[highest] || 5)) highest = cat;
      if ((data.ratings[cat] || 5) < (data.ratings[lowest] || 5)) lowest = cat;
    });
    
    if (data.ratings[highest] === data.ratings[lowest]) {
      insightText = "Things feel pretty even right now.";
    } else {
      insightText = `Your lowest area is ${lowest} (${data.ratings[lowest]}/10) — your highest is ${highest} (${data.ratings[highest]}/10).`;
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", color: "var(--text-primary)", fontFamily: "var(--font-sans)", maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem" }}>
      
      <header style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ margin: "0", fontSize: "2rem", fontWeight: "400", letterSpacing: "-0.02em", fontStyle: "normal" }}>
            Life Balance
          </h2>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.95rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
            Check in with where you are right now.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {snapshots.length > 0 && (
            <button onClick={() => setCompareMode(!compareMode)} className="btn-secondary" style={{ padding: "0.6rem 1rem", fontSize: "0.85rem" }}>
              {compareMode ? "Hide past snapshot" : "Compare with past"}
            </button>
          )}
          <button onClick={saveSnapshot} className="btn-primary" style={{ padding: "0.6rem 1.4rem", fontSize: "0.85rem" }}>
            Save this snapshot
          </button>
        </div>
      </header>

      {/* Radar chart */}
      <div className="stationery-card" style={{ width: "100%", height: "350px", display: "flex", justifyContent: "center", alignItems: "center", padding: "1rem", boxSizing: "border-box", marginBottom: "1rem" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="rgba(167,139,250,0.12)" strokeWidth={1} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#C4B8E8", fontWeight: "500", fontSize: "0.8rem", fontFamily: "var(--font-sans)" }} />
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
            <Radar name="Right now" dataKey="current" stroke="#A78BFA" strokeWidth={2} fill="rgba(167,139,250,0.25)" style={{ animation: "radarDraw 0.6s ease-out" }} />
            {compareMode && lastSnapshotData && (
              <Radar name="Last time" dataKey="lastTime" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} fill="transparent" strokeDasharray="4 4" />
            )}
            <Tooltip content={customTooltip} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Insight */}
      <div style={{ textAlign: "center", marginBottom: "2rem", color: "var(--text-secondary)", fontSize: "0.95rem", fontStyle: "italic" }}>
        {insightText}
      </div>

      {/* Sliders */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {activeCategories.map((cat) => (
          <div key={cat} className="stationery-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "600", fontSize: "1rem" }}>{cat}</span>
              <span style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "1.1rem" }}>
                {data.ratings[cat]} <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "normal" }}>/ 10</span>
              </span>
            </div>
            
            <input type="range" min="1" max="10" value={data.ratings[cat] || 5} onChange={e => changeRating(cat, e.target.value)} />
            
            {expandedNotes[cat] ? (
              <textarea
                autoFocus
                placeholder={`What's making this a ${data.ratings[cat]}?`}
                value={data.notes[cat] || ""}
                onChange={e => changeNote(cat, e.target.value)}
                rows={2}
                style={{ width: "100%", marginTop: "0.5rem" }}
              />
            ) : (
              <button onClick={() => toggleNote(cat)} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--text-secondary)", fontSize: "0.85rem", cursor: "pointer", padding: "0.25rem 0", fontStyle: "italic", opacity: 0.8 }}>
                + Add a reflection
              </button>
            )}
          </div>
        ))}
      </div>

      {!showMore && (
        <button onClick={() => setShowMore(true)} className="btn-secondary" style={{ width: "100%", marginTop: "1rem", padding: "1rem", borderStyle: "dashed" }}>
          Add more areas (Fun, Creativity, Learning)
        </button>
      )}

      {toast.show && <div className="toast-notification">{toast.message}</div>}
    </div>
  );
}
