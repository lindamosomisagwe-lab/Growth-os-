import React, { useState, useEffect } from "react";
import { useGamification } from "../contexts/GamificationContext";

function dispatchSave() { window.dispatchEvent(new Event("growth_os_save")); }

function EmptyState({ onCta }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.25rem", padding: "3.5rem 2rem", border: "1px dashed var(--border-color)", textAlign: "center" }}>
      <div style={{ opacity: 0.45 }}>
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="10" width="40" height="32" rx="2" stroke="var(--text-secondary)" strokeWidth="1.5" />
          <path d="M16 10 V6" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M36 10 V6" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6 20 H46" stroke="var(--text-secondary)" strokeWidth="1.5" />
          <path d="M18 28 L24 34 L34 24" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p style={{ margin: 0, fontSize: "1rem", color: "var(--text-secondary)", fontStyle: "italic", maxWidth: "300px", lineHeight: 1.7 }}>
        Your story starts here.
      </p>
      <button onClick={onCta} className="btn-primary" style={{ padding: "0.65rem 1.5rem", fontSize: "0.82rem", letterSpacing: "0.04em" }}>
        + Log First Chapter
      </button>
    </div>
  );
}

export default function LifeChapters() {
  const { addGp } = useGamification();
  const [chapters, setChapters] = useState(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try { const parsed = JSON.parse(saved); if (parsed.memories) return parsed.memories; }
      catch (e) {}
    }
    return [];
  });

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState("");
  const formRef = React.useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.memories = chapters;
    localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
    dispatchSave();
  }, [chapters]);

  const handlePhotoUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const addChapter = () => {
    if (!title.trim() || !note.trim()) return;
    const newChapter = {
      id: Date.now(),
      date: date || new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
      text: note.trim(),
      title: title.trim(),
      photo: photo || null
    };
    setChapters(prev => [newChapter, ...prev]);
    setTitle(""); setDate(""); setNote(""); setPhoto("");
    addGp(40, "chapter_log");
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => formRef.current?.querySelector("input")?.focus(), 400);
  };

  return (
    <div style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
      <header style={{ marginBottom: "2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "1.8rem", fontWeight: "800", letterSpacing: "-0.04em" }}>
            Life Timeline Chronicles
          </h1>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
            ARCHIVE PERSONAL MILESTONES // HISTORICAL TIMELINE ENTRIES
          </p>
        </div>
        <span style={{ fontSize: "1.8rem" }} aria-hidden="true">📖</span>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", alignItems: "start" }}>

        {/* Log Form */}
        <div ref={formRef} className="stationery-card module-chapters" style={{ padding: "2rem" }}>
          <h3 style={{ margin: "0 0 1.25rem 0", fontSize: "1.1rem", fontWeight: "800", letterSpacing: "-0.02em" }}>Log a New Chapter</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                Chapter Title:
              </label>
              <input type="text" placeholder="E.g. Launching Freelance Studio…" value={title} onChange={e => setTitle(e.target.value)} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                Date or Custom Phase:
              </label>
              <input type="text" placeholder="E.g. Summer 2026, Phase One" value={date} onChange={e => setDate(e.target.value)} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                Reflective Chronology Note:
              </label>
              <textarea placeholder="What milestones were accomplished? What did this stage reveal?" value={note} onChange={e => setNote(e.target.value)} rows={4} style={{ width: "100%", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }} />
            </div>
            <div style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                📷 Attach Chapter Image:
              </label>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ fontSize: "0.8rem", color: "var(--text-secondary)", width: "100%" }} />
              {photo && (
                <div style={{ position: "relative", marginTop: "1rem", display: "inline-block" }}>
                  <img src={photo} alt="Preview" style={{ width: "80px", height: "80px", objectFit: "cover", border: "1px solid var(--border-color)" }} />
                  <button onClick={() => setPhoto("")} className="btn-secondary" style={{ position: "absolute", top: "-6px", right: "-6px", width: "20px", height: "20px", cursor: "pointer", fontSize: "0.6rem", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>✕</button>
                </div>
              )}
            </div>
            <button onClick={addChapter} className="btn-primary" style={{ marginTop: "0.5rem", width: "100%", letterSpacing: "0.05em" }}>
              Document Chapter
            </button>
          </div>
        </div>

        {/* Chapter Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", overflowY: "auto", maxHeight: "600px", paddingRight: "0.5rem" }}>
          <h3 style={{ margin: "0", fontSize: "0.85rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>
            Archive Chronicle Timeline
          </h3>
          {chapters.length === 0 ? (
            <EmptyState onCta={scrollToForm} />
          ) : (
            chapters.map(c => (
              <div key={c.id} className="stationery-card module-chapters" style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "relative", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px dashed var(--border-color)", paddingBottom: "0.75rem" }}>
                  <div>
                    <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                      📓 {c.title || "Untitled Chapter"}
                    </h4>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
                      📅 PHASE: {c.date}
                    </span>
                  </div>
                  <button onClick={() => setChapters(prev => prev.filter(item => item.id !== c.id))} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.95rem" }}>✕</button>
                </div>
                <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: "1.6", whiteSpace: "pre-wrap", color: "var(--text-body)", fontFamily: "var(--font-mono)" }}>
                  {c.text}
                </p>
                {c.photo && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <img src={c.photo} alt={c.title} style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "cover", border: "1px solid var(--border-color)" }} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
