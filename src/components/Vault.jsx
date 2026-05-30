import React, { useState, useEffect } from "react";
import { useGamification } from "../contexts/GamificationContext";

function dispatchSave() { window.dispatchEvent(new Event("growth_os_save")); }

function EmptyState({ onCta }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.25rem", padding: "3.5rem 2rem", border: "1px dashed var(--border-color)", textAlign: "center" }}>
      <div style={{ opacity: 0.45 }}>
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="26" cy="26" r="20" stroke="var(--text-secondary)" strokeWidth="1.5" />
          <path d="M26 16 V26 L32 32" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="26" cy="26" r="2" fill="var(--text-secondary)" />
          <path d="M14 26 L10 26 M38 26 L42 26 M26 14 L26 10 M26 42 L26 38" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p style={{ margin: 0, fontSize: "1rem", color: "var(--text-secondary)", fontStyle: "italic", maxWidth: "300px", lineHeight: 1.7 }}>
        Seal a letter to your future self.
      </p>
      <button onClick={onCta} className="btn-primary" style={{ padding: "0.65rem 1.5rem", fontSize: "0.82rem", letterSpacing: "0.04em" }}>
        + Write Time Capsule
      </button>
    </div>
  );
}

export default function Vault() {
  const { addGp } = useGamification();
  const [capsules, setCapsules] = useState(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try { const parsed = JSON.parse(saved); if (parsed.vaultCapsules) return parsed.vaultCapsules; }
      catch (e) {}
    }
    return [];
  });

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [revealDate, setRevealDate] = useState("");
  const formRef = React.useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.vaultCapsules = capsules;
    localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
    dispatchSave();
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
    setTitle(""); setMessage(""); setRevealDate("");
    addGp(30, "vault_seal");
  };

  const isUnlocked = date => {
    const today = new Date().toISOString().split("T")[0];
    return today >= date;
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => formRef.current?.querySelector("input")?.focus(), 400);
  };

  return (
    <div style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
      <header style={{ marginBottom: "2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: "0", fontSize: "1.6rem", fontWeight: "800", letterSpacing: "-0.03em" }}>Time Vault Archive</h2>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
            SEALED PERSONAL CORRESPONDENCE // REVEAL ON DESIGNATED DATELINE
          </p>
        </div>
        <span style={{ fontSize: "1.8rem" }} aria-hidden="true">🕰️</span>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>

        {/* Create form */}
        <div ref={formRef} className="stationery-card module-vault" style={{ height: "fit-content", padding: "2rem" }}>
          <h3 style={{ margin: "0 0 1.2rem 0", fontSize: "1.1rem", fontWeight: "800", letterSpacing: "-0.02em" }}>Seal Time Capsule</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input type="text" placeholder="Capsule title (e.g. On Freelance Launch)…" value={title} onChange={e => setTitle(e.target.value)} style={{ width: "100%", letterSpacing: "0.02em" }} />
            <textarea placeholder="Enter private correspondence, advice or memories…" value={message} onChange={e => setMessage(e.target.value)} rows={4} style={{ width: "100%", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }} />
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                Reveal Dateline:
              </label>
              <input type="date" value={revealDate} onChange={e => setRevealDate(e.target.value)} style={{ width: "100%" }} />
            </div>
            <button onClick={addCapsule} className="btn-primary" style={{ marginTop: "0.5rem", width: "100%", letterSpacing: "0.05em" }}>
              Seal Capsule
            </button>
          </div>
        </div>

        {/* Capsule list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", overflowY: "auto", maxHeight: "500px", paddingRight: "0.5rem" }}>
          <h3 style={{ margin: "0", fontSize: "0.85rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>
            Sealed Correspondence Records
          </h3>
          {capsules.length === 0 ? (
            <EmptyState onCta={scrollToForm} />
          ) : (
            capsules.map(c => {
              const unlocked = isUnlocked(c.revealDate);
              return (
                <div key={c.id} className="stationery-card module-vault" style={{ borderLeft: `3px solid ${unlocked ? "var(--accent)" : "var(--border-color)"}`, padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div>
                      <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                        {unlocked ? "🔓" : "🔒"} {c.title}
                      </h4>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                        SEALED {c.createdAt} · UNLOCK: {c.revealDate}
                      </span>
                    </div>
                    <button onClick={() => setCapsules(prev => prev.filter(item => item.id !== c.id))} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.95rem" }}>✕</button>
                  </div>
                  {unlocked ? (
                    <div style={{ marginTop: "1rem", background: "var(--bg-page)", padding: "1rem", fontSize: "0.9rem", lineHeight: "1.6", whiteSpace: "pre-wrap", border: "1px dashed var(--border-color)", color: "var(--text-body)" }}>
                      {c.message}
                    </div>
                  ) : (
                    <div style={{ marginTop: "1rem", padding: "1rem", fontSize: "0.8rem", fontFamily: "var(--font-mono)", textAlign: "center", color: "var(--text-secondary)", border: "1px dashed var(--border-color)" }}>
                      ENCRYPTED SECURE UNTIL {new Date(c.revealDate).toLocaleDateString().toUpperCase()}
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
