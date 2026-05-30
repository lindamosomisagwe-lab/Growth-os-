import React, { useState, useEffect } from "react";

function dispatchSave() { window.dispatchEvent(new Event("growth_os_save")); }

export default function Vault() {
  const [activeTab, setActiveTab] = useState("letters"); // "letters" or "story"

  const [capsules, setCapsules] = useState(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try { const parsed = JSON.parse(saved); if (parsed.vaultCapsules) return parsed.vaultCapsules; }
      catch (e) {}
    }
    return [];
  });

  const [chapters, setChapters] = useState(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try { const parsed = JSON.parse(saved); if (parsed.lifeChapters) return parsed.lifeChapters; }
      catch (e) {}
    }
    return [];
  });

  const [capTitle, setCapTitle] = useState("");
  const [capMessage, setCapMessage] = useState("");
  const [revealDate, setRevealDate] = useState("");

  const [chapTitle, setChapTitle] = useState("");
  const [chapPhase, setChapPhase] = useState("");
  const [chapNote, setChapNote] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.vaultCapsules = capsules;
    parsed.lifeChapters = chapters;
    localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
    dispatchSave();
  }, [capsules, chapters]);

  const addCapsule = () => {
    if (!capTitle.trim() || !capMessage.trim() || !revealDate) return;
    const newCapsule = {
      id: Date.now(),
      title: capTitle.trim(),
      message: capMessage.trim(),
      revealDate,
      createdAt: new Date().toLocaleDateString()
    };
    setCapsules(prev => [...prev, newCapsule]);
    setCapTitle(""); setCapMessage(""); setRevealDate("");
  };

  const addChapter = () => {
    if (!chapTitle.trim() || !chapNote.trim()) return;
    const newChapter = {
      id: Date.now(),
      title: chapTitle.trim(),
      phase: chapPhase.trim() || new Date().toLocaleDateString(),
      note: chapNote.trim()
    };
    setChapters(prev => [newChapter, ...prev]);
    setChapTitle(""); setChapPhase(""); setChapNote("");
  };

  const isUnlocked = date => {
    const today = new Date().toISOString().split("T")[0];
    return today >= date;
  };

  return (
    <div style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)", maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem" }}>
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ margin: "0", fontSize: "2rem", fontWeight: "400", letterSpacing: "-0.02em" }}>The Vault</h2>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.95rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
            A safe place for your thoughts and memories.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2.5rem" }}>
        <button
          onClick={() => setActiveTab("letters")}
          style={{
            padding: "0.8rem 1.5rem", borderRadius: "12px", fontSize: "0.95rem",
            background: activeTab === "letters" ? "rgba(167,139,250,0.15)" : "transparent",
            color: activeTab === "letters" ? "var(--text-primary)" : "var(--text-secondary)",
            border: activeTab === "letters" ? "1px solid rgba(167,139,250,0.4)" : "1px solid transparent",
            cursor: "pointer", transition: "all 0.2s"
          }}
        >
          Letters to Myself
        </button>
        <button
          onClick={() => setActiveTab("story")}
          style={{
            padding: "0.8rem 1.5rem", borderRadius: "12px", fontSize: "0.95rem",
            background: activeTab === "story" ? "rgba(167,139,250,0.15)" : "transparent",
            color: activeTab === "story" ? "var(--text-primary)" : "var(--text-secondary)",
            border: activeTab === "story" ? "1px solid rgba(167,139,250,0.4)" : "1px solid transparent",
            cursor: "pointer", transition: "all 0.2s"
          }}
        >
          My Story
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

        {activeTab === "letters" && (
          <>
            <div className="stationery-card" style={{ padding: "2rem" }}>
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem", fontWeight: "600" }}>Write to your future self</h3>
              <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.9rem", color: "var(--text-secondary)", fontStyle: "italic" }}>Lock away a thought or hope, and read it when the time is right.</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Subject</label>
                  <input type="text" placeholder="e.g. A reminder about today..." value={capTitle} onChange={e => setCapTitle(e.target.value)} style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Your Letter</label>
                  <textarea placeholder="Dear future me..." value={capMessage} onChange={e => setCapMessage(e.target.value)} rows={5} style={{ width: "100%", fontSize: "0.95rem", resize: "vertical" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>When should this unlock?</label>
                  <input type="date" value={revealDate} onChange={e => setRevealDate(e.target.value)} style={{ width: "100%" }} />
                </div>
                <button onClick={addCapsule} className="btn-primary" style={{ marginTop: "0.5rem", padding: "1rem" }}>
                  Seal this letter
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: "400" }}>Past Letters</h3>
              
              {capsules.length === 0 ? (
                <div style={{ padding: "2rem", border: "1px dashed rgba(255,255,255,0.1)", textAlign: "center", color: "var(--text-secondary)", borderRadius: "16px", fontStyle: "italic" }}>
                  You haven't written any letters yet.
                </div>
              ) : (
                capsules.map(c => {
                  const unlocked = isUnlocked(c.revealDate);
                  return (
                    <div key={c.id} className="stationery-card" style={{ borderLeft: `3px solid ${unlocked ? "var(--accent)" : "rgba(255,255,255,0.1)"}`, padding: "1.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                        <div>
                          <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", fontWeight: "600", color: "var(--text-primary)" }}>
                            {unlocked ? "🔓" : "🔒"} {c.title}
                          </h4>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                            Written {c.createdAt} • {unlocked ? `Unlocked on ${c.revealDate}` : `Unlocks on ${c.revealDate}`}
                          </span>
                        </div>
                        <button onClick={() => setCapsules(prev => prev.filter(item => item.id !== c.id))} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
                      </div>
                      
                      {unlocked ? (
                        <div style={{ marginTop: "1.5rem", background: "rgba(255,255,255,0.02)", padding: "1.25rem", fontSize: "0.95rem", lineHeight: "1.6", whiteSpace: "pre-wrap", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                          {c.message}
                        </div>
                      ) : (
                        <div style={{ marginTop: "1rem", padding: "1rem", fontSize: "0.9rem", textAlign: "center", color: "var(--text-secondary)", background: "rgba(255,255,255,0.02)", borderRadius: "8px", fontStyle: "italic" }}>
                          This letter is sealed until {new Date(c.revealDate).toLocaleDateString()}.
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {activeTab === "story" && (
          <>
            <div className="stationery-card" style={{ padding: "2rem" }}>
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem", fontWeight: "600" }}>Add to your story</h3>
              <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.9rem", color: "var(--text-secondary)", fontStyle: "italic" }}>Jot down a milestone or a memory you want to keep.</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Chapter Title</label>
                  <input type="text" placeholder="e.g. Started a new job..." value={chapTitle} onChange={e => setChapTitle(e.target.value)} style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>When did this happen?</label>
                  <input type="text" placeholder="e.g. Summer 2026, or today's date" value={chapPhase} onChange={e => setChapPhase(e.target.value)} style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>The Memory</label>
                  <textarea placeholder="What made this moment special?" value={chapNote} onChange={e => setChapNote(e.target.value)} rows={4} style={{ width: "100%", fontSize: "0.95rem", resize: "vertical" }} />
                </div>
                <button onClick={addChapter} className="btn-primary" style={{ marginTop: "0.5rem", padding: "1rem" }}>
                  Save to your story
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", borderLeft: "2px solid rgba(255,255,255,0.06)", paddingLeft: "2rem", marginLeft: "1rem", position: "relative" }}>
              
              <h3 style={{ margin: "0", fontSize: "1.1rem", fontWeight: "400", position: "relative", left: "-0.5rem" }}>
                Your story so far
              </h3>
              
              {chapters.length === 0 ? (
                <div style={{ padding: "2rem", border: "1px dashed rgba(255,255,255,0.1)", textAlign: "center", color: "var(--text-secondary)", borderRadius: "16px", fontStyle: "italic" }}>
                  Your story is waiting to be written.
                </div>
              ) : (
                chapters.map((c) => (
                  <div key={c.id} className="stationery-card" style={{ padding: "1.5rem", position: "relative" }}>
                    {/* Timeline dot */}
                    <div style={{ position: "absolute", left: "-2.35rem", top: "1.75rem", width: "12px", height: "12px", borderRadius: "50%", background: "var(--accent)", border: "2px solid var(--bg-page)" }} />
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <div>
                        <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", fontWeight: "600", color: "var(--text-primary)" }}>
                          {c.title}
                        </h4>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                          {c.phase}
                        </span>
                      </div>
                      <button onClick={() => setChapters(prev => prev.filter(item => item.id !== c.id))} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
                    </div>
                    <div style={{ marginTop: "1rem", color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                      {c.note}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
