import React, { useState, useEffect } from "react";

export default function LifeChapters() {
  const [chapters, setChapters] = useState(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.memories) return parsed.memories;
      } catch (e) {}
    }
    return [];
  });

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.memories = chapters;
    localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
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
      date: date || new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      text: note.trim(),
      title: title.trim(),
      photo: photo || null
    };
    setChapters(prev => [newChapter, ...prev]);
    setTitle("");
    setDate("");
    setNote("");
    setPhoto("");
  };

  return (
    <div style={{ color: "#ffffff", fontFamily: "var(--font-sans)" }}>
      <header style={{ marginBottom: "2rem", borderBottom: "1px solid #222222", paddingBottom: "1rem" }}>
        <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "1.8rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "-0.04em" }}>
          📓 Life Timeline Chronicles
        </h1>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#888888", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          ARCHIVE PERSONAL MILESTONES // HISTORICAL TIMELINE ENTRIES
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", alignItems: "start" }}>
        {/* Log a New Chapter Card */}
        <div className="stationery-card" style={{ padding: "2rem" }}>
          <h3 style={{ margin: "0 0 1.25rem 0", fontSize: "1.1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "-0.02em" }}>Log a New Chapter</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "#888888", marginBottom: "0.4rem", textTransform: "uppercase" }}>
                Chapter Title:
              </label>
              <input
                type="text"
                placeholder="E.G. LAUNCHING FREELANCE STABLE..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ width: "100%", textTransform: "uppercase" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "#888888", marginBottom: "0.4rem", textTransform: "uppercase" }}>
                Date or Custom Phase:
              </label>
              <input
                type="text"
                placeholder="E.G. SUMMER 2026, PHASE ONE"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ width: "100%", textTransform: "uppercase" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "#888888", marginBottom: "0.4rem", textTransform: "uppercase" }}>
                Reflective Chronology Note:
              </label>
              <textarea
                placeholder="WHAT MILESTONES WERE ACCOMPLISHED? WHAT DID THIS STAGE REVEAL?"
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={4}
                style={{ width: "100%", textTransform: "uppercase", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}
              />
            </div>

            {/* Photo Uploader */}
            <div style={{ borderTop: "1px dashed #222222", paddingTop: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "#888888", marginBottom: "0.5rem", textTransform: "uppercase" }}>
                📷 Attach Chapter Image:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ fontSize: "0.8rem", color: "#888888", width: "100%" }}
              />
              {photo && (
                <div style={{ position: "relative", marginTop: "1rem", display: "inline-block" }}>
                  <img
                    src={photo}
                    alt="Preview"
                    style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "0px", border: "1px solid #222222" }}
                  />
                  <button
                    onClick={() => setPhoto("")}
                    className="btn-secondary"
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      border: "1px solid #ffffff",
                      borderRadius: "0px",
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      fontSize: "0.6rem",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <button onClick={addChapter} className="btn-primary" style={{ marginTop: "0.5rem", width: "100%", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Document Chapter 🖋️
            </button>
          </div>
        </div>

        {/* Chapter Feed Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", overflowY: "auto", maxHeight: "600px", paddingRight: "0.5rem" }}>
          <h3 style={{ margin: "0", fontSize: "0.85rem", fontWeight: "800", textTransform: "uppercase", fontFamily: "var(--font-mono)", color: "#888888", letterSpacing: "0.05em" }}>
            Archive Chronicle Timeline
          </h3>

          {chapters.length === 0 ? (
            <div style={{
              padding: "3rem",
              borderRadius: "0px",
              border: "1px dashed #222222",
              textAlign: "center",
              color: "#888888",
              fontStyle: "italic",
              fontSize: "0.9rem"
            }}>
              TIMELINE STANDS EMPTY. CHRONICLE CURRENT PHASE TO LOG MILESTONES.
            </div>
          ) : (
            chapters.map(c => (
              <div key={c.id} className="stationery-card" style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "relative", padding: "1.5rem" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px dashed #222222", paddingBottom: "0.75rem" }}>
                  <div>
                    <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", fontWeight: "800", textTransform: "uppercase", color: "#ffffff", letterSpacing: "-0.01em" }}>
                      📓 {c.title || "Untitled Chapter"}
                    </h4>
                    <span style={{ fontSize: "0.75rem", color: "#888888", fontWeight: "700", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                      📅 PHASE: {c.date}
                    </span>
                  </div>
                  <button
                    onClick={() => setChapters(prev => prev.filter(item => item.id !== c.id))}
                    style={{ background: "none", border: "none", color: "#444444", cursor: "pointer", fontSize: "0.95rem" }}
                  >
                    ✕
                  </button>
                </div>

                {/* Content */}
                <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: "1.6", whiteSpace: "pre-wrap", color: "#c5c5c5", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                  {c.text}
                </p>

                {/* Photo */}
                {c.photo && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <img
                      src={c.photo}
                      alt={c.title}
                      style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "cover", borderRadius: "0px", border: "1px solid #222222" }}
                    />
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
