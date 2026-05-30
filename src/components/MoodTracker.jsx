import React, { useState, useEffect } from "react";
import { useGamification } from "../contexts/GamificationContext";

function dispatchSave() { window.dispatchEvent(new Event("growth_os_save")); }

const moods = [
  { emoji: "😀", label: "Happy", color: "254,214,64" },     // gold
  { emoji: "🙂", label: "Content", color: "52,211,153" },   // mint
  { emoji: "😐", label: "Neutral", color: "148,163,184" },  // blue-gray
  { emoji: "🙁", label: "Sad", color: "129,140,248" },      // indigo
  { emoji: "😡", label: "Angry", color: "248,113,113" }     // red
];

function EmptyState({ onCta }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.25rem", padding: "3.5rem 2rem", border: "1px dashed var(--border-color)", textAlign: "center", borderRadius: "16px" }}>
      <div style={{ fontSize: "2.8rem", opacity: 0.45 }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" stroke="var(--text-secondary)" strokeWidth="1.5" />
          <path d="M16 30 Q24 37 32 30" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <circle cx="18" cy="20" r="2" fill="var(--text-secondary)" />
          <circle cx="30" cy="20" r="2" fill="var(--text-secondary)" />
        </svg>
      </div>
      <p style={{ margin: 0, fontSize: "1rem", color: "var(--text-secondary)", fontStyle: "italic", maxWidth: "300px", lineHeight: 1.7 }}>
        No entries yet — how are you arriving today?
      </p>
      <button onClick={onCta} className="btn-primary" style={{ padding: "0.65rem 1.5rem", fontSize: "0.82rem", letterSpacing: "0.04em" }}>
        Log Today's Mood
      </button>
    </div>
  );
}

export default function MoodTracker() {
  const { addGp } = useGamification();
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
  const [animatingEmoji, setAnimatingEmoji] = useState(null);
  const selectorRef = React.useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.moodTracker = log;
    localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
    dispatchSave();
  }, [log]);

  const selectMood = (emoji) => {
    const isNew = selectedMood === "";
    const newLog = { ...log, [today]: emoji };
    setLog(newLog);
    setSelectedMood(emoji);
    
    // Animate emoji
    setAnimatingEmoji(emoji);
    setTimeout(() => setAnimatingEmoji(null), 500);

    // Award points only once per day
    if (isNew) {
      addGp(10, "mood");
    }
  };

  const getEmojiLabel = emoji => moods.find(m => m.emoji === emoji)?.label || "";

  const deleteEntry = date => {
    const newLog = { ...log };
    delete newLog[date];
    setLog(newLog);
    if (date === today) setSelectedMood("");
  };

  const scrollToSelector = () => {
    selectorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const hasLogs = Object.keys(log).length > 0;

  return (
    <div style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
      <header style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: "0", fontSize: "1.6rem", fontWeight: "800", letterSpacing: "-0.03em" }}>
            Cognitive State Logger
          </h2>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
            CORRELATE EMOTIONAL SWINGS & HYDRATION TRENDS DAILY
          </p>
        </div>
        <span style={{ fontSize: "1.8rem" }} aria-hidden="true">🧠</span>
      </header>

      {/* Mood Selector */}
      <div ref={selectorRef} className="stationery-card module-mood" style={{ marginBottom: "2rem", padding: "2rem" }}>
        <p style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>
          Log today's cognitive baseline ({today}):
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1rem" }}>
          {moods.map(m => {
            const isSel = selectedMood === m.emoji;
            const isAnim = animatingEmoji === m.emoji;
            return (
              <button
                key={m.emoji}
                onClick={() => selectMood(m.emoji)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: "0.5rem", padding: "1.2rem 0.5rem",
                  borderRadius: "16px",
                  border: isSel ? `1px solid rgba(${m.color},0.4)` : "1px solid rgba(255,255,255,0.1)",
                  background: isSel ? `rgba(${m.color},0.2)` : "rgba(255,255,255,0.06)",
                  boxShadow: isSel ? `0 0 20px rgba(${m.color},0.25)` : "none",
                  cursor: "pointer", 
                  transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                  transform: isAnim ? "scale(1.05)" : "scale(1)"
                }}
                title={m.label}
              >
                <span style={{ 
                  fontSize: "2rem", 
                  transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                  transform: isAnim ? "scale(1.4)" : "scale(1)" 
                }}>
                  {m.emoji}
                </span>
                <span style={{ fontSize: "0.8rem", fontWeight: "800", letterSpacing: "0.04em", color: isSel ? `rgb(${m.color})` : "var(--text-primary)" }}>{m.label}</span>
              </button>
            );
          })}
        </div>
        {selectedMood && (
          <p style={{ margin: "1.5rem 0 0 0", textAlign: "center", fontSize: "0.8rem", fontFamily: "var(--font-mono)", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
            State locked today as: <span style={{ color: "var(--text-primary)", fontWeight: "700" }}>{selectedMood} {getEmojiLabel(selectedMood).toUpperCase()}</span>
          </p>
        )}
      </div>

      {/* Past Log */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>
          Archive History
        </h3>
        <div style={{ overflowY: "auto", maxHeight: "320px", paddingRight: "0.5rem" }}>
          {!hasLogs ? (
            <EmptyState onCta={scrollToSelector} />
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              {Object.entries(log)
                .sort(([a], [b]) => (a < b ? 1 : -1))
                .map(([date, val]) => {
                  const mData = moods.find(m => m.emoji === val);
                  return (
                    <li
                      key={date}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        background: "rgba(255,255,255,0.03)", padding: "1rem 1.5rem",
                        borderRadius: "12px", border: "1px solid var(--border-color)",
                        borderLeft: mData ? `4px solid rgb(${mData.color})` : "4px solid var(--border-color)"
                      }}
                    >
                      <span style={{ fontSize: "0.85rem", fontWeight: "700", fontFamily: "var(--font-mono)" }}>{date}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                        <span style={{ fontSize: "1.5rem" }}>{val}</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-primary)", fontWeight: "700", letterSpacing: "0.05em", fontFamily: "var(--font-mono)" }}>
                          {getEmojiLabel(val)}
                        </span>
                        <button onClick={() => deleteEntry(date)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1rem", padding: 0 }} title="Delete log">✕</button>
                      </div>
                    </li>
                  )
                })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
