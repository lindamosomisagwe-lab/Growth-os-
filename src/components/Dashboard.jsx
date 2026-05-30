import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useGamification } from "../contexts/GamificationContext";

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

// ── Daily Completion Ring ──────────────────────────────────────────────────────
function DailyRing({ current, target = 5 }) {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / target, 1);
  const offset = circumference - progress * circumference;
  const isComplete = current >= target;

  return (
    <div style={{ position: "relative", width: "90px", height: "90px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx="45" cy="45" r={radius}
          fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8"
        />
        <circle
          cx="45" cy="45" r={radius}
          fill="none" stroke={isComplete ? "url(#completeGrad)" : "url(#progressGrad)"} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease-out, stroke 0.3s ease" }}
        />
        <defs>
          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#4facfe" />
          </linearGradient>
          <linearGradient id="completeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4facfe" />
            <stop offset="100%" stopColor="#43e97b" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: "absolute", textAlign: "center", display: "flex", flexDirection: "column" }}>
        {isComplete ? (
          <span style={{ fontSize: "1.5rem", animation: "bounceScale 0.5s ease" }}>🎉</span>
        ) : (
          <>
            <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", lineHeight: 1 }}>{current}/{target}</span>
            <span style={{ fontSize: "0.55rem", fontWeight: "700", letterSpacing: "0.05em", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>DAILY</span>
          </>
        )}
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
    <div className="stationery-card module-vault" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>
          [TIME VAULT]
        </span>
        <span style={{ fontSize: "1.2rem" }} aria-hidden="true">⏳</span>
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
          textDecoration: "none", letterSpacing: "0.04em", marginTop: "auto", alignSelf: "flex-start"
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
    const savedV1 = localStorage.getItem("growth_os_v1");
    const savedGamification = localStorage.getItem("growth_os_gamification");
    
    if (!savedV1 && !savedGamification) { setStatus("Database is empty."); return; }
    
    const combined = {
      v1: savedV1 ? JSON.parse(savedV1) : {},
      gamification: savedGamification ? JSON.parse(savedGamification) : {}
    };

    const blob = new Blob([JSON.stringify(combined, null, 2)], { type: "application/json" });
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
    <div className="stationery-card module-settings" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <span style={{ fontSize: "0.78rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>
        [DATA BACKUP]
      </span>
      <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>Export Backup Snapshot</h3>
      <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
        Download a complete JSON backup of your data, points, and configurations.
      </p>
      <button onClick={exportData} className="btn-secondary" style={{ alignSelf: "flex-start", padding: "0.65rem 1.25rem", fontSize: "0.8rem", letterSpacing: "0.04em", marginTop: "auto" }}>
        Export Snapshot
      </button>
      {status && <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{status}</span>}
    </div>
  );
}

// ── Badges Card ─────────────────────────────────────────────────────────────────
function BadgesCard() {
  // Temporary hardcoded badges display for dashboard
  return (
    <div className="stationery-card module-music" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>
          [ACHIEVEMENTS]
        </span>
        <span style={{ fontSize: "1.2rem" }} aria-hidden="true">🏆</span>
      </div>
      <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>Your Badges</h3>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "0.5rem 0" }}>
        {/* Placeholder badges */}
        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.08)", display: "grid", placeContent: "center", filter: "grayscale(1) opacity(0.4)" }}>🌱</div>
        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.08)", display: "grid", placeContent: "center", filter: "grayscale(1) opacity(0.4)" }}>🔥</div>
        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.08)", display: "grid", placeContent: "center", filter: "grayscale(1) opacity(0.4)" }}>💧</div>
        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.08)", display: "grid", placeContent: "center", filter: "grayscale(1) opacity(0.4)" }}>🎯</div>
      </div>
      <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
        Keep completing tasks to unlock special profile badges.
      </p>
      <button className="btn-secondary" style={{ alignSelf: "flex-start", padding: "0.65rem 1.25rem", fontSize: "0.8rem", letterSpacing: "0.04em", marginTop: "auto" }} disabled>
        View All Badges
      </button>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [state, setState] = useState({ wheelOfLife: null, goals: [], memories: [], wellness: null, moodTracker: {}, vaultCapsules: [] });
  const [dataError, setDataError] = useState(false);
  const { streak, getRank, dailyActions } = useGamification();
  const rank = getRank();

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try { setState(JSON.parse(saved)); }
      catch (e) { setDataError(true); }
    }
  }, []);

  const handleClearData = () => {
    localStorage.removeItem("growth_os_v1");
    localStorage.removeItem("growth_os_gamification");
    window.location.reload();
  };

  const hr = new Date().getHours();
  const timeConfig = hr >= 5 && hr < 12 
    ? { grad: "linear-gradient(135deg, #0f0c29, #302b63, rgba(246, 160, 77, 0.2))", emojis: ["🌅", "☀️"], label: "MORNING" }
    : hr >= 12 && hr < 17 
    ? { grad: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)", emojis: ["☀️", "🌤️"], label: "AFTERNOON" }
    : hr >= 17 && hr < 21
    ? { grad: "linear-gradient(135deg, #0f0c29, #302b63, #6d28d9)", emojis: ["🌆", "🌙"], label: "EVENING" }
    : { grad: "linear-gradient(135deg, #09080F, #130F2E, #1e1b4b)", emojis: ["🌙", "✨"], label: "NIGHT" };

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

  const getGreeting = () => {
    const overdueGoals = state.goals?.filter(g => !g.completed)?.length || 0;
    const isNewUser = totalGoals === 0 && totalMemories === 0;
    if (isNewUser) return `${timeConfig.label} — Let's build your Growth OS.`;
    if (!todayMood && hr >= 8) return `${timeConfig.label} — How are you arriving today?`;
    if (goalsProgress === 100) return `${timeConfig.label} — All goals complete.`;
    return `${timeConfig.label} — Keep the momentum going.`;
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

      {/* ── Time-Aware Hero ── */}
      <div style={{
        background: timeConfig.grad,
        borderRadius: "24px",
        padding: "2.5rem 2rem",
        marginBottom: "2.5rem",
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.3)"
      }}>
        {/* Floating Emojis */}
        <div className="float-anim" style={{ position: "absolute", top: "40px", right: "20%", fontSize: "3rem", opacity: 0.3, pointerEvents: "none", filter: "blur(2px)" }} aria-hidden="true">{timeConfig.emojis[0]}</div>
        <div className="float-anim" style={{ position: "absolute", bottom: "30px", right: "5%", fontSize: "2.5rem", opacity: 0.2, pointerEvents: "none", animationDelay: "1s" }} aria-hidden="true">{timeConfig.emojis[1]}</div>
        <div className="float-anim" style={{ position: "absolute", top: "20px", left: "10%", fontSize: "1.5rem", opacity: 0.1, pointerEvents: "none", animationDelay: "2s" }} aria-hidden="true">{timeConfig.emojis[0]}</div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem", position: "relative", zIndex: 1 }}>
          <div style={{ flex: 1, minWidth: "300px" }}>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <span style={{ background: "rgba(0,0,0,0.3)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "700", fontFamily: "var(--font-mono)", border: "1px solid rgba(255,255,255,0.1)" }}>
                🔥 STREAK: {streak}
              </span>
              <span style={{ background: "rgba(0,0,0,0.3)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "700", fontFamily: "var(--font-mono)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {rank.emoji} {rank.name.toUpperCase()}
              </span>
            </div>
            <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "2.5rem", fontWeight: "800", letterSpacing: "-0.04em", color: "var(--text-primary)", textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
              {getGreeting()}
            </h1>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
              "Step by step, day by day, I cultivate my growth."
            </p>
          </div>
          <DailyRing current={dailyActions} target={5} />
        </div>
      </div>

      {/* ── Hero row: Wheel + Goals ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Wheel of Life Card */}
        <div className="stationery-card module-wheel" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>[01 // LIFE WHEEL]</span>
            <span style={{ fontSize: "1.2rem" }} aria-hidden="true">🎯</span>
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
        <div className="stationery-card module-goals" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>[02 // OBJECTIVES]</span>
            <span style={{ fontSize: "1.2rem" }} aria-hidden="true">🚀</span>
          </div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Goals & Targets</h3>
          <div style={{ fontSize: "3.5rem", fontWeight: "800", fontFamily: "var(--font-mono)", margin: "1rem 0", color: "var(--text-primary)", letterSpacing: "-0.05em" }}>
            {animatedProgress}%
          </div>
          <div className="progress-track" style={{ height: "4px", width: "100%", margin: "0.5rem 0 1.5rem 0" }}>
            <div className="progress-fill" style={{ width: `${goalsProgress}%` }} />
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
        <div className="stationery-card module-chapters" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>[03 // ARCHIVE]</span>
            <span style={{ fontSize: "1.2rem" }} aria-hidden="true">📖</span>
          </div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Life Chapters</h3>
          <div style={{ fontSize: "3.5rem", fontWeight: "800", fontFamily: "var(--font-mono)", margin: "1rem 0", color: "var(--text-primary)", letterSpacing: "-0.05em" }}>
            {animatedMemories} <span style={{ fontSize: "0.85rem", fontWeight: "normal", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>RECORDS</span>
          </div>
          <div style={{ flex: 1, marginBottom: "1.5rem" }}>
            {latestMemory ? (
              <div style={{ background: "rgba(255,255,255,0.04)", padding: "1rem", fontSize: "0.85rem", border: "1px solid var(--border-color)", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", borderRadius: "8px" }}>
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
        <div className="stationery-card module-wellness" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>[04 // BIOMETRICS]</span>
            <span style={{ fontSize: "1.2rem" }} aria-hidden="true">🌿</span>
          </div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Flo & Wellness</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.25rem 0" }}>
            <div style={{ fontSize: "2.5rem", display: "inline-grid", placeContent: "center", width: "60px", height: "60px", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.04)", borderRadius: "12px", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5)" }}>
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

      {/* ── Bottom row: Badges, Time Vault, Export ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        <BadgesCard />
        <TimeVaultTeaser capsules={capsules} />
        <ExportCard />
      </div>
    </div>
  );
}
