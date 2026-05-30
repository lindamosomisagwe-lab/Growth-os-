import React, { useState, useEffect } from "react";

function dispatchSave() { window.dispatchEvent(new Event("growth_os_save")); }

// ── Tap-to-fill water glass SVG ───────────────────────────────────────────────
function WaterGlass({ filled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={filled ? "Glass filled – tap to empty" : "Empty glass – tap to fill"}
      style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", transition: "transform 0.15s ease" }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.12)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Glass outline */}
        <path d="M4 6 L8 44 H28 L32 6 Z" stroke="var(--text-primary)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        {/* Water fill — animated with CSS clip */}
        {filled && (
          <path d="M8.5 44 L9 16 H27 L27.5 44 Z" fill="#60a5fa" opacity="0.8" style={{ transition: "all 0.3s ease" }}>
            <animate attributeName="opacity" from="0.3" to="0.8" dur="0.3s" fill="freeze" />
          </path>
        )}
        {/* Rim line */}
        <line x1="4" y1="6" x2="32" y2="6" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export default function FloWellness() {
  const [wellness, setWellness] = useState(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.wellness) return parsed.wellness;
      } catch (e) {}
    }
    return { hydration: false, nutrition: false, cycleDay: 1, waterGlasses: 0, notes: "" };
  });

  const [toast, setToast] = useState({ show: false, message: "" });

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.wellness = wellness;
    localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
    dispatchSave();
  }, [wellness]);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: "" }), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const triggerToast = msg => setToast({ show: true, message: msg.toUpperCase() });
  const changeVal = (field, val) => setWellness(prev => ({ ...prev, [field]: val }));

  const toggleGlass = (glassIndex) => {
    // Tap to fill up to this glass; if already filled, empty it
    const next = wellness.waterGlasses === glassIndex + 1 ? glassIndex : glassIndex + 1;
    changeVal("waterGlasses", next);
    triggerToast(`${next} / 8 glasses logged`);
  };

  const toggleCheck = field => {
    setWellness(prev => {
      const next = { ...prev, [field]: !prev[field] };
      triggerToast(next[field] ? `${field} target reached` : `${field} reset`);
      return next;
    });
  };

  return (
    <div style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
      <header style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
        <h2 style={{ margin: "0", fontSize: "1.6rem", fontWeight: "800", letterSpacing: "-0.03em" }}>Wellness & Biometrics</h2>
        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
          PHYSIOLOGICAL STATE METRICS // HYDRATION INDEX
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>

        {/* Cycle Tracker */}
        <div className="stationery-card" style={{ padding: "2rem" }}>
          <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.1rem", fontWeight: "800", letterSpacing: "-0.02em" }}>Cycle Tracker</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.75rem", fontWeight: "700", fontSize: "0.85rem", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>
                Current Cycle Day:
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button onClick={() => { changeVal("cycleDay", Math.max(1, wellness.cycleDay - 1)); triggerToast("cycle day decremented"); }} className="btn-secondary" style={{ width: "38px", height: "38px", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>-</button>
                <span style={{ fontSize: "2.5rem", fontWeight: "800", fontFamily: "var(--font-mono)", minWidth: "50px", textAlign: "center" }}>{wellness.cycleDay}</span>
                <button onClick={() => { changeVal("cycleDay", Math.min(35, wellness.cycleDay + 1)); triggerToast("cycle day incremented"); }} className="btn-secondary" style={{ width: "38px", height: "38px", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>+</button>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.6", fontStyle: "italic" }}>
              Mapped against 21–35 day biological baselines for operational physical consistency.
            </p>
          </div>
        </div>

        {/* Hydration & Nutrition Card */}
        <div className="stationery-card" style={{ padding: "2rem" }}>
          <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.1rem", fontWeight: "800", letterSpacing: "-0.02em" }}>Hydration & Fuel</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* ── 8 Water Glass Icons ── */}
            <div>
              <label style={{ display: "block", marginBottom: "0.75rem", fontWeight: "700", fontSize: "0.85rem", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>
                Water Intake:
              </label>
              <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                  <WaterGlass key={i} filled={i < wellness.waterGlasses} onToggle={() => toggleGlass(i)} />
                ))}
              </div>
              {/* Real-time count */}
              <div style={{ marginTop: "0.75rem", fontFamily: "var(--font-mono)", fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)" }}>
                {wellness.waterGlasses} / 8 glasses
              </div>
              {/* Contextual note */}
              <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.78rem", color: "var(--text-secondary)", fontStyle: "italic", lineHeight: 1.6 }}>
                Tracking hydration helps correlate your energy levels with your cycle phase.
              </p>
            </div>

            <hr style={{ margin: "0.25rem 0" }} />

            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: "700" }}>
              <input type="checkbox" checked={wellness.hydration} onChange={() => toggleCheck("hydration")} style={{ width: "1rem", height: "1rem" }} />
              Hydration target reached
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: "700" }}>
              <input type="checkbox" checked={wellness.nutrition} onChange={() => toggleCheck("nutrition")} style={{ width: "1rem", height: "1rem" }} />
              Healthy balanced meals logged
            </label>
          </div>
        </div>
      </div>

      {/* Daily Wellness Log */}
      <div className="stationery-card" style={{ marginTop: "1.5rem", padding: "2rem" }}>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: "800", letterSpacing: "-0.02em" }}>Daily Wellness Log</h3>
        <textarea
          placeholder="Enter symptoms, sleep duration, physical logs or recoveries…"
          value={wellness.notes || ""}
          onChange={e => changeVal("notes", e.target.value)}
          onBlur={() => triggerToast("records archived")}
          rows={3}
          style={{ width: "100%", padding: "0.8rem", boxSizing: "border-box", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}
        />
      </div>

      {toast.show && <div className="toast-notification">{toast.message}</div>}
    </div>
  );
}
