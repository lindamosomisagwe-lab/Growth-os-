import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase-config";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

// Handle both real Firestore Timestamps and mock ISO strings
const parseDate = (val) => {
  if (!val) return new Date();
  if (typeof val === "function") return new Date();
  if (val && typeof val.toDate === "function") return val.toDate(); // real Timestamp
  if (typeof val === "string") return new Date(val);                // mock ISO string
  if (val instanceof Date) return val;
  return new Date();
};

const moods = [
  { emoji: "😁", label: "Great",  id: "happy"   },
  { emoji: "😌", label: "Good",   id: "content"  },
  { emoji: "😐", label: "OK",     id: "neutral"  },
  { emoji: "😔", label: "Low",    id: "sad"      },
  { emoji: "🤕", label: "Rough",  id: "angry"    },
];

export default function DailyLog({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [mood, setMood] = useState("");
  const [win, setWin] = useState("");
  const [intention, setIntention] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);

  const [showMore, setShowMore] = useState(false);
  const [hydration, setHydration] = useState(0);
  const [sleep, setSleep] = useState(7);
  const [energy, setEnergy] = useState(5);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetchLogs();
  }, [user]);

  const fetchLogs = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const q = query(collection(db, "daily_logs"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const fetched = snap.docs.map(d => {
        const data = d.data();
        const createdDate = parseDate(data.createdAt);
        const dateStr = createdDate.toLocaleDateString("en-US", {
          weekday: "short", month: "short", day: "numeric", year: "numeric"
        });
        return { id: d.id, date: dateStr, timestamp: createdDate.getTime(), ...data };
      });
      fetched.sort((a, b) => b.timestamp - a.timestamp);
      setLogs(fetched);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setFetchError("Couldn't load past check-ins.");
      setLogs([]);
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
        createdAt: serverTimestamp(),
      });
      // Reset
      setMood(""); setWin(""); setIntention("");
      setShowMore(false); setHydration(0); setSleep(7); setEnergy(5); setNote("");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchLogs();
    } catch (err) {
      console.error("Failed to save check-in:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading check-ins…</div>
      </div>
    );
  }

  return (
    <div style={{
      color: "#1B1D1D",
      fontFamily: "'Inter', sans-serif",
      maxWidth: "640px",
      margin: "0 auto",
      padding: "0 24px 80px",
    }}>
      {/* Header */}
      <header style={{ marginBottom: "24px", borderBottom: "1px solid rgba(27,31,29,0.08)", paddingBottom: "16px", paddingTop: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", color: "#1B1D1D", margin: 0 }}>
          Check-in.
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          The 60-second journal ritual.
        </p>
      </header>

      {/* Save success banner */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: "#E8F5E9", border: "1px solid #A5D6A7", borderRadius: "10px",
              padding: "12px 16px", marginBottom: "16px", fontSize: "14px",
              color: "#2E7D32", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px"
            }}
          >
            ✓ Entry saved! Keep the streak going.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Journal Card */}
      <div style={{
        background: "#FFFFFF",
        border: "1px solid rgba(27,31,29,0.08)",
        borderRadius: "12px",
        padding: "28px",
        marginBottom: "32px",
      }}>
        {/* Date */}
        <div style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "24px", fontWeight: 600 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>

        {/* Mood */}
        <section style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1B1D1D", margin: "0 0 12px 0" }}>
            How is today going?
          </h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {moods.map(m => {
              const active = mood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  style={{
                    flex: 1, minWidth: "80px",
                    padding: "12px 6px",
                    background: active ? "#1B1D1D" : "transparent",
                    color: active ? "#FFFFFF" : "#1B1D1D",
                    border: `1px solid ${active ? "#1B1D1D" : "rgba(27,31,29,0.12)"}`,
                    borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = "#607A66"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = "rgba(27,31,29,0.12)"; }}
                >
                  <span style={{ fontSize: "20px" }}>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Win & Intention */}
        <section style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "24px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1B1D1D", margin: "0 0 4px 0" }}>One win from today</h3>
            <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>Even the smallest highlight counts.</p>
            <textarea
              placeholder="e.g. Cleared my desk and made a perfect cup of tea…"
              value={win}
              onChange={e => setWin(e.target.value)}
              rows={2}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#607A66"}
              onBlur={e => e.target.style.borderColor = "rgba(27,31,29,0.12)"}
            />
          </div>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1B1D1D", margin: "0 0 4px 0" }}>One intention for tomorrow</h3>
            <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>Name one single high-impact intention.</p>
            <textarea
              placeholder="e.g. Finalize the project roadmap outline."
              value={intention}
              onChange={e => setIntention(e.target.value)}
              rows={2}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#607A66"}
              onBlur={e => e.target.style.borderColor = "rgba(27,31,29,0.12)"}
            />
          </div>
        </section>

        {/* Optional extras */}
        {!showMore ? (
          <button
            onClick={() => setShowMore(true)}
            style={{
              background: "none", border: "none", color: "#607A66", cursor: "pointer",
              fontStyle: "italic", fontSize: "13px", fontWeight: 600,
              padding: "4px 0", display: "flex", alignItems: "center", gap: "4px",
              outline: "none",
            }}
          >
            ✦ Track hydration, sleep & energy
          </button>
        ) : (
          <AnimatePresence>
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "16px", border: "1px dashed rgba(27,31,29,0.12)", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "16px", marginBottom: "16px" }}>

                {/* Hydration */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Hydration</span>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "monospace" }}>{hydration} / 8 glasses</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {[...Array(8)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setHydration(i + 1 === hydration ? i : i + 1)}
                        style={{
                          flex: "1 0 30px", height: "30px",
                          border: "1px solid rgba(27,31,29,0.12)", borderRadius: "50%",
                          background: i < hydration ? "#607A66" : "transparent",
                          color: i < hydration ? "#FFFFFF" : "rgba(27,31,29,0.3)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          padding: 0, cursor: "pointer", fontSize: "12px",
                        }}
                      >
                        {i < hydration ? "💧" : "•"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sleep */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Sleep Quality</span>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{sleep} / 10 hrs</span>
                  </div>
                  <input type="range" min="1" max="10" value={sleep} onChange={e => setSleep(parseInt(e.target.value))} style={{ accentColor: "#607A66", width: "100%" }} />
                </div>

                {/* Energy */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Energy Level</span>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{energy} / 10</span>
                  </div>
                  <input type="range" min="1" max="10" value={energy} onChange={e => setEnergy(parseInt(e.target.value))} style={{ accentColor: "#607A66", width: "100%" }} />
                </div>

                {/* Notes */}
                <div>
                  <span style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Additional Reflections</span>
                  <textarea
                    placeholder="Write down any physical or mental notes…"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={3}
                    style={inputStyle}
                  />
                </div>

                <button
                  onClick={() => setShowMore(false)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "12px", alignSelf: "flex-end" }}
                >
                  ↑ Hide extras
                </button>
              </div>
            </motion.section>
          </AnimatePresence>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!mood || isSaving}
          style={{
            width: "100%", marginTop: "20px", padding: "13px",
            background: mood ? "#1B1D1D" : "rgba(27,31,29,0.1)",
            color: mood ? "#FFFFFF" : "rgba(27,31,29,0.3)",
            border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700,
            cursor: mood ? "pointer" : "not-allowed",
            transition: "all 0.2s ease",
          }}
        >
          {isSaving ? "Saving…" : "Save Today's Entry"}
        </button>
      </div>

      {/* Error state */}
      {fetchError && (
        <div style={{ background: "#FFF3E0", border: "1px solid #FFCC80", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "#E65100" }}>
          ⚠️ {fetchError}
        </div>
      )}

      {/* Past Entries */}
      {logs.length > 0 && (
        <div>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", fontWeight: 600, color: "#1B1D1D", marginBottom: "16px" }}>
            Recent
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {logs.map(log => {
              const isExpanded = expandedLogId === log.id;
              const logMood = moods.find(m => m.id === log.mood) || moods[2];
              return (
                <div
                  key={log.id}
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  style={{
                    padding: "16px 20px", cursor: "pointer",
                    background: "#FFFFFF",
                    border: "1px solid rgba(27,31,29,0.08)",
                    borderLeft: "4px solid #607A66",
                    borderRadius: "12px", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(27,31,29,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "24px" }}>{logMood.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "14px", color: "#1B1D1D" }}>{log.date}</div>
                        {log.win && !isExpanded && (
                          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "360px" }}>
                            {log.win}
                          </div>
                        )}
                      </div>
                    </div>
                    <span style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 700, flexShrink: 0 }}>
                      {isExpanded ? "CLOSE ▲" : "OPEN ▼"}
                    </span>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(27,31,29,0.08)", fontSize: "13px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "12px" }}>
                      {log.win && (
                        <div>
                          <strong style={{ color: "#1B1D1D", display: "block", marginBottom: "4px" }}>One win from today:</strong>
                          <div style={{ fontSize: "14px", color: "#5C615C", lineHeight: "1.5" }}>{log.win}</div>
                        </div>
                      )}
                      {log.intention && (
                        <div>
                          <strong style={{ color: "#1B1D1D", display: "block", marginBottom: "4px" }}>Intention for tomorrow:</strong>
                          <div style={{ fontSize: "14px", color: "#5C615C", lineHeight: "1.5" }}>{log.intention}</div>
                        </div>
                      )}
                      {(log.sleep != null || log.energy != null || log.hydration > 0) && (
                        <div style={{ display: "flex", gap: "16px", background: "rgba(27,31,29,0.02)", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(27,31,29,0.05)", flexWrap: "wrap" }}>
                          {log.sleep != null && <span>💤 <strong>{log.sleep}</strong> hrs</span>}
                          {log.energy != null && <span>⚡ <strong>{log.energy}</strong>/10 energy</span>}
                          {log.hydration > 0 && <span>💧 <strong>{log.hydration}</strong>/8 glasses</span>}
                        </div>
                      )}
                      {log.note && (
                        <div>
                          <strong style={{ color: "#1B1D1D", display: "block", marginBottom: "4px" }}>Reflections:</strong>
                          <div style={{ fontSize: "14px", color: "#5C615C", fontStyle: "italic", lineHeight: "1.5" }}>"{log.note}"</div>
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

      {/* Empty state */}
      {!loading && logs.length === 0 && !fetchError && (
        <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>📓</div>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>No entries yet</div>
          <div style={{ fontSize: "13px" }}>Save your first check-in above to start your streak.</div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
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
  transition: "border-color 0.2s",
};
