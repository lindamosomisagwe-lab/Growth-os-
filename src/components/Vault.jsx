import React, { useState, useEffect } from "react";
import { useGamification } from "../contexts/GamificationContext";

function dispatchSave() { window.dispatchEvent(new Event("growth_os_save")); }

export default function Vault() {
  const { awardXP } = useGamification();
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

  const addCapsule = async () => {
    if (!capTitle.trim() || !capMessage.trim() || !revealDate) return;
    const newCapsule = {
      id: Date.now(),
      title: capTitle.trim(),
      message: capMessage.trim(),
      revealDate,
      createdAt: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    };
    setCapsules(prev => [...prev, newCapsule]);
    setCapTitle(""); setCapMessage(""); setRevealDate("");
    await awardXP("seal_letter");
  };

  const addChapter = () => {
    if (!chapTitle.trim() || !chapNote.trim()) return;
    const newChapter = {
      id: Date.now(),
      title: chapTitle.trim(),
      phase: chapPhase.trim() || new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
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
    <div style={{ color: "var(--ink-dark)", fontFamily: "var(--font-sans)", maxWidth: "100%", margin: "0 auto", paddingBottom: "4rem" }}>
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid var(--ink-faint)", paddingBottom: "16px" }}>
        <div>
          <h2 className="page-title">The Vault</h2>
          <p className="page-subtitle" style={{ margin: "4px 0 0 0" }}>
            A secure archive for deep thoughts and personal records.
          </p>
        </div>
      </header>

      {/* Elegant Sub-navigation Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2.5rem" }}>
        <button
          onClick={() => setActiveTab("letters")}
          style={{
            padding: "8px 18px", 
            borderRadius: "4px", 
            fontSize: "13px",
            fontWeight: "600",
            background: activeTab === "letters" ? "rgba(122,92,139,0.12)" : "transparent",
            color: activeTab === "letters" ? "var(--accent-plum)" : "var(--ink-medium)",
            border: `1.5px solid ${activeTab === "letters" ? "var(--accent-plum)" : "transparent"}`,
            cursor: "pointer", 
            transition: "all 0.15s ease"
          }}
        >
          ✉️ Letters to Myself
        </button>
        <button
          onClick={() => setActiveTab("story")}
          style={{
            padding: "8px 18px", 
            borderRadius: "4px", 
            fontSize: "13px",
            fontWeight: "600",
            background: activeTab === "story" ? "rgba(122,92,139,0.12)" : "transparent",
            color: activeTab === "story" ? "var(--accent-plum)" : "var(--ink-medium)",
            border: `1.5px solid ${activeTab === "story" ? "var(--accent-plum)" : "transparent"}`,
            cursor: "pointer", 
            transition: "all 0.15s ease"
          }}
        >
          📖 My Life Story
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

        {activeTab === "letters" && (
          <>
            {/* Writing Ruled Parchment Card */}
            <div className="letter-card" style={{ width: "100%" }}>
              <h3 style={{ fontFamily: "var(--font-serif)", margin: "0 0 4px 0", fontSize: "20px", fontWeight: "700" }}>Write to your future self</h3>
              <p style={{ margin: "0 0 24px 0", fontSize: "12px", color: "var(--ink-medium)", fontStyle: "italic" }}>Seal away a thought or hope, and read it when the time is right.</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-medium)", marginBottom: "6px", fontWeight: "700" }}>Subject Title</label>
                  <input type="text" placeholder="e.g. A reminder about today's mindset..." value={capTitle} onChange={e => setCapTitle(e.target.value)} style={{ width: "100%" }} />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-medium)", marginBottom: "6px", fontWeight: "700" }}>Your Correspondence</label>
                  <textarea 
                    placeholder="Dear future me, write down what you are feeling..." 
                    value={capMessage} 
                    onChange={e => setCapMessage(e.target.value)} 
                    rows={5} 
                    style={{ 
                      width: "100%", 
                      resize: "vertical",
                      fontFamily: "var(--font-cursive)",
                      fontSize: "18px",
                      lineHeight: "27px",
                      color: "#2a1c40",
                      background: "transparent !important"
                    }} 
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-medium)", marginBottom: "6px", fontWeight: "700" }}>When should this letter unlock?</label>
                  <input type="date" value={revealDate} onChange={e => setRevealDate(e.target.value)} style={{ width: "100%" }} />
                </div>
                
                <button 
                  onClick={addCapsule} 
                  className="btn-primary" 
                  style={{ 
                    marginTop: "0.5rem", 
                    padding: "12px",
                    background: "var(--accent-plum) !important",
                    color: "#ffffff !important",
                    boxShadow: "0 3px 0 #4a2a6a !important"
                  }}
                >
                  Seal with Wax
                </button>
              </div>
            </div>

            {/* List of Past Sealed/Unlocked Letters */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h3 style={{ fontFamily: "var(--font-serif)", margin: "0 0 4px 0", fontSize: "18px", fontWeight: "600" }}>Private Correspondence</h3>
              
              {capsules.length === 0 ? (
                <div style={{ padding: "3rem", border: "1px dashed var(--ink-faint)", textAlign: "center", color: "var(--ink-light)", borderRadius: "6px", fontStyle: "italic" }}>
                  No letters sealed in the vault yet.
                </div>
              ) : (
                capsules.map(c => {
                  const unlocked = isUnlocked(c.revealDate);
                  return (
                    <div key={c.id}>
                      {unlocked ? (
                        /* Unlocked letter cards styled as beautiful ruled letter sheets */
                        <div className="letter-card" style={{ width: "100%", position: "relative", marginBottom: "1rem" }}>
                          <button 
                            onClick={() => setCapsules(prev => prev.filter(item => item.id !== c.id))} 
                            style={{ position: "absolute", top: "16px", right: "20px", background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer", fontSize: "15px" }}
                          >
                            ✕
                          </button>
                          
                          <div className="letter-salutation">Dear Future Self,</div>
                          
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                            <div>
                              <h4 style={{ fontFamily: "var(--font-serif)", margin: "0 0 2px 0", fontSize: "16px", fontWeight: "700", color: "var(--ink-dark)" }}>
                                Unlocked: {c.title}
                              </h4>
                              <span style={{ fontSize: "11px", color: "var(--ink-light)" }}>
                                Penned {c.createdAt} • Unlocked on {c.revealDate}
                              </span>
                            </div>
                          </div>
                          
                          <div style={{ 
                            fontFamily: "var(--font-cursive)", 
                            fontSize: "18px", 
                            lineHeight: "27px", 
                            whiteSpace: "pre-wrap", 
                            color: "#2a1c40", 
                            background: "transparent", 
                            padding: "0.25rem 0" 
                          }}>
                            {c.message}
                          </div>
                        </div>
                      ) : (
                        /* Locked letter styled as sealed envelopes with wax-seal stamp indicators */
                        <div className="sealed-letter" style={{ width: "100%", justifyContent: "space-between", position: "relative" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            {/* Real beautiful wax-seal element */}
                            <div className="wax-seal">
                              <span style={{ color: "#ffffff", fontWeight: "bold" }}>⚜️</span>
                            </div>
                            <div>
                              <h4 style={{ fontFamily: "var(--font-serif)", margin: "0 0 2px 0", fontSize: "15px", fontWeight: "700", color: "var(--ink-dark)" }}>
                                Locked: {c.title}
                              </h4>
                              <span style={{ fontSize: "11px", color: "var(--ink-light)" }}>
                                Sealed {c.createdAt} • Opens {new Date(c.revealDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => setCapsules(prev => prev.filter(item => item.id !== c.id))} 
                            style={{ background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer", fontSize: "14px", marginRight: "4px" }}
                          >
                            ✕
                          </button>
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
            {/* Adding Chapter to Story */}
            <div className="nb-card vault" style={{ width: "100%", padding: "2rem" }}>
              <h3 style={{ fontFamily: "var(--font-serif)", margin: "0 0 4px 0", fontSize: "20px", fontWeight: "700" }}>Add to your story</h3>
              <p style={{ margin: "0 0 24px 0", fontSize: "12px", color: "var(--ink-medium)", fontStyle: "italic" }}>Jot down a milestone or a memory you want to keep forever.</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-medium)", marginBottom: "6px", fontWeight: "700" }}>Chapter Title</label>
                  <input type="text" placeholder="e.g. Completed my first notebook chapter..." value={chapTitle} onChange={e => setChapTitle(e.target.value)} style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-medium)", marginBottom: "6px", fontWeight: "700" }}>Phase of Life / Date</label>
                  <input type="text" placeholder="e.g. Summer 2026, or today's date" value={chapPhase} onChange={e => setChapPhase(e.target.value)} style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-medium)", marginBottom: "6px", fontWeight: "700" }}>The Memory</label>
                  <textarea placeholder="Describe the lesson or memory of this key highlight..." value={chapNote} onChange={e => setChapNote(e.target.value)} rows={4} style={{ width: "100%", resize: "vertical" }} />
                </div>
                <button 
                  onClick={addChapter} 
                  className="btn-primary" 
                  style={{ 
                    marginTop: "0.5rem", 
                    padding: "12px",
                    background: "var(--accent-plum) !important",
                    color: "#ffffff !important",
                    boxShadow: "0 3px 0 #4a2a6a !important"
                  }}
                >
                  Save to your story
                </button>
              </div>
            </div>

            {/* Chapters Vertical Timeline list */}
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "1.5rem", 
              borderLeft: "2px solid var(--ink-faint)", 
              paddingLeft: "2rem", 
              marginLeft: "1rem", 
              position: "relative",
              marginTop: "1.5rem"
            }}>
              
              <h3 style={{ 
                fontFamily: "var(--font-serif)", 
                fontSize: "18px", 
                fontWeight: "600", 
                margin: "0", 
                position: "relative", 
                left: "-0.5rem",
                marginBottom: "0.5rem"
              }}>
                Your story so far
              </h3>
              
              {chapters.length === 0 ? (
                <div style={{ padding: "3rem", border: "1px dashed var(--ink-faint)", textAlign: "center", color: "var(--ink-light)", borderRadius: "6px", fontStyle: "italic", marginLeft: "-1rem" }}>
                  Your personal history is waiting to be penned.
                </div>
              ) : (
                chapters.map((c) => (
                  <div key={c.id} className="nb-card vault" style={{ padding: "1.5rem", position: "relative", width: "100%" }}>
                    {/* Real timeline dot positioned on the timeline vector */}
                    <div style={{ 
                      position: "absolute", 
                      left: "-2.35rem", 
                      top: "1.75rem", 
                      width: "10px", 
                      height: "10px", 
                      borderRadius: "50%", 
                      background: "var(--accent-plum)", 
                      border: "2px solid #f4f2f6" 
                    }} />
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <div>
                        <h4 style={{ fontFamily: "var(--font-serif)", margin: "0 0 2px 0", fontSize: "16px", fontWeight: "700", color: "var(--ink-dark)" }}>
                          {c.title}
                        </h4>
                        <span style={{ fontSize: "11px", color: "var(--ink-light)", fontWeight: "600" }}>
                          {c.phase}
                        </span>
                      </div>
                      <button onClick={() => setChapters(prev => prev.filter(item => item.id !== c.id))} style={{ background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer", fontSize: "14px" }}>✕</button>
                    </div>
                    
                    <div style={{ 
                      fontFamily: "var(--font-cursive)", 
                      fontSize: "18px", 
                      lineHeight: "1.4", 
                      color: "#2a1c40", 
                      whiteSpace: "pre-wrap",
                      marginTop: "12px",
                      borderTop: "1px solid var(--ink-faint)",
                      paddingTop: "10px"
                    }}>
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
