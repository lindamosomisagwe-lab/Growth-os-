import React, { useState, useEffect } from "react";

export default function Vault() {
  const [capsules, setCapsules] = useState(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.vaultCapsules) return parsed.vaultCapsules;
      } catch (e) {}
    }
    return [];
  });

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [revealDate, setRevealDate] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.vaultCapsules = capsules;
    localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
  }, [capsules]);

  const addCapsule = () => {
    if (!title.trim() || !message.trim() || !revealDate) return;
    const newCapsule = {
      id: Date.now(),
      title: title.trim(),
      message: message.trim(),
      revealDate,
      createdAt: new Date().toLocaleDateString()
    };
    setCapsules(prev => [...prev, newCapsule]);
    setTitle("");
    setMessage("");
    setRevealDate("");
  };

  const isUnlocked = date => {
    const today = new Date().toISOString().split("T")[0];
    return today >= date;
  };

  return (
    <div style={{ color: "#ffffff", fontFamily: "var(--font-sans)" }}>
      <header style={{ marginBottom: "2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
        <h2 style={{ margin: "0", fontSize: "1.6rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "-0.03em", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          Time Vault Archive
        </h2>
        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#888888", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          SEALED PERSONAL CORRESPONDENCE // REVEAL ON DESIGNATED DATELINE
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        {/* Create Capsule */}
        <div className="stationery-card" style={{ height: "fit-content", padding: "2rem" }}>
          <h3 style={{ margin: "0 0 1.2rem 0", fontSize: "1.1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
            Seal Time Capsule
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              type="text"
              placeholder="CAPSULE TITLE (E.G. ON FREELANCE LAUNCH)..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: "100%", textTransform: "uppercase", letterSpacing: "0.02em" }}
            />
            <textarea
              placeholder="ENTER PRIVATE CORRESPONDENCE, ADVICE OR MEMORIES..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              style={{ width: "100%", textTransform: "uppercase", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}
            />
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "#888888", marginBottom: "0.4rem", textTransform: "uppercase" }}>
                Reveal Dateline:
              </label>
              <input
                type="date"
                value={revealDate}
                onChange={e => setRevealDate(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <button onClick={addCapsule} className="btn-primary" style={{ marginTop: "0.5rem", width: "100%", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Seal Capsule ⏳
            </button>
          </div>
        </div>

        {/* Sealed Capsules list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", overflowY: "auto", maxHeight: "450px", paddingRight: "0.5rem" }}>
          <h3 style={{ margin: "0", fontSize: "0.85rem", fontWeight: "800", textTransform: "uppercase", fontFamily: "var(--font-mono)", color: "#888888", letterSpacing: "0.05em" }}>
            Sealed Correspondence Records
          </h3>
          {capsules.length === 0 ? (
            <p style={{ fontStyle: "italic", color: "#888888", textAlign: "center", padding: "3rem", border: "1px dashed var(--border-color)", fontSize: "0.9rem" }}>
              NO TIME CAPSULES SECURED IN STORAGE.
            </p>
          ) : (
            capsules.map(c => {
              const unlocked = isUnlocked(c.revealDate);
              return (
                <div key={c.id} className="stationery-card" style={{ borderLeft: unlocked ? "4px solid #ffffff" : "4px solid var(--border-color)", padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div>
                      <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", color: "#ffffff", letterSpacing: "-0.01em" }}>
                        {unlocked ? "🔓" : "🔒"} {c.title}
                      </h4>
                      <span style={{ fontSize: "0.75rem", color: "#888888", fontFamily: "var(--font-mono)" }}>
                        SEALED {c.createdAt} · UNLOCK DATELINE: {c.revealDate}
                      </span>
                    </div>
                    <button
                      onClick={() => setCapsules(prev => prev.filter(item => item.id !== c.id))}
                      style={{ background: "none", border: "none", color: "#444444", cursor: "pointer", fontSize: "0.95rem" }}
                    >
                      ✕
                    </button>
                  </div>

                  {unlocked ? (
                    <div style={{
                      marginTop: "1rem",
                      background: "#050505",
                      padding: "1rem",
                      borderRadius: "0px",
                      fontSize: "0.9rem",
                      lineHeight: "1.6",
                      whiteSpace: "pre-wrap",
                      border: "1px dashed var(--border-color)",
                      color: "#c5c5c5"
                    }}>
                      {c.message}
                    </div>
                  ) : (
                    <div style={{
                      marginTop: "1rem",
                      background: "transparent",
                      padding: "1rem",
                      borderRadius: "0px",
                      fontSize: "0.8rem",
                      fontFamily: "var(--font-mono)",
                      textAlign: "center",
                      color: "#888888",
                      border: "1px dashed var(--border-color)"
                    }}>
                      ⌛ ENCRYPTED SECURE UNTIL {new Date(c.revealDate).toLocaleDateString().toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
