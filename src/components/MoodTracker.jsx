import React, { useState, useEffect } from "react";

function dispatchSave() { window.dispatchEvent(new Event("growth_os_save")); }

const moods = [
  { emoji: "😀", label: "Happy" },
  { emoji: "🙂", label: "Content" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "🙁", label: "Sad" },
  { emoji: "😡", label: "Angry" }
];

function EmptyState({ onCta }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.25rem", padding: "3.5rem 2rem", border: "1px dashed var(--border-color)", textAlign: "center" }}>
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
  const selectorRef = React.useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.moodTracker = log;
    localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
    dispatchSave();
  }, [log]);

  const selectMood = emoji => {
    const newLog = { ...log, [today]: emoji };
    setLog(newLog);
    setSelectedMood(emoji);
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
      <header style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
        <h2 style={{ margin: "0", fontSize: "1.6rem", fontWeight: "800", letterSpacing: "-0.03em" }}>
          Cognitive State Logger
        </h2>
        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
          CORRELATE EMOTIONAL SWINGS & HYDRATION TRENDS DAILY
        </p>
      </header>

      {/* Mood Selector */}
      <div ref={selectorRef} className="stationery-card" style={{ marginBottom: "2rem", padding: "2rem" }}>
        <p style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>
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
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "0.4rem", padding: "0.8rem 0.5rem",
                  border: isSel ? "1px solid var(--text-primary)" : "1px solid var(--border-color)",
                  background: isSel ? "var(--text-primary)" : "transparent",
                  color: isSel ? "var(--bg-page)" : "var(--text-primary)",
                  cursor: "pointer", transition: "all 0.15s ease"
                }}
                title={m.label}
              >
                <span style={{ fontSize: "1.3rem" }}>{m.emoji}</span>
                <span style={{ fontSize: "0.75rem", fontWeight: "800", letterSpacing: "0.04em", color: "inherit" }}>{m.label}</span>
              </button>
            );
          })}
        </div>
        {selectedMood && (
          <p style={{ margin: "1rem 0 0 0", textAlign: "center", fontSize: "0.8rem", fontFamily: "var(--font-mono)", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
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
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {Object.entries(log)
                .sort(([a], [b]) => (a < b ? 1 : -1))
                .map(([date, val]) => (
                  <li
                    key={date}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: "var(--bg-surface)", padding: "0.8rem 1.2rem",
                      marginBottom: "0.5rem", border: "1px solid var(--border-color)",
                      borderLeft: `3px solid var(--accent)`
                    }}
                  >
                    <span style={{ fontSize: "0.85rem", fontWeight: "700", fontFamily: "var(--font-mono)" }}>{date}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span style={{ fontSize: "1.3rem" }}>{val}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "700", letterSpacing: "0.05em", fontFamily: "var(--font-mono)" }}>
                        {getEmojiLabel(val)}
                      </span>
                      <button onClick={() => deleteEntry(date)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.95rem", padding: 0 }} title="Delete log">✕</button>
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
