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
        date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
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
    <div style={{ color: "var(--ink-dark)", fontFamily: "var(--font-sans)", maxWidth: "100%", margin: "0 auto", paddingBottom: "4rem" }}>
      
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid var(--ink-faint)", paddingBottom: "16px" }}>
        <div>
          <h2 className="page-title">Today</h2>
          <p className="page-subtitle" style={{ margin: "4px 0 0 0" }}>
            The 60-second journal ritual.
          </p>
        </div>
      </header>

      {/* Main Journal Card */}
      <div 
        className="journal-entry" 
        style={{ 
          marginBottom: "3rem",
          boxShadow: flashAnim ? "0 0 24px rgba(92,122,92,0.25)" : "var(--shadow-raised)",
          transition: "box-shadow 0.3s ease"
        }}
      >
        {/* Elegant handwriting date header */}
        <div className="journal-date">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        
        {/* Mood Section */}
        <section style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "16px", fontWeight: "600", margin: "0 0 10px 0" }}>How is today going?</h3>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {moods.map(m => {
              const active = mood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={`mood-btn ${active ? "selected" : ""}`}
                  style={{ flex: 1, minWidth: "90px" }}
                >
                  <span style={{ fontSize: "1.2rem" }}>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Win & Intention Inputs */}
        <section style={{ display: "flex", flexDirection: "column", gap: "1.75rem", marginBottom: "1.75rem" }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "16px", fontWeight: "600", margin: "0 0 4px 0" }}>What went well today?</h3>
            <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "var(--ink-light)", fontStyle: "italic" }}>Even the smallest highlight counts.</p>
            <textarea
              placeholder="e.g. Cleared my desk and made a perfect cup of tea..."
              value={win} 
              onChange={e => setWin(e.target.value)}
              rows={2} 
            />
          </div>
          
          <div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "16px", fontWeight: "600", margin: "0 0 4px 0" }}>Your core focus for tomorrow?</h3>
            <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "var(--ink-light)", fontStyle: "italic" }}>Name one single high-impact intention.</p>
            <textarea
              placeholder="e.g. Finalize the project roadmap outline."
              value={intention} 
              onChange={e => setIntention(e.target.value)}
              rows={2} 
            />
          </div>
        </section>

        {/* Expander to track hydration / sleep / energy */}
        {!showMore ? (
          <button 
            onClick={() => setShowMore(true)} 
            style={{ 
              alignSelf: "flex-start", 
              background: "none", 
              border: "none", 
              color: "var(--accent-sage)", 
              cursor: "pointer", 
              fontStyle: "italic", 
              fontSize: "13px", 
              fontWeight: "600",
              padding: "4px 0",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            ✦ Track hydration, sleep & energy
          </button>
        ) : (
          <section style={{ padding: "1.5rem", border: "1px dashed var(--ink-faint)", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "1.5rem" }}>
            
            {/* Hydration Hollow Circle Dots */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>Hydration</span>
                <span style={{ fontSize: "12px", color: "var(--ink-medium)", fontFamily: "monospace" }}>{hydration} / 8 glasses</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {[...Array(8)].map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setHydration(i + 1 === hydration ? i : i + 1)} 
                    className={`hydration-dot ${i < hydration ? "filled" : ""}`}
                    style={{ flex: "1 0 30px", height: "30px", display: "grid", placeContent: "center", padding: 0 }}
                  >
                    {/* Faint dot in the center of hollow circles */}
                    {i >= hydration && <span style={{ fontSize: "6px", color: "var(--accent-steel)", opacity: 0.35 }}>●</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep Slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>Sleep Quality</span>
                <span style={{ fontSize: "12px", color: "var(--ink-medium)" }}>{sleep} / 10 hours</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={sleep} 
                onChange={e => setSleep(parseInt(e.target.value))} 
                style={{ accentColor: "var(--accent-sage)" }}
              />
            </div>

            {/* Energy Slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>Energy Level</span>
                <span style={{ fontSize: "12px", color: "var(--ink-medium)" }}>{energy} / 10 rating</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={energy} 
                onChange={e => setEnergy(parseInt(e.target.value))} 
                style={{ accentColor: "var(--accent-sage)" }}
              />
            </div>

            {/* Extra notes */}
            <div>
              <span style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Additional Reflections</span>
              <textarea 
                placeholder="Write down any physical or mental notes..." 
                value={note} 
                onChange={e => setNote(e.target.value)} 
                rows={3} 
              />
            </div>

          </section>
        )}

        <button 
          onClick={saveLog} 
          disabled={!mood} 
          className="btn-primary"
          style={{ 
            padding: "12px", 
            fontSize: "13px", 
            width: "100%", 
            opacity: mood ? 1 : 0.5,
            background: "var(--accent-sage) !important",
            color: "#ffffff !important",
            boxShadow: "0 3px 0 #3a5a3a !important",
            marginTop: "1.25rem"
          }}
        >
          Save Today's Journal Entry
        </button>
      </div>

      {/* Archive List of Past Days */}
      {logs.length > 0 && (
        <div style={{ marginTop: "3rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", fontWeight: "600", marginBottom: "1.25rem" }}>Past Journal Logs</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {logs.map(log => {
              const isExpanded = expandedLogId === log.id;
              const logMood = moods.find(m => m.id === log.mood) || moods[2];
              
              return (
                <div 
                  key={log.id} 
                  className="nb-card today" 
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)} 
                  style={{ 
                    padding: "1.25rem 1.5rem", 
                    cursor: "pointer",
                    borderLeft: "3px solid var(--accent-sage)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span style={{ fontSize: "1.4rem" }}>{logMood.emoji}</span>
                      <div>
                        <div style={{ fontFamily: "var(--font-serif)", fontWeight: "700", fontSize: "15px", color: "var(--ink-dark)" }}>{log.date}</div>
                        {log.win && (
                          <div style={{ fontSize: "13px", color: "var(--ink-medium)", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "450px" }}>
                            {log.win}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ color: "var(--ink-medium)", fontSize: "11px", fontWeight: "bold" }}>
                      {isExpanded ? '▲ CLOSE' : '▼ OPEN'}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--ink-faint)", fontSize: "13px", color: "var(--ink-medium)" }}>
                      
                      {log.win && (
                        <div style={{ marginBottom: "1rem" }}>
                          <strong style={{ color: "var(--ink-dark)", display: "block", marginBottom: "2px" }}>Highlight of the Day:</strong>
                          <div style={{ fontFamily: "var(--font-cursive)", fontSize: "18px", color: "#2a4a35", lineHeight: "1.4" }}>
                            {log.win}
                          </div>
                        </div>
                      )}

                      {log.intention && (
                        <div style={{ marginBottom: "1rem" }}>
                          <strong style={{ color: "var(--ink-dark)", display: "block", marginBottom: "2px" }}>Intention Set:</strong>
                          <div style={{ fontFamily: "var(--font-cursive)", fontSize: "18px", color: "#2a4a35", lineHeight: "1.4" }}>
                            {log.intention}
                          </div>
                        </div>
                      )}
                      
                      {(log.sleep !== null || log.energy !== null || (log.hydration && log.hydration > 0)) && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "1rem", background: "var(--page-warm)", padding: "0.75rem", borderRadius: "4px", border: "1px solid var(--ink-faint)" }}>
                          {log.sleep !== null && <div style={{ fontSize: "12px" }}>💤 <strong>{log.sleep}</strong> hrs sleep</div>}
                          {log.energy !== null && <div style={{ fontSize: "12px" }}>⚡ <strong>{log.energy}</strong>/10 energy</div>}
                          {log.hydration > 0 && <div style={{ fontSize: "12px" }}>💧 <strong>{log.hydration}</strong>/8 glasses</div>}
                        </div>
                      )}
                      
                      {log.note && (
                        <div>
                          <strong style={{ color: "var(--ink-dark)", display: "block", marginBottom: "2px" }}>Margin Annotations:</strong>
                          <div style={{ fontFamily: "var(--font-cursive)", fontSize: "18px", color: "#665040", fontStyle: "italic", lineHeight: "1.4" }}>
                            "{log.note}"
                          </div>
                        </div>
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
