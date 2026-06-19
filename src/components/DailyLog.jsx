import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase-config";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

const moods = [
  { emoji: "😁", label: "Great", id: "happy" },
  { emoji: "😌", label: "Good", id: "content" },
  { emoji: "😐", label: "OK", id: "neutral" },
  { emoji: "😔", label: "Low", id: "sad" },
  { emoji: "Rough", emojiChar: "🤕", label: "Rough", id: "angry" } // using emojiChar if needed, or emoji
];

export default function DailyLog({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState("");
  const [win, setWin] = useState("");
  const [intention, setIntention] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Optional extra tracking
  const [showMore, setShowMore] = useState(false);
  const [hydration, setHydration] = useState(0);
  const [sleep, setSleep] = useState(7);
  const [energy, setEnergy] = useState(5);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchLogs();
  }, [user]);

  const fetchLogs = async () => {
    try {
      setLoading(false);
      const q = query(collection(db, "daily_logs"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const fetched = snap.docs.map(d => {
        const data = d.data();
        const createdDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
        const dateStr = createdDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        return {
          id: d.id,
          date: dateStr,
          timestamp: createdDate.getTime(),
          ...data
        };
      });
      fetched.sort((a, b) => b.timestamp - a.timestamp);
      setLogs(fetched);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!mood || !user) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, "daily_logs"), {
        userId: user.uid,
        mood,
        win: win.trim(),
        intention: intention.trim(),
        hydration: showMore ? hydration : 0,
        sleep: showMore ? sleep : null,
        energy: showMore ? energy : null,
        note: showMore ? note.trim() : "",
        createdAt: serverTimestamp()
      });

      // Reset fields
      setMood("");
      setWin("");
      setIntention("");
      setShowMore(false);
      setHydration(0);
      setSleep(7);
      setEnergy(5);
      setNote("");
      fetchLogs();
    } catch (err) {
      console.error("Failed to save daily check-in log:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="content-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading check-ins...</div>
      </div>
    );
  }

  return (
    <div style={{ color: "#1B1D1D", fontFamily: "'Inter', sans-serif", maxWidth: "640px", margin: "0 auto", paddingBottom: "80px" }}>
      
      <header style={{ marginBottom: "24px", borderBottom: "1px solid rgba(27,31,29,0.08)", paddingBottom: "16px" }}>
        <h1 className="page-title" style={{ fontSize: "32px", fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", color: "#1B1D1D", margin: 0 }}>Check-in.</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>The 60-second journal ritual.</p>
      </header>

      {/* Main Journal Card */}
      <div 
        className="card" 
        style={{ 
          background: "#FFFFFF",
          border: "1px solid rgba(27,31,29,0.08)",
          borderRadius: "12px",
          padding: "32px",
          marginBottom: "32px"
        }}
      >
        {/* Elegant handwriting date header */}
        <div style={{ fontSize: "13px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "24px", fontWeight: 600 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        
        {/* Mood Section */}
        <section style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#1B1D1D", margin: "0 0 12px 0" }}>How is today going?</h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {moods.map(m => {
              const active = mood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  style={{
                    flex: 1,
                    minWidth: "90px",
                    padding: "12px 8px",
                    background: active ? "#1B1D1D" : "transparent",
                    color: active ? "#FFFFFF" : "#1B1D1D",
                    border: `1px solid ${active ? "#1B1D1D" : "rgba(27,31,29,0.12)"}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 600,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.borderColor = "#607A66";
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.borderColor = "rgba(27,31,29,0.12)";
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{m.emojiChar || m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Win & Intention Inputs */}
        <section style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "24px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#1B1D1D", margin: "0 0 4px 0" }}>One win from today</h3>
            <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>Even the smallest highlight counts.</p>
            <textarea
              placeholder="e.g. Cleared my desk and made a perfect cup of tea..."
              value={win} 
              onChange={e => setWin(e.target.value)}
              rows={2} 
              style={{
                width: "100%",
                background: "rgba(27,31,29,0.01)",
                border: "1px solid rgba(27,31,29,0.12)",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "14px",
                color: "#1B1D1D",
                outline: "none",
                resize: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "#607A66"}
              onBlur={e => e.target.style.borderColor = "rgba(27,31,29,0.12)"}
            />
          </div>
          
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#1B1D1D", margin: "0 0 4px 0" }}>One intention for tomorrow</h3>
            <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>Name one single high-impact intention.</p>
            <textarea
              placeholder="e.g. Finalize the project roadmap outline."
              value={intention} 
              onChange={e => setIntention(e.target.value)}
              rows={2} 
              style={{
                width: "100%",
                background: "rgba(27,31,29,0.01)",
                border: "1px solid rgba(27,31,29,0.12)",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "14px",
                color: "#1B1D1D",
                outline: "none",
                resize: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "#607A66"}
              onBlur={e => e.target.style.borderColor = "rgba(27,31,29,0.12)"}
            />
          </div>
        </section>

        {/* Optional details expander */}
        {!showMore ? (
          <button 
            onClick={() => setShowMore(true)} 
            style={{ 
              alignSelf: "flex-start", 
              background: "none", 
              border: "none", 
              color: "#607A66", 
              cursor: "pointer", 
              fontStyle: "italic", 
              fontSize: "13px", 
              fontWeight: "600",
              padding: "4px 0",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              outline: "none"
            }}
          >
            ✦ Track hydration, sleep & energy
          </button>
        ) : (
          <section style={{ padding: "16px", border: "1px dashed rgba(27,31,29,0.12)", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "16px", marginBottom: "16px" }}>
            
            {/* Hydration */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>Hydration</span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "monospace" }}>{hydration} / 8 glasses</span>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {[...Array(8)].map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setHydration(i + 1 === hydration ? i : i + 1)} 
                    style={{
                      flex: "1 0 30px", height: "30px", border: "1px solid rgba(27,31,29,0.12)", borderRadius: "50%",
                      background: i < hydration ? "#607A66" : "transparent",
                      color: i < hydration ? "#FFFFFF" : "rgba(27,31,29,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center", padding: 0, cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    {i < hydration ? "💧" : "•"}
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep Slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>Sleep Quality</span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{sleep} / 10 hours</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={sleep} 
                onChange={e => setSleep(parseInt(e.target.value))} 
                style={{ accentColor: "#607A66", width: "100%" }}
              />
            </div>

            {/* Energy Slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>Energy Level</span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{energy} / 10 rating</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={energy} 
                onChange={e => setEnergy(parseInt(e.target.value))} 
                style={{ accentColor: "#607A66", width: "100%" }}
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
                style={{
                  width: "100%", background: "rgba(27,31,29,0.01)", border: "1px solid rgba(27,31,29,0.12)", borderRadius: "8px", padding: "10px", fontSize: "13px", color: "#1B1D1D", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box"
                }}
              />
            </div>

          </section>
        )}

        <button 
          onClick={handleSave} 
          disabled={!mood || isSaving} 
          className="btn-primary"
          style={{ 
            padding: "12px", 
            fontSize: "14px", 
            width: "100%", 
            marginTop: "20px",
            fontWeight: 700,
            cursor: mood ? "pointer" : "not-allowed"
          }}
        >
          {isSaving ? "Saving Entry..." : "Save Today's Journal Entry"}
        </button>
      </div>

      {/* Archive List of Past Days */}
      {logs.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", fontWeight: "600", color: "#1B1D1D", marginBottom: "16px" }}>Recent</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {logs.map(log => {
              const isExpanded = expandedLogId === log.id;
              const logMood = moods.find(m => m.id === log.mood) || moods[2];
              
              return (
                <div 
                  key={log.id} 
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)} 
                  style={{ 
                    padding: "16px 20px", 
                    cursor: "pointer",
                    background: "#FFFFFF",
                    border: "1px solid rgba(27,31,29,0.08)",
                    borderLeft: "4px solid var(--amber)",
                    borderRadius: "12px",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "24px" }}>{logMood.emojiChar || logMood.emoji}</span>
                      <div>
                        <div style={{ fontWeight: "700", fontSize: "15px", color: "#1B1D1D" }}>{log.date}</div>
                        {log.win && !isExpanded && (
                          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "400px" }}>
                            {log.win}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: "bold" }}>
                      {isExpanded ? 'CLOSE' : 'OPEN'}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(27,31,29,0.08)", fontSize: "13px", color: "var(--text-secondary)" }}>
                      
                      {log.win && (
                        <div style={{ marginBottom: "12px" }}>
                          <strong style={{ color: "#1B1D1D", display: "block", marginBottom: "4px" }}>One win from today:</strong>
                          <div style={{ fontSize: "14px", color: "#5C615C", lineHeight: "1.4" }}>
                            {log.win}
                          </div>
                        </div>
                      )}

                      {log.intention && (
                        <div style={{ marginBottom: "12px" }}>
                          <strong style={{ color: "#1B1D1D", display: "block", marginBottom: "4px" }}>One intention for tomorrow:</strong>
                          <div style={{ fontSize: "14px", color: "#5C615C", lineHeight: "1.4" }}>
                            {log.intention}
                          </div>
                        </div>
                      )}
                      
                      {(log.sleep !== null || log.energy !== null || (log.hydration && log.hydration > 0)) && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px", background: "rgba(27,31,29,0.02)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(27,31,29,0.05)" }}>
                          {log.sleep !== null && <div>💤 <strong>{log.sleep}</strong> hrs sleep</div>}
                          {log.energy !== null && <div>⚡ <strong>{log.energy}</strong>/10 energy</div>}
                          {log.hydration > 0 && <div>💧 <strong>{log.hydration}</strong>/8 glasses</div>}
                        </div>
                      )}
                      
                      {log.note && (
                        <div>
                          <strong style={{ color: "#1B1D1D", display: "block", marginBottom: "4px" }}>Reflections:</strong>
                          <div style={{ fontSize: "14px", color: "#5C615C", fontStyle: "italic", lineHeight: "1.4" }}>
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
