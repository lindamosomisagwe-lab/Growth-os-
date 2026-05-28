import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// Counts from 0 to `target` over `duration`ms on mount
function useAnimatedCounter(target, duration = 900, decimals = 0) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const run = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) frameRef.current = requestAnimationFrame(run);
    };
    frameRef.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, decimals]);
  return value;
}

export default function Dashboard() {
  const [state, setState] = useState({
    wheelOfLife: null,
    goals: [],
    memories: [],
    wellness: null,
    moodTracker: {}
  });
  const [dataError, setDataError] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        setDataError(true); // Surface to UI instead of silent swallow
      }
    }
  }, []);

  const handleClearData = () => {
    localStorage.removeItem("growth_os_v1");
    setDataError(false);
    setState({ wheelOfLife: null, goals: [], memories: [], wellness: null, moodTracker: {} });
  };

  // 1. Wheel of Life balance averages
  const ratings = state.wheelOfLife?.ratings || {};
  const categories = Object.keys(ratings);
  const averageRating = categories.length
    ? (categories.reduce((sum, cat) => sum + (ratings[cat] || 0), 0) / categories.length).toFixed(1)
    : "5.0";

  // 2. Goals progress rates
  const totalGoals = state.goals?.length || 0;
  const completedGoals = state.goals?.filter(g => g.completed)?.length || 0;
  const goalsProgress = totalGoals ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // 3. Life Chapters (Timeline/Journal) counts
  const totalMemories = state.memories?.length || 0;
  const latestMemory = state.memories?.[0];

  // 4. Wellness parameters
  const glasses = state.wellness?.waterGlasses || 0;

  // 5. Mood status
  const moodLogs = state.moodTracker || {};
  const today = new Date().toISOString().split("T")[0];
  const todayMood = moodLogs[today];

  const getGreeting = () => {
    const hr = new Date().getHours();
    const timeLabel = hr >= 5 && hr < 12 ? "MORNING" : hr >= 12 && hr < 18 ? "MIDDAY" : "EVENING";

    // Data-aware conditions
    const overdueGoals = state.goals?.filter(g => !g.completed)?.length || 0;
    const wheelLow = parseFloat(averageRating) < 5;
    const noMoodToday = !todayMood;
    const isNewUser = totalGoals === 0 && totalMemories === 0;

    if (isNewUser) return `${timeLabel} — Let's build your Growth OS.`;
    if (noMoodToday && hr >= 8) return `${timeLabel} — How are you arriving today? Log your mood.`;
    if (wheelLow) return `${timeLabel} — Your Wheel average is ${averageRating}. Time to rebalance.`;
    if (overdueGoals > 2) return `${timeLabel} — ${overdueGoals} goals still in progress. Let's close the gap.`;
    if (goalsProgress === 100) return `${timeLabel} — All goals complete. Time to set new ones.`;
    return `${timeLabel} — ${goalsProgress}% complete. Keep the momentum.`;
  };

  const getSubtitle = () => {
    if (todayMood) return `Today's mood: ${todayMood}  ·  Hydration: ${glasses}/8 glasses`;
    return `"Step by step, day by day, I cultivate my growth."`;
  };

  // Animated counter values
  const animatedRating   = useAnimatedCounter(parseFloat(averageRating), 1000, 1);
  const animatedProgress = useAnimatedCounter(goalsProgress, 1000, 0);
  const animatedMemories = useAnimatedCounter(totalMemories, 800, 0);

  return (
    <div style={{ color: "#ffffff", fontFamily: "var(--font-sans)" }}>

      {/* ── Data corruption recovery banner ── */}
      {dataError && (
        <div style={{
          background: "transparent",
          border: "1px solid #ff4444",
          padding: "1rem 1.5rem",
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap"
        }}>
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#ff4444", letterSpacing: "0.05em", display: "block", marginBottom: "0.25rem" }}>
              [ERROR // DATA_CORRUPT]
            </span>
            <span style={{ fontSize: "0.9rem", color: "#ffffff" }}>
              Your saved data could not be loaded. It may have been corrupted.
            </span>
          </div>
          <button
            onClick={handleClearData}
            style={{
              background: "#ff4444", color: "#ffffff", border: "none",
              padding: "0.5rem 1.2rem", cursor: "pointer",
              fontFamily: "var(--font-mono)", fontSize: "0.75rem",
              fontWeight: "700", letterSpacing: "0.05em", whiteSpace: "nowrap"
            }}
          >
            CLEAR &amp; RESET
          </button>
        </div>
      )}

      {/* Greeting Header & Quick Actions */}
      <header style={{ 
        marginBottom: "3rem", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        flexWrap: "wrap", 
        gap: "1.5rem",
        borderBottom: "1px solid var(--border-color)",
        paddingBottom: "1.5rem"
      }}>
        <div>
          <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", fontWeight: "800", letterSpacing: "-0.04em", color: "#ffffff" }}>
            {getGreeting()}
          </h1>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#888888", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
            {getSubtitle()}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link 
            to="/mood" 
            style={{ 
              background: "#ffffff", 
              color: "#000000", 
              padding: "0.6rem 1.2rem", 
              borderRadius: "0px", 
              border: "1px solid #ffffff", 
              textDecoration: "none", 
              fontWeight: "700", 
              fontSize: "0.85rem", 
              letterSpacing: "0.05em",
              boxShadow: "none", 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem",
              transition: "all 0.15s ease"
            }}
            className="btn-primary"
          >
            <span>[+]</span> Log Mood
          </Link>
          <Link 
            to="/chapters" 
            style={{ 
              background: "#ffffff", 
              color: "#000000", 
              padding: "0.6rem 1.2rem", 
              borderRadius: "0px", 
              border: "1px solid #ffffff", 
              textDecoration: "none", 
              fontWeight: "700", 
              fontSize: "0.85rem", 
              letterSpacing: "0.05em",
              boxShadow: "none", 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem",
              transition: "all 0.15s ease"
            }}
            className="btn-primary"
          >
            <span>[+]</span> New Note
          </Link>
        </div>
      </header>

      {/* ── NEW USER ONBOARDING — shown only when no data exists ── */}
      {totalGoals === 0 && totalMemories === 0 && !dataError && (
        <div style={{ marginBottom: "2.5rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#888888", letterSpacing: "0.05em", marginBottom: "1rem" }}>
            [SYSTEM READY // 3 STEPS TO ACTIVATE YOUR GROWTH OS]
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {[
              { step: "01", label: "Map Your Life", desc: "Fill in your Wheel of Life — 8 dimensions, 2 minutes.", to: "/wheel", cta: "Open Wheel →" },
              { step: "02", label: "Set Your First Goal", desc: "What's the one thing you want to achieve this month?", to: "/goals", cta: "Add Goal →" },
              { step: "03", label: "Log Your Mood", desc: "How are you arriving today? Start the daily ritual.", to: "/mood",  cta: "Log Mood →" },
            ].map(({ step, label, desc, to, cta }) => (
              <Link key={step} to={to} style={{ textDecoration: "none" }}>
                <div style={{
                  border: "1px solid var(--border-color)",
                  padding: "1.5rem",
                  cursor: "pointer",
                  transition: "border-color 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem"
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#ffffff"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-color)"}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#888888", letterSpacing: "0.1em" }}>[STEP {step}]</span>
                  <strong style={{ fontSize: "1rem", color: "#ffffff", display: "block" }}>{label}</strong>
                  <p style={{ fontSize: "0.85rem", color: "#888888", margin: 0, lineHeight: 1.5 }}>{desc}</p>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#ffffff", marginTop: "0.5rem" }}>{cta}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── HERO ROW: Wheel of Life + Goals (equal halves, full width) ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1.5rem",
        width: "100%",
        marginBottom: "1.5rem"
      }}>
        
        {/* Wheel of Life Card */}
        <div className="stationery-card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "#888888", letterSpacing: "0.05em" }}>[01 // LIFE WHEEL]</span>
            <span style={{ 
              background: "transparent", 
              color: "#ffffff", 
              padding: "0.2rem 0.6rem", 
              borderRadius: "0px", 
              fontSize: "0.75rem", 
              fontWeight: "700", 
              fontFamily: "var(--font-mono)",
              border: "1px solid var(--border-color)" 
            }}>
              STABLE
            </span>
          </div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem", fontWeight: "800", letterSpacing: "-0.02em", color: "#ffffff" }}>Wheel of Life</h3>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", margin: "1rem 0" }}>
            <span style={{ fontSize: "3.5rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: "#ffffff", letterSpacing: "-0.05em" }}>{animatedRating.toFixed(1)}</span>
            <span style={{ fontSize: "0.85rem", color: "#888888", fontFamily: "var(--font-mono)" }}>/ 10.0 AVERAGE</span>
          </div>
          <p style={{ margin: "0 0 2rem 0", fontSize: "0.9rem", lineHeight: "1.6", color: "#888888", flex: 1 }}>
            Aggregate overview representing overall life balance metrics across eight core modules.
          </p>
          <Link 
            to="/wheel" 
            style={{ 
              display: "block", 
              marginTop: "auto", 
              background: "#ffffff", 
              color: "#000000", 
              padding: "0.8rem 1.5rem", 
              borderRadius: "0px", 
              border: "1px solid #ffffff", 
              textDecoration: "none", 
              fontWeight: "700", 
              fontSize: "0.8rem", 
              letterSpacing: "0.05em",
              textAlign: "center" 
            }}
          >
            Open Balance Radar
          </Link>
        </div>

        {/* Goals Progress Card */}
        <div className="stationery-card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "#888888", letterSpacing: "0.05em" }}>[02 // OBJECTIVES]</span>
            <span style={{ 
              background: "transparent", 
              color: "#ffffff", 
              padding: "0.2rem 0.6rem", 
              borderRadius: "0px", 
              fontSize: "0.75rem", 
              fontWeight: "700", 
              fontFamily: "var(--font-mono)",
              border: "1px solid var(--border-color)" 
            }}>
              ACTIVE
            </span>
          </div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem", fontWeight: "800", letterSpacing: "-0.02em", color: "#ffffff" }}>Goals &amp; Targets</h3>
          <div style={{ fontSize: "3.5rem", fontWeight: "800", fontFamily: "var(--font-mono)", margin: "1rem 0", color: "#ffffff", letterSpacing: "-0.05em" }}>
            {animatedProgress}%
          </div>
          {/* Progress bar */}
          <div style={{ 
            background: "#111111", 
            borderRadius: "0px", 
            height: "6px", 
            width: "100%", 
            margin: "0.5rem 0 1.5rem 0", 
            overflow: "hidden",
            border: "1px solid var(--border-color)" 
          }}>
            <div style={{ background: "#ffffff", width: `${goalsProgress}%`, height: "100%", borderRadius: "0px" }}></div>
          </div>
          <p style={{ margin: "0 0 2rem 0", fontSize: "0.9rem", color: "#888888", flex: 1 }}>
            Completed <strong style={{ color: "#ffffff" }}>{completedGoals}</strong> of <strong style={{ color: "#ffffff" }}>{totalGoals}</strong> logged target milestones.
          </p>
          <Link 
            to="/goals" 
            style={{ 
              display: "block", 
              marginTop: "auto", 
              background: "#ffffff", 
              color: "#000000", 
              padding: "0.8rem 1.5rem", 
              borderRadius: "0px", 
              border: "1px solid #ffffff", 
              textDecoration: "none", 
              fontWeight: "700", 
              fontSize: "0.8rem", 
              letterSpacing: "0.05em",
              textAlign: "center" 
            }}
          >
            Configure Checklist
          </Link>
        </div>

      </div>{/* END HERO ROW */}

      {/* ── SECONDARY ROW: Life Chapters + Wellness ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.5rem",
        width: "100%"
      }}>

        {/* Life Chapters Timeline Summary Card */}
        <div className="stationery-card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "#888888", letterSpacing: "0.05em" }}>[03 // DATABASE ARCHIVE]</span>
            <span style={{ 
              background: "transparent", 
              color: "#ffffff", 
              padding: "0.2rem 0.6rem", 
              borderRadius: "0px", 
              fontSize: "0.75rem", 
              fontWeight: "700", 
              fontFamily: "var(--font-mono)",
              border: "1px solid var(--border-color)" 
            }}>
              ONLINE
            </span>
          </div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem", fontWeight: "800", letterSpacing: "-0.02em", color: "#ffffff" }}>Life Chapters</h3>
          <div style={{ fontSize: "3.5rem", fontWeight: "800", fontFamily: "var(--font-mono)", margin: "1rem 0", color: "#ffffff", letterSpacing: "-0.05em" }}>
            {animatedMemories} <span style={{ fontSize: "0.85rem", fontWeight: "normal", color: "#888888", letterSpacing: "0.05em" }}>RECORDS</span>
          </div>
          <div style={{ flex: 1, marginBottom: "1.5rem" }}>
            {latestMemory ? (
              <div style={{ 
                background: "#050505", 
                padding: "1rem", 
                borderRadius: "0px", 
                fontSize: "0.85rem", 
                border: "1px solid var(--border-color)", 
                color: "#c5c5c5",
                fontFamily: "var(--font-mono)"
              }}>
                "{latestMemory.text.substring(0, 75)}{latestMemory.text.length > 75 ? "..." : ""}"
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#888888" }}>Zero timeline records logged. System stands ready to archive.</p>
            )}
          </div>
          <Link 
            to="/chapters" 
            style={{ 
              display: "block", 
              marginTop: "auto", 
              background: "#ffffff", 
              color: "#000000", 
              padding: "0.8rem 1.5rem", 
              borderRadius: "0px", 
              border: "1px solid #ffffff", 
              textDecoration: "none", 
              fontWeight: "700", 
              fontSize: "0.8rem", 
              letterSpacing: "0.05em",
              textAlign: "center" 
            }}
          >
            Access Timeline Database
          </Link>
        </div>

        {/* Flo & Hydration tracking Card */}
        <div className="stationery-card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "#888888", letterSpacing: "0.05em" }}>[04 // BIOMETRICS]</span>
            <span style={{ 
              background: "transparent", 
              color: "#ffffff", 
              padding: "0.2rem 0.6rem", 
              borderRadius: "0px", 
              fontSize: "0.75rem", 
              fontWeight: "700", 
              fontFamily: "var(--font-mono)",
              border: "1px solid var(--border-color)" 
            }}>
              ACTIVE
            </span>
          </div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem", fontWeight: "800", letterSpacing: "-0.02em", color: "#ffffff" }}>Flo &amp; Wellness</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.25rem 0" }}>
            <div style={{ 
              fontSize: "2rem", 
              display: "inline-grid", 
              placeContent: "center", 
              width: "64px", 
              height: "64px", 
              border: "1px solid var(--border-color)", 
              background: "#050505" 
            }}>
              {todayMood || "—"}
            </div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "1rem", color: "#ffffff", letterSpacing: "-0.01em" }}>DAILY MOOD STATE</div>
              <div style={{ fontSize: "0.8rem", color: "#888888", fontFamily: "var(--font-mono)" }}>
                HYDRATION: {glasses} / 8.0 GLASSES LOGGED
              </div>
            </div>
          </div>
          <p style={{ margin: "0 0 2rem 0", fontSize: "0.9rem", lineHeight: "1.6", color: "#888888", flex: 1 }}>
            Correlating biometrics, psychological state trackers, and hydration baseline levels.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
            <Link 
              to="/wellness" 
              style={{ 
                flex: 1,
                background: "transparent", 
                color: "#ffffff", 
                padding: "0.8rem 1rem", 
                borderRadius: "0px", 
                border: "1px solid var(--border-color)", 
                textDecoration: "none", 
                fontWeight: "700", 
                fontSize: "0.75rem", 
                letterSpacing: "0.05em",
                textAlign: "center",
                transition: "all 0.15s ease"
              }}
              className="btn-secondary"
            >
              Wellness Log
            </Link>
            <Link 
              to="/mood" 
              style={{ 
                flex: 1,
                background: "#ffffff", 
                color: "#000000", 
                padding: "0.8rem 1rem", 
                borderRadius: "0px", 
                border: "1px solid #ffffff", 
                textDecoration: "none", 
                fontWeight: "700", 
                fontSize: "0.75rem", 
                letterSpacing: "0.05em",
                textAlign: "center",
                transition: "all 0.15s ease"
              }}
              className="btn-primary"
            >
              Log State
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
