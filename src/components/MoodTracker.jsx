import React, { useState, useEffect } from "react";

const moods = [
  { emoji: "😀", label: "Happy", color: "#ffffff" },
  { emoji: "🙂", label: "Content", color: "#cccccc" },
  { emoji: "😐", label: "Neutral", color: "#888888" },
  { emoji: "🙁", label: "Sad", color: "#444444" },
  { emoji: "😡", label: "Angry", color: "var(--border-color)" }
];

export default function MoodTracker() {
  const [log, setLog] = useState(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.moodTracker) return parsed.moodTracker;
      } catch (e) {}
    }
    return {};
  });

  const today = new Date().toISOString().split("T")[0];
  const [selectedMood, setSelectedMood] = useState(log[today] || "");

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.moodTracker = log;
    localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
  }, [log]);

  const selectMood = emoji => {
    const newLog = { ...log, [today]: emoji };
    setLog(newLog);
    setSelectedMood(emoji);
  };

  const getEmojiColor = emoji => {
    const moodObj = moods.find(m => m.emoji === emoji);
    return moodObj ? moodObj.color : "transparent";
  };

  const getEmojiLabel = emoji => {
    const moodObj = moods.find(m => m.emoji === emoji);
    return moodObj ? moodObj.label : "";
  };

  const deleteEntry = date => {
    const newLog = { ...log };
    delete newLog[date];
    setLog(newLog);
    if (date === today) {
      setSelectedMood("");
    }
  };

  return (
    <div style={{ color: "#ffffff", fontFamily: "var(--font-sans)" }}>
      <header style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
        <h2 style={{ margin: "0", fontSize: "1.6rem", fontWeight: "800", letterSpacing: "-0.03em" }}>
          🧠 Cognitive State Logger
        </h2>
        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#888888", fontFamily: "var(--font-mono)", }}>
          CORRELATE EMOTIONAL SWINGS &amp; HYDRATION TRENDS DAILY
        </p>
      </header>

      {/* Selector */}
      <div className="stationery-card" style={{ marginBottom: "2rem", padding: "2rem" }}>
        <p style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: "#888888", letterSpacing: "0.05em" }}>
          Log today's cognitive baseline ({today}):
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
          {moods.map(m => {
            const isSel = selectedMood === m.emoji;
            return (
              <button
                key={m.emoji}
                onClick={() => selectMood(m.emoji)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  padding: "0.8rem 0.5rem",
                  borderRadius: "0px",
                  border: isSel ? "1px solid #ffffff" : "1px solid var(--border-color)",
                  background: isSel ? "#ffffff" : "transparent",
                  color: isSel ? "#000000" : "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
                title={m.label}
              >
                <span style={{ fontSize: "1.2rem" }}>{m.emoji}</span>
                <span style={{ 
                  fontSize: "0.75rem", 
                  fontWeight: "800", 
                  letterSpacing: "0.05em",
                  color: isSel ? "#000000" : "#ffffff"
                }}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
        {selectedMood && (
          <p style={{ margin: "1rem 0 0 0", textAlign: "center", fontSize: "0.8rem", fontFamily: "var(--font-mono)", letterSpacing: "0.05em", color: "#888888" }}>
            State locked today as: <span style={{ color: "#ffffff", fontWeight: "700" }}>{selectedMood} {getEmojiLabel(selectedMood).toUpperCase()}</span>
          </p>
        )}
      </div>

      {/* Past Log */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: "#888888", letterSpacing: "0.05em" }}>
          Archive History
        </h3>
        <div style={{ overflowY: "auto", maxHeight: "280px", paddingRight: "0.5rem" }}>
          {Object.keys(log).length === 0 ? (
            <p style={{ fontStyle: "italic", textAlign: "center", color: "#888888", padding: "2rem", border: "1px dashed var(--border-color)", fontSize: "0.95rem" }}>
              No recorded metrics in database.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {Object.entries(log)
                .sort(([a], [b]) => (a < b ? 1 : -1))
                .map(([date, val]) => (
                  <li
                    key={date}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "var(--bg-surface)",
                      padding: "0.8rem 1.2rem",
                      borderRadius: "0px",
                      marginBottom: "0.5rem",
                      border: "1px solid var(--border-color)",
                      borderLeft: `4px solid ${getEmojiColor(val)}`
                    }}
                  >
                    <span style={{ fontSize: "0.85rem", fontWeight: "700", fontFamily: "var(--font-mono)" }}>{date}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span style={{ fontSize: "1.2rem" }}>{val}</span>
                      <span style={{ fontSize: "0.75rem", color: "#888888", fontWeight: "700", letterSpacing: "0.05em", fontFamily: "var(--font-mono)" }}>
                        {getEmojiLabel(val)}
                      </span>
                      <button
                        onClick={() => deleteEntry(date)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#444444",
                          cursor: "pointer",
                          fontSize: "0.95rem",
                          padding: 0
                        }}
                        title="Delete log"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
