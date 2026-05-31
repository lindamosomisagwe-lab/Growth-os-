import React, { useState, useEffect } from "react";
import { useGamification } from "../contexts/GamificationContext";

const moods = [
  { emoji: "😁", label: "Great", id: "happy" },
  { emoji: "😌", label: "Good", id: "content" },
  { emoji: "😐", label: "Okay", id: "neutral" },
  { emoji: "😔", label: "Hard", id: "sad" },
  { emoji: "😤", label: "Frustrated", id: "angry" }
];

function dispatchSave() { window.dispatchEvent(new Event("growth_os_save")); }

export default function DailyLog() {
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem("growth_os_v1");
    return saved ? JSON.parse(saved).dailyLogs || [] : [];
  });

  const [mood, setMood] = useState("");
  const [win, setWin] = useState("");
  const [intention, setIntention] = useState("");
  
  const [showMore, setShowMore] = useState(false);
  const [hydration, setHydration] = useState(0);
  const [sleep, setSleep] = useState(7);
  const [energy, setEnergy] = useState(5);
  const [note, setNote] = useState("");

  const [expandedLogId, setExpandedLogId] = useState(null);
  const [flashAnim, setFlashAnim] = useState(false);
  const { awardXP } = useGamification();

  const saveLog = async () => {
    if (!mood) return; 
    
    setFlashAnim(true);
    await awardXP("daily_checkin");

    setTimeout(() => {
      const newLog = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        mood,
        win: win.trim(),
        intention: intention.trim(),
        hydration: showMore ? hydration : 0,
        sleep: showMore ? sleep : null,
        energy: showMore ? energy : null,
        note: showMore ? note.trim() : ""
      };

      const newLogs = [newLog, ...logs];
      setLogs(newLogs);
      
      const saved = localStorage.getItem("growth_os_v1");
      const parsed = saved ? JSON.parse(saved) : {};
      parsed.dailyLogs = newLogs;
      localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
      dispatchSave();

      // Reset
      setMood("");
      setWin("");
      setIntention("");
      setShowMore(false);
      setHydration(0);
      setSleep(7);
      setEnergy(5);
      setNote("");
      setFlashAnim(false);
    }, 500);
  };

  return (
    <div style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)", maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem" }}>
      
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ margin: "0", fontSize: "2rem", fontWeight: "400", letterSpacing: "-0.02em" }}>Today</h2>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.95rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
            The 60-second ritual.
          </p>
        </div>
      </header>

      <div className="stationery-card" style={{ 
        padding: "2rem", display: "flex", flexDirection: "column", gap: "2.5rem", marginBottom: "3rem",
        boxShadow: flashAnim ? "0 0 30px rgba(167,139,250,0.6)" : "none",
        borderColor: flashAnim ? "rgba(167,139,250,0.8)" : "rgba(255,255,255,0.08)",
        transition: "box-shadow 0.3s ease, border-color 0.3s ease"
      }}>
        
        {/* Mood */}
        <section>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: "600" }}>How's today going?</h3>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {moods.map(m => {
              const active = mood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  style={{
                    flex: 1, minWidth: "60px", padding: "1rem 0.5rem",
                    background: active ? "rgba(167,139,250,0.15)" : "transparent",
                    border: active ? "1px solid rgba(167,139,250,0.4)" : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
                    cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  <span style={{ fontSize: "1.8rem" }}>{m.emoji}</span>
                  <span style={{ fontSize: "0.8rem", color: active ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Win & Intention */}
        <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem", fontWeight: "600" }}>What's one thing that went well today?</h3>
            <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.85rem", color: "var(--text-secondary)", fontStyle: "italic" }}>Even something small.</p>
            <textarea
              placeholder="e.g. I actually drank enough water today..."
              value={win} onChange={e => setWin(e.target.value)}
              rows={2} style={{ width: "100%", fontSize: "0.95rem" }}
            />
          </div>
          
          <div>
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem", fontWeight: "600" }}>What's the one thing you want to do tomorrow?</h3>
            <textarea
              placeholder="e.g. Read for 15 minutes before bed."
              value={intention} onChange={e => setIntention(e.target.value)}
              rows={2} style={{ width: "100%", fontSize: "0.95rem" }}
            />
          </div>
        </section>

        {/* Expander */}
        {!showMore ? (
          <button onClick={() => setShowMore(true)} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontStyle: "italic", fontSize: "0.9rem", padding: "0" }}>
            + Track more details (energy, sleep, hydration)
          </button>
        ) : (
          <section style={{ padding: "1.5rem", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>Hydration</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{hydration} / 8</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {[...Array(8)].map((_, i) => (
                  <button key={i} onClick={() => setHydration(i + 1 === hydration ? i : i + 1)} style={{ flex: 1, height: "40px", borderRadius: "8px", background: i < hydration ? "rgba(96,165,250,0.2)" : "rgba(255,255,255,0.03)", border: i < hydration ? "1px solid rgba(96,165,250,0.5)" : "1px solid rgba(255,255,255,0.08)", cursor: "pointer", fontSize: "1.2rem", display: "grid", placeContent: "center" }}>
                    <span style={{ opacity: i < hydration ? 1 : 0.3 }}>💧</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>Sleep Quality</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{sleep} / 10</span>
              </div>
              <input type="range" min="1" max="10" value={sleep} onChange={e => setSleep(parseInt(e.target.value))} style={{ width: "100%" }} />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>Energy Levels</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{energy} / 10</span>
              </div>
              <input type="range" min="1" max="10" value={energy} onChange={e => setEnergy(parseInt(e.target.value))} style={{ width: "100%" }} />
            </div>

            <div>
              <span style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.5rem" }}>Extra Notes</span>
              <textarea placeholder="Anything else on your mind?" value={note} onChange={e => setNote(e.target.value)} rows={3} style={{ width: "100%" }} />
            </div>

          </section>
        )}

        <button onClick={saveLog} disabled={!mood} className={mood ? "btn-primary" : "btn-secondary"} style={{ padding: "1rem", fontSize: "1rem", width: "100%", opacity: mood ? 1 : 0.5 }}>
          Save Today
        </button>
      </div>

      {/* Archive */}
      {logs.length > 0 && (
        <div>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.2rem", fontWeight: "400" }}>Past Days</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {logs.map(log => {
              const isExpanded = expandedLogId === log.id;
              const logMood = moods.find(m => m.id === log.mood) || moods[2];
              
              return (
                <div key={log.id} className="stationery-card" onClick={() => setExpandedLogId(isExpanded ? null : log.id)} style={{ padding: "1.25rem", cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span style={{ fontSize: "1.8rem" }}>{logMood.emoji}</span>
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "1rem" }}>{log.date}</div>
                        {log.win && <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Win: {log.win}</div>}
                      </div>
                    </div>
                    <div style={{ color: "var(--text-secondary)" }}>
                      {isExpanded ? '▲' : '▼'}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                      {log.intention && <div style={{ marginBottom: "0.75rem" }}><strong>Tomorrow's Intention:</strong> {log.intention}</div>}
                      
                      {(log.sleep !== null || log.energy !== null || log.hydration > 0) && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "0.75rem", background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "8px" }}>
                          {log.sleep !== null && <div>💤 {log.sleep}/10</div>}
                          {log.energy !== null && <div>⚡ {log.energy}/10</div>}
                          {log.hydration > 0 && <div>💧 {log.hydration}/8</div>}
                        </div>
                      )}
                      
                      {log.note && (
                        <div style={{ fontStyle: "italic" }}>"{log.note}"</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
