import React, { useState, useEffect } from "react";

export default function FloWellness() {
  const [wellness, setWellness] = useState(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.wellness) return parsed.wellness;
      } catch (e) {}
    }
    return {
      hydration: false,
      nutrition: false,
      cycleDay: 1,
      waterGlasses: 0,
      notes: ""
    };
  });

  const [toast, setToast] = useState({ show: false, message: "" });

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.wellness = wellness;
    localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
  }, [wellness]);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: "" }), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const triggerToast = msg => setToast({ show: true, message: msg.toUpperCase() });

  const toggleCheck = field => {
    setWellness(prev => {
      const next = { ...prev, [field]: !prev[field] };
      triggerToast(next[field] ? `${field} target reached` : `${field} reset`);
      return next;
    });
  };

  const changeVal = (field, val) => {
    setWellness(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div style={{ color: "#ffffff", fontFamily: "var(--font-sans)" }}>
      <header style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
        <h2 style={{ margin: "0", fontSize: "1.6rem", fontWeight: "800", letterSpacing: "-0.03em", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          Wellness &amp; Biometrics
        </h2>
        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#888888", fontFamily: "var(--font-mono)", }}>
          PHYSIOLOGICAL STATE METRICS // HYDRATION INDEX
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {/* Flo Cycle Tracker Card */}
        <div className="stationery-card" style={{ padding: "2rem" }}>
          <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.1rem", fontWeight: "800", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Cycle Tracker
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.75rem", fontWeight: "700", fontSize: "0.85rem", color: "#888888", letterSpacing: "0.02em", }}>
                Current Cycle Day:
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button
                  onClick={() => {
                    changeVal("cycleDay", Math.max(1, wellness.cycleDay - 1));
                    triggerToast("cycle day decremented");
                  }}
                  className="btn-secondary"
                  style={{
                    borderRadius: "0px",
                    width: "38px",
                    height: "38px",
                    fontSize: "1.2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700"
                  }}
                >
                  -
                </button>
                <span style={{ fontSize: "2.5rem", fontWeight: "800", fontFamily: "var(--font-mono)", minWidth: "50px", textAlign: "center" }}>
                  {wellness.cycleDay}
                </span>
                <button
                  onClick={() => {
                    changeVal("cycleDay", Math.min(35, wellness.cycleDay + 1));
                    triggerToast("cycle day incremented");
                  }}
                  className="btn-secondary"
                  style={{
                    borderRadius: "0px",
                    width: "38px",
                    height: "38px",
                    fontSize: "1.2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700"
                  }}
                >
                  +
                </button>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#888888", lineHeight: "1.5" }}>
              Active logs mapped against 21-35 day biological baselines to determine operational physical consistency.
            </p>
          </div>
        </div>

        {/* Daily Hydration & Nutrition Card */}
        <div className="stationery-card" style={{ padding: "2rem" }}>
          <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.1rem", fontWeight: "800", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Hydration &amp; Fuel
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.75rem", fontWeight: "700", fontSize: "0.85rem", color: "#888888", letterSpacing: "0.02em", }}>
                Water Intake (Glasses / 8.0 Target):
              </label>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(glass => (
                  <span
                    key={glass}
                    onClick={() => {
                      const nextGlasses = wellness.waterGlasses === glass ? glass - 1 : glass;
                      changeVal("waterGlasses", nextGlasses);
                      triggerToast(`logged ${nextGlasses} glasses`);
                    }}
                    style={{
                      cursor: "pointer",
                      width: "30px",
                      height: "30px",
                      border: "1px solid #ffffff",
                      background: glass <= wellness.waterGlasses ? "#ffffff" : "transparent",
                      color: glass <= wellness.waterGlasses ? "#000000" : "#ffffff",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      fontWeight: "800",
                      display: "inline-grid",
                      placeContent: "center",
                      transition: "all 0.15s ease"
                    }}
                    title={`${glass} Glasses`}
                  >
                    {glass}
                  </span>
                ))}
              </div>
            </div>

            <hr style={{ margin: "0.5rem 0" }} />

            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: "700", color: "#ffffff" }}>
              <input
                type="checkbox"
                checked={wellness.hydration}
                onChange={() => toggleCheck("hydration")}
                style={{ width: "1rem", height: "1rem" }}
              />
              Hydration target reached
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: "700", color: "#ffffff" }}>
              <input
                type="checkbox"
                checked={wellness.nutrition}
                onChange={() => toggleCheck("nutrition")}
                style={{ width: "1rem", height: "1rem" }}
              />
              Healthy balanced meals logged
            </label>
          </div>
        </div>
      </div>

      {/* Wellness Notes Card */}
      <div className="stationery-card" style={{ marginTop: "1.5rem", padding: "2rem" }}>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: "800", letterSpacing: "-0.02em" }}>
          Daily Wellness Log
        </h3>
        <textarea
          placeholder="ENTER SYMPTOMS, SLEEP DURATION, PHYSICAL LOGS OR RECOVERIES..."
          value={wellness.notes || ""}
          onChange={e => changeVal("notes", e.target.value)}
          onBlur={() => triggerToast("records archived")}
          rows={3}
          style={{ width: "100%", padding: "0.8rem", boxSizing: "border-box", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}
        />
      </div>

      {toast.show && <div className="toast-notification">{toast.message}</div>}
    </div>
  );
}
