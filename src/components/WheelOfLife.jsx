import React, { useState, useEffect } from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from "recharts";

const categories = ["career", "business", "fun", "creativity", "health", "academics", "finance", "relationships"];

function dispatchSave() {
  window.dispatchEvent(new Event("growth_os_save"));
}

function saveOS(key, value) {
  const saved = localStorage.getItem("growth_os_v1");
  const parsed = saved ? JSON.parse(saved) : {};
  parsed[key] = value;
  localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
  dispatchSave();
}

export default function WheelOfLife() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.wheelOfLife) return parsed.wheelOfLife;
      } catch (e) {}
    }
    return {
      ratings: categories.reduce((a, c) => ({ ...a, [c]: 5 }), {}),
      notes: categories.reduce((a, c) => ({ ...a, [c]: "" }), {}),
      snapshots: []
    };
  });

  const [toast, setToast] = useState({ show: false, message: "" });
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    saveOS("wheelOfLife", data);
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

  const saveSnapshot = () => {
    const snapshot = {
      timestamp: new Date().toISOString(),
      ratings: { ...data.ratings }
    };
    setData(prev => ({
      ...prev,
      snapshots: [snapshot, ...(prev.snapshots || [])].slice(0, 12) // keep last 12
    }));
    triggerToast("Wheel scores saved & snapshot stored.");
  };

  // Current radar data
  const currentChartData = categories.map(cat => ({
    subject: cat.toUpperCase(),
    current: data.ratings[cat] || 5
  }));

  // Find a snapshot from ~30 days ago (or the oldest available)
  const snapshots = data.snapshots || [];
  let lastMonthData = null;
  if (snapshots.length > 0) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const closeToMonth = snapshots.find(s => s.timestamp <= thirtyDaysAgo) || snapshots[snapshots.length - 1];
    lastMonthData = categories.map(cat => ({
      subject: cat.toUpperCase(),
      lastMonth: closeToMonth.ratings[cat] || 5
    }));
  }

  // Merged chart data for compare mode
  const compareChartData = categories.map((cat, i) => ({
    subject: cat.toUpperCase(),
    current: data.ratings[cat] || 5,
    lastMonth: lastMonthData ? lastMonthData[i].lastMonth : undefined
  }));

  const chartData = compareMode && lastMonthData ? compareChartData : currentChartData.map(d => ({ ...d }));

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { subject } = payload[0].payload;
      return (
        <div style={{ background: "var(--bg-surface)", padding: "0.6rem 1rem", border: "1px solid var(--border-color)", fontSize: "0.8rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
          {payload.map((p, i) => (
            <div key={i}>{p.name}: {p.value} / 10</div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
      <header style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ margin: "0", fontSize: "1.6rem", fontWeight: "800", letterSpacing: "-0.03em" }}>
            Life Radar Balance
          </h2>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
            HIGH-PERFORMANCE RADAR DIAGRAM // EIGHT ESSENTIAL MODULES
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {snapshots.length > 0 && (
            <button
              onClick={() => setCompareMode(m => !m)}
              className={compareMode ? "btn-primary" : "btn-secondary"}
              style={{ fontSize: "0.78rem", padding: "0.5rem 1rem", letterSpacing: "0.04em" }}
            >
              {compareMode ? "Compare: ON" : "Compare"}
            </button>
          )}
          <button onClick={saveSnapshot} className="btn-primary" style={{ fontSize: "0.78rem", padding: "0.5rem 1rem", letterSpacing: "0.04em" }}>
            Save Snapshot
          </button>
        </div>
      </header>

      {/* Radar chart */}
      <div style={{ width: "100%", height: "300px", display: "flex", justifyContent: "center", alignItems: "center", background: "var(--bg-surface)", border: "1px solid var(--border-color)", padding: "1.5rem", boxSizing: "border-box", marginBottom: "1.5rem" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="var(--border-color)" strokeWidth={1} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-secondary)", fontWeight: "700", fontSize: "0.72rem", fontFamily: "var(--font-mono)" }} />
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
            <Radar name="This Week" dataKey="current" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} style={{ transition: "all 0.3s ease" }} />
            {compareMode && lastMonthData && (
              <Radar name="Last Month" dataKey="lastMonth" stroke="var(--accent-secondary)" fill="var(--accent-secondary)" fillOpacity={0.15} strokeDasharray="5 3" />
            )}
            {compareMode && lastMonthData && <Legend wrapperStyle={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)" }} />}
            <Tooltip content={customTooltip} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Sliders */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", overflowY: "auto", maxHeight: "360px", paddingRight: "0.5rem" }}>
        {categories.map((cat) => (
          <div key={cat} style={{ background: "var(--bg-surface)", padding: "1rem 1.2rem", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "0.85rem", letterSpacing: "0.02em", textTransform: "capitalize" }}>
                {cat}
              </span>
              {/* Inline score display: "7 / 10" */}
              <span style={{ border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "2px 8px", fontSize: "0.78rem", fontWeight: "700", fontFamily: "var(--font-mono)", minWidth: "52px", textAlign: "center" }}>
                {data.ratings[cat]} / 10
              </span>
            </div>
            <input
              type="range" min="1" max="10"
              value={data.ratings[cat]}
              onChange={e => changeRating(cat, e.target.value)}
              style={{ margin: "0.3rem 0" }}
            />
            <textarea
              placeholder={`Reflections on ${cat}…`}
              value={data.notes[cat] || ""}
              onChange={e => changeNote(cat, e.target.value)}
              rows={2}
              style={{ width: "100%", padding: "0.5rem 0.7rem", boxSizing: "border-box", resize: "vertical", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}
            />
          </div>
        ))}
      </div>

      {toast.show && <div className="toast-notification">{toast.message}</div>}
    </div>
  );
}
