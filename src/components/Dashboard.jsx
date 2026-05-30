import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function useAnimatedCounter(target, duration = 900, decimals = 0) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const run = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) frameRef.current = requestAnimationFrame(run);
    };
    frameRef.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, decimals]);
  return value;
}

// ── Setup Progress Banner ──────────────────────────────────────────────────────
function SetupBanner({ hasWheel, hasGoal, hasMood }) {
  const [dismissed, setDismissed] = useState(() => {
    const d = localStorage.getItem("growth_os_setup_dismissed");
    if (!d) return false;
    // Auto-hide after 3 days
    const ts = parseInt(d, 10);
    return Date.now() - ts < 3 * 24 * 60 * 60 * 1000;
  });

  const steps = [
    { label: "Map your Wheel of Life", done: hasWheel, to: "/wheel" },
    { label: "Set your first goal",    done: hasGoal,  to: "/goals" },
    { label: "Log today's mood",       done: hasMood,  to: "/mood"  },
  ];
  const completed = steps.filter(s => s.done).length;
  const allDone = completed === steps.length;

  useEffect(() => {
    if (allDone && !dismissed) {
      // Collapse after 3 days from first completion
      const existingTs = localStorage.getItem("growth_os_setup_dismissed");
      if (!existingTs) {
        localStorage.setItem("growth_os_setup_dismissed", String(Date.now()));
        setTimeout(() => setDismissed(true), 3000); // fade out quickly in same session
      }
    }
  }, [allDone, dismissed]);

  if (dismissed) return null;

  if (allDone) {
    return (
      <div style={{
        marginBottom: "2rem", padding: "1rem 1.5rem",
        border: "1px solid var(--border-color-active)",
        background: "rgba(127,119,221,0.06)",
        display: "flex", alignItems: "center", gap: "1rem"
      }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--accent)", fontWeight: "700", letterSpacing: "0.05em" }}>
          [GROWTH OS ACTIVATED ✓]
        </span>
        <span style={{ fontSize: "0.85rem", color: "var(--text-body)" }}>
          All systems operational. Your growth journey has begun.
        </span>
      </div>
    );
  }

  return (
    <div style={{
      marginBottom: "2rem", padding: "1.25rem 1.5rem",
      border: "1px solid var(--border-color)",
      background: "var(--bg-surface)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-secondary)", letterSpacing: "0.08em", fontWeight: "700" }}>
          [SYSTEM READY // SETUP PROGRESS]
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-body)", fontWeight: "700" }}>
          {completed} of {steps.length} complete
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: "3px", background: "rgba(0,0,0,0.08)", marginBottom: "1.25rem", borderRadius: "0" }}>
        <div style={{
          height: "100%", background: "var(--accent-gold)",
          width: `${(completed / steps.length) * 100}%`,
          transition: "width 0.5s ease",
          boxShadow: "0 0 6px rgba(201,168,76,0.4)"
        }} />
      </div>

      {/* Steps list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {steps.map((step, i) => (
          <Link key={i} to={step.to} style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.5rem 0",
              opacity: step.done ? 0.5 : 1,
              transition: "opacity 0.2s"
            }}>
              <span style={{
                width: "18px", height: "18px", borderRadius: "50%",
                border: `1.5px solid ${step.done ? "var(--accent-gold)" : "var(--border-color)"}`,
                background: step.done ? "var(--accent-gold)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0
              }}>
                {step.done && <span style={{ color: "#fff", fontSize: "10px", lineHeight: 1, fontWeight: "900" }}>✓</span>}
              </span>
              <span style={{
                fontSize: "0.85rem", color: "var(--text-body)",
                textDecoration: step.done ? "line-through" : "none",
                fontWeight: step.done ? "400" : "600"
              }}>
                {step.label}
              </span>
              {!step.done && (
                <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", marginLeft: "auto" }}>→</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Time Vault Teaser Card ─────────────────────────────────────────────────────
function TimeVaultTeaser({ capsules }) {
  const today = new Date().toISOString().split("T")[0];
  const sealedCount = capsules.length;
  const upcoming = capsules
    .filter(c => c.revealDate > today)
    .sort((a, b) => (a.revealDate < b.revealDate ? -1 : 1));
  const nextReveal = upcoming[0];

  return (
    <div className="stationery-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>
          [TIME VAULT]
        </span>
        <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", padding: "2px 8px" }}>
          {sealedCount} {sealedCount === 1 ? "CAPSULE" : "CAPSULES"} SEALED
        </span>
      </div>
      <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>
        Letters to Your Future Self
      </h3>
      {nextReveal ? (
        <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-body)", lineHeight: 1.6 }}>
          Next reveal: <strong>{new Date(nextReveal.revealDate).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</strong> — <em>"{nextReveal.title}"</em>
        </p>
      ) : sealedCount === 0 ? (
        <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Seal a message now. Reveal it when you need it most.
        </p>
      ) : (
        <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          {sealedCount} sealed {sealedCount === 1 ? "capsule" : "capsules"} awaiting their moment.
        </p>
      )}
      <Link
        to="/vault"
        className="btn-primary"
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          padding: "0.65rem 1.25rem", fontSize: "0.8rem",
          textDecoration: "none", letterSpacing: "0.04em", marginTop: "0.25rem", alignSelf: "flex-start"
        }}
      >
        + Seal New Letter
      </Link>
    </div>
  );
}

// ── Export Backup Card ─────────────────────────────────────────────────────────
function ExportCard() {
  const [status, setStatus] = useState("");
  const exportData = () => {
    const saved = localStorage.getItem("growth_os_v1");
    if (!saved) { setStatus("Database is empty."); return; }
    const blob = new Blob([saved], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `growth_os_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Backup downloaded.");
    setTimeout(() => setStatus(""), 3000);
  };
  return (
    <div className="stationery-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <span style={{ fontSize: "0.78rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>
        [DATA BACKUP]
      </span>
      <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>Export Backup Snapshot</h3>
      <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
        Download a complete JSON backup of all your goals, chapters, mood logs, and wheel scores.
      </p>
      <button onClick={exportData} className="btn-primary" style={{ alignSelf: "flex-start", padding: "0.65rem 1.25rem", fontSize: "0.8rem", letterSpacing: "0.04em" }}>
        Export Snapshot
      </button>
      {status && <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{status}</span>}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [state, setState] = useState({ wheelOfLife: null, goals: [], memories: [], wellness: null, moodTracker: {}, vaultCapsules: [] });
  const [dataError, setDataError] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try { setState(JSON.parse(saved)); }
      catch (e) { setDataError(true); }
    }
  }, []);

  const handleClearData = () => {
    localStorage.removeItem("growth_os_v1");
    setDataError(false);
    setState({ wheelOfLife: null, goals: [], memories: [], wellness: null, moodTracker: {}, vaultCapsules: [] });
  };

  const ratings = state.wheelOfLife?.ratings || {};
  const categories = Object.keys(ratings);
  const averageRating = categories.length
    ? (categories.reduce((sum, cat) => sum + (ratings[cat] || 0), 0) / categories.length).toFixed(1)
    : "5.0";

  const totalGoals = state.goals?.length || 0;
  const completedGoals = state.goals?.filter(g => g.completed)?.length || 0;
  const goalsProgress = totalGoals ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const totalMemories = state.memories?.length || 0;
  const latestMemory = state.memories?.[0];

  const glasses = state.wellness?.waterGlasses || 0;

  const moodLogs = state.moodTracker || {};
  const today = new Date().toISOString().split("T")[0];
  const todayMood = moodLogs[today];

  const capsules = state.vaultCapsules || [];

  // Setup progress checks
  const hasWheel = categories.length > 0;
  const hasGoal  = totalGoals > 0;
  const hasMood  = Object.keys(moodLogs).length > 0;

  const getGreeting = () => {
    const hr = new Date().getHours();
    const timeLabel = hr >= 5 && hr < 12 ? "MORNING" : hr >= 12 && hr < 18 ? "MIDDAY" : "EVENING";
    const overdueGoals = state.goals?.filter(g => !g.completed)?.length || 0;
    const wheelLow = parseFloat(averageRating) < 5;
    const noMoodToday = !todayMood;
    const isNewUser = totalGoals === 0 && totalMemories === 0;
    if (isNewUser) return `${timeLabel} — Let's build your Growth OS.`;
    if (noMoodToday && hr >= 8) return `${timeLabel} — How are you arriving today? Log your mood.`;
    if (wheelLow) return `${timeLabel} — Your Wheel average is ${averageRating}. Time to rebalance.`;
    if (overdueGoals > 2) return `${timeLabel} — ${overdueGoals} goals in progress. Let's close the gap.`;
    if (goalsProgress === 100) return `${timeLabel} — All goals complete. Time to set new ones.`;
    return `${timeLabel} — ${goalsProgress}% complete. Keep the momentum.`;
  };

  const getSubtitle = () => {
    if (todayMood) return `Today's mood: ${todayMood}  ·  Hydration: ${glasses}/8 glasses`;
    return `"Step by step, day by day, I cultivate my growth."`;
  };

  const animatedRating   = useAnimatedCounter(parseFloat(averageRating), 1000, 1);
  const animatedProgress = useAnimatedCounter(goalsProgress, 1000, 0);
  const animatedMemories = useAnimatedCounter(totalMemories, 800, 0);

  return (
    <div style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>

      {/* Data corruption banner */}
      {dataError && (
        <div style={{ border: "1px solid #ef4444", padding: "1rem 1.5rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#ef4444", letterSpacing: "0.05em", display: "block", marginBottom: "0.25rem" }}>
              [ERROR // DATA_CORRUPT]
            </span>
            <span style={{ fontSize: "0.9rem" }}>Your saved data could not be loaded.</span>
          </div>
          <button onClick={handleClearData} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "0.5rem 1.2rem", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.05em" }}>
            CLEAR & RESET
          </button>
        </div>
      )}

      {/* Greeting header */}
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", fontWeight: "800", letterSpacing: "-0.04em", color: "var(--text-primary)" }}>
            {getGreeting()}
          </h1>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
            {getSubtitle()}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link to="/mood" className="btn-primary" style={{ padding: "0.6rem 1.2rem", borderRadius: "0px", textDecoration: "none", fontWeight: "700", fontSize: "0.85rem", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>[+]</span> Log Mood
          </Link>
          <Link to="/chapters" className="btn-primary" style={{ padding: "0.6rem 1.2rem", borderRadius: "0px", textDecoration: "none", fontWeight: "700", fontSize: "0.85rem", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>[+]</span> New Note
          </Link>
        </div>
      </header>

      {/* ── Setup Progress Banner ── */}
      <SetupBanner hasWheel={hasWheel} hasGoal={hasGoal} hasMood={hasMood} />

      {/* ── Hero row: Wheel + Goals ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>

        {/* Wheel of Life Card */}
        <div className="stationery-card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>[01 // LIFE WHEEL]</span>
            <span style={{ border: "1px solid var(--border-color)", color: "var(--text-body)", padding: "2px 8px", fontSize: "0.72rem", fontWeight: "700", fontFamily: "var(--font-mono)" }}>STABLE</span>
          </div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Wheel of Life</h3>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", margin: "1rem 0" }}>
            <span style={{ fontSize: "3.5rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: "var(--text-primary)", letterSpacing: "-0.05em" }}>{animatedRating.toFixed(1)}</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>/ 10.0 AVERAGE</span>
          </div>
          <p style={{ margin: "0 0 2rem 0", fontSize: "0.9rem", lineHeight: "1.6", color: "var(--text-secondary)", flex: 1 }}>
            Aggregate overview across eight core life dimensions.
          </p>
          <Link to="/wheel" style={{ display: "block", marginTop: "auto", padding: "0.8rem 1.5rem", textDecoration: "none", fontWeight: "700", fontSize: "0.8rem", letterSpacing: "0.05em", textAlign: "center" }} className="btn-primary">
            Open Balance Radar
          </Link>
        </div>

        {/* Goals Card */}
        <div className="stationery-card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>[02 // OBJECTIVES]</span>
            <span style={{ border: "1px solid var(--border-color)", color: "var(--text-body)", padding: "2px 8px", fontSize: "0.72rem", fontWeight: "700", fontFamily: "var(--font-mono)" }}>ACTIVE</span>
          </div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Goals & Targets</h3>
          <div style={{ fontSize: "3.5rem", fontWeight: "800", fontFamily: "var(--font-mono)", margin: "1rem 0", color: "var(--text-primary)", letterSpacing: "-0.05em" }}>
            {animatedProgress}%
          </div>
          <div style={{ background: "rgba(0,0,0,0.08)", height: "4px", width: "100%", margin: "0.5rem 0 1.5rem 0", overflow: "hidden" }}>
            <div style={{
              background: "var(--accent-gold)",
              width: `${goalsProgress}%`, height: "100%",
              transition: "width 0.6s ease",
              boxShadow: "0 0 8px rgba(201,168,76,0.35)"
            }} />
          </div>
          <p style={{ margin: "0 0 2rem 0", fontSize: "0.9rem", color: "var(--text-secondary)", flex: 1 }}>
            Completed <strong style={{ color: "var(--text-primary)" }}>{completedGoals}</strong> of <strong style={{ color: "var(--text-primary)" }}>{totalGoals}</strong> target milestones.
          </p>
          <Link to="/goals" className="btn-primary" style={{ display: "block", marginTop: "auto", padding: "0.8rem 1.5rem", textDecoration: "none", fontWeight: "700", fontSize: "0.8rem", letterSpacing: "0.05em", textAlign: "center" }}>
            Configure Checklist
          </Link>
        </div>
      </div>

      {/* ── Secondary row: Life Chapters + Wellness ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>

        {/* Life Chapters Card */}
        <div className="stationery-card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>[03 // ARCHIVE]</span>
            <span style={{ border: "1px solid var(--border-color)", color: "var(--text-body)", padding: "2px 8px", fontSize: "0.72rem", fontWeight: "700", fontFamily: "var(--font-mono)" }}>ONLINE</span>
          </div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Life Chapters</h3>
          <div style={{ fontSize: "3.5rem", fontWeight: "800", fontFamily: "var(--font-mono)", margin: "1rem 0", color: "var(--text-primary)", letterSpacing: "-0.05em" }}>
            {animatedMemories} <span style={{ fontSize: "0.85rem", fontWeight: "normal", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>RECORDS</span>
          </div>
          <div style={{ flex: 1, marginBottom: "1.5rem" }}>
            {latestMemory ? (
              <div style={{ background: "var(--bg-page)", padding: "1rem", fontSize: "0.85rem", border: "1px solid var(--border-color)", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                "{latestMemory.text.substring(0, 75)}{latestMemory.text.length > 75 ? "..." : ""}"
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)" }}>No timeline records logged. System stands ready.</p>
            )}
          </div>
          <Link to="/chapters" className="btn-primary" style={{ display: "block", marginTop: "auto", padding: "0.8rem 1.5rem", textDecoration: "none", fontWeight: "700", fontSize: "0.8rem", letterSpacing: "0.05em", textAlign: "center" }}>
            Access Timeline
          </Link>
        </div>

        {/* Wellness Card */}
        <div className="stationery-card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>[04 // BIOMETRICS]</span>
            <span style={{ border: "1px solid var(--border-color)", color: "var(--text-body)", padding: "2px 8px", fontSize: "0.72rem", fontWeight: "700", fontFamily: "var(--font-mono)" }}>ACTIVE</span>
          </div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Flo & Wellness</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.25rem 0" }}>
            <div style={{ fontSize: "2rem", display: "inline-grid", placeContent: "center", width: "60px", height: "60px", border: "1px solid var(--border-color)", background: "var(--bg-page)" }}>
              {todayMood || "—"}
            </div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>DAILY MOOD STATE</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>HYDRATION: {glasses} / 8.0 GLASSES</div>
            </div>
          </div>
          <p style={{ margin: "0 0 2rem 0", fontSize: "0.9rem", lineHeight: "1.6", color: "var(--text-secondary)", flex: 1 }}>
            Biometrics, psychological state trackers, and hydration baselines.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
            <Link to="/wellness" className="btn-secondary" style={{ flex: 1, padding: "0.8rem 1rem", textDecoration: "none", fontWeight: "700", fontSize: "0.75rem", letterSpacing: "0.05em", textAlign: "center" }}>
              Wellness Log
            </Link>
            <Link to="/mood" className="btn-primary" style={{ flex: 1, padding: "0.8rem 1rem", textDecoration: "none", fontWeight: "700", fontSize: "0.75rem", letterSpacing: "0.05em", textAlign: "center" }}>
              Log State
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom row: Time Vault teaser + Export ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        <TimeVaultTeaser capsules={capsules} />
        <ExportCard />
      </div>
    </div>
  );
}
