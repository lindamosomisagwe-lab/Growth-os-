import React, { useState, useEffect } from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";

const categories = [
  "career",
  "business",
  "fun",
  "creativity",
  "health",
  "academics",
  "finance",
  "relationships"
];

export default function WheelOfLife() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.wheelOfLife) return parsed.wheelOfLife;
      } catch (e) {
        // Silent block
      }
    }
    const oldSaved = localStorage.getItem("wheelOfLife");
    return oldSaved
      ? JSON.parse(oldSaved)
      : {
          ratings: categories.reduce((a, c) => ({ ...a, [c]: 5 }), {}),
          notes: categories.reduce((a, c) => ({ ...a, [c]: "" }), {})
        };
  });

  const [toast, setToast] = useState({ show: false, message: "" });

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.wheelOfLife = data;
    localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
  }, [data]);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: "" }), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  const changeRating = (cat, value) => {
    setData(prev => ({
      ...prev,
      ratings: { ...prev.ratings, [cat]: Number(value) }
    }));
  };

  const changeNote = (cat, note) => {
    setData(prev => ({
      ...prev,
      notes: { ...prev.notes, [cat]: note }
    }));
  };

  const chartData = categories.map(cat => ({
    subject: cat.toUpperCase(),
    rating: data.ratings[cat] || 5
  }));

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { subject, rating } = payload[0].payload;
      return (
        <div style={{
          background: "#0a0a0a",
          padding: "0.6rem 1rem",
          borderRadius: "0px",
          border: "1px solid #ffffff",
          fontSize: "0.8rem",
          fontWeight: "700",
          fontFamily: "var(--font-mono)",
          color: "#ffffff"
        }}>
          {subject}: {rating} / 10.0
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", color: "#ffffff", fontFamily: "var(--font-sans)" }}>
      <header style={{ marginBottom: "1.5rem", borderBottom: "1px solid #222222", paddingBottom: "1rem" }}>
        <h2 style={{ margin: "0", fontSize: "1.6rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "-0.03em", color: "#ffffff" }}>
          🎡 Life Radar Balance
        </h2>
        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#888888", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          HIGH-PERFORMANCE RADAR DIAGRAM // EIGHT ESSENTIAL MODULES
        </p>
      </header>

      {/* Spherical Web Radar Chart inside Chic Studio container */}
      <div style={{ 
        width: "100%", 
        height: "320px", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        background: "#0a0a0a",
        borderRadius: "0px",
        padding: "1.5rem",
        boxSizing: "border-box",
        border: "1px solid #222222"
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="#222222" strokeWidth={1} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: "#888888", fontWeight: "700", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 10]} 
              tick={false} 
              axisLine={false} 
            />
            <Radar 
              name="My Balance" 
              dataKey="rating" 
              stroke="#ffffff" 
              fill="#ffffff" 
              fillOpacity={0.15} 
              style={{ transition: "all 0.3s ease" }}
            />
            <Tooltip content={customTooltip} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Sliders & Notes Control Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1rem",
        marginTop: "1.5rem",
        overflowY: "auto",
        maxHeight: "340px",
        paddingRight: "0.5rem"
      }}>
        {categories.map((cat) => (
          <div key={cat} style={{
            background: "#0a0a0a",
            padding: "1rem 1.2rem",
            borderRadius: "0px",
            border: "1px solid #222222",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "700", textTransform: "uppercase", color: "#ffffff", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", letterSpacing: "0.02em" }}>
                <span style={{ color: "#ffffff" }}>▪</span>
                {cat}
              </span>
              <span style={{ 
                background: "transparent", 
                color: "#ffffff", 
                border: "1px solid #ffffff",
                padding: "2px 8px", 
                borderRadius: "0px", 
                fontSize: "0.75rem", 
                fontWeight: "700",
                fontFamily: "var(--font-mono)"
              }}>
                {data.ratings[cat]}.0
              </span>
            </div>
            
            <input
              type="range"
              min="1"
              max="10"
              value={data.ratings[cat]}
              onChange={e => changeRating(cat, e.target.value)}
              onMouseUp={() => triggerToast("METRICS CACHED")}
              onTouchEnd={() => triggerToast("METRICS CACHED")}
              style={{ margin: "0.3rem 0" }}
            />
            
            <textarea
              placeholder={`REFLECTIONS ON ${cat.toUpperCase()}...`}
              value={data.notes[cat] || ""}
              onChange={e => changeNote(cat, e.target.value)}
              onBlur={() => triggerToast("RECORDS ARCHIVED")}
              rows={2}
              style={{
                width: "100%",
                padding: "0.5rem 0.7rem",
                boxSizing: "border-box",
                resize: "vertical",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                fontFamily: "var(--font-mono)",
                borderRadius: "0px",
                border: "1px solid #222222",
                background: "#000000",
                color: "#ffffff"
              }}
            />
          </div>
        ))}
      </div>

      {/* Fade-in/out Toast alerts overlay */}
      {toast.show && (
        <div className="toast-notification">
          <span>⚡</span> {toast.message}
        </div>
      )}
    </div>
  );
}
