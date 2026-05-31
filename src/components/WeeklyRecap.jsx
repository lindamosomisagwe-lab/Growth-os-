import React, { useState, useEffect } from "react";
import { getXPEvents, getUserProgress } from "../services/xpService";
import { useFeatureUnlock } from "../contexts/GamificationContext";

export default function WeeklyRecap() {
  const { unlocked } = useFeatureUnlock("weekly_summary");
  const [show, setShow] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!unlocked) return;

    const today = new Date();
    // Only show on Monday
    if (today.getDay() !== 1) return;

    const lastMondayStr = today.toISOString().split("T")[0]; // Use today's date as key for dismissal
    const dismissedKey = `growth_os_recap_dismissed_${lastMondayStr}`;
    if (localStorage.getItem(dismissedKey)) return;

    // Calculate dates for display
    const lastMon = new Date(today);
    lastMon.setDate(today.getDate() - 7);
    const lastSun = new Date(today);
    lastSun.setDate(today.getDate() - 1);

    const dateFmt = { month: "short", day: "numeric" };
    const dateRange = `${lastMon.toLocaleDateString(undefined, dateFmt)} — ${lastSun.toLocaleDateString(undefined, dateFmt)}`;

    // Parse stats
    const events = getXPEvents() || [];
    const progress = getUserProgress();
    
    // Filter to last 7 days roughly (in a real app, use exact dates)
    const recentEvents = events.slice(-50); // mock slice
    
    let xpEarned = 0;
    let tasks = 0;
    let bestMoment = null;

    recentEvents.forEach(e => {
      xpEarned += e.xp_awarded;
      if (e.event_type.startsWith("task_complete")) tasks++;
      if (e.event_type.startsWith("goal_complete") && !bestMoment) bestMoment = "Goal completed!";
      if (e.event_type.startsWith("step_complete") && !bestMoment) bestMoment = "Step completed!";
    });

    const messages = [
      "Solid week. You're building real momentum.",
      "A quiet week, but you showed up.",
      "Incredible progress. Keep this energy going.",
      "Rest is just as important as doing. Ready for a new week?"
    ];
    let msgIndex = xpEarned > 500 ? 2 : (xpEarned > 100 ? 0 : 1);
    if (tasks === 0 && xpEarned === 0) msgIndex = 3;

    setStats({
      dateRange,
      xpEarned,
      tasks,
      bestMoment,
      streak: progress?.streak_days || 0,
      message: messages[msgIndex]
    });
    
    setShow(true);
  }, [unlocked]);

  const dismiss = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    localStorage.setItem(`growth_os_recap_dismissed_${todayStr}`, "true");
    setShow(false);
  };

  if (!show || !stats) return null;

  return (
    <div className="stationery-card" style={{ 
      position: "relative", marginBottom: "2rem", padding: "1.25rem",
      borderTop: "3px solid transparent",
      backgroundImage: `linear-gradient(var(--bg-surface), var(--bg-surface)), linear-gradient(90deg, #f9d423, #f093fb)`,
      backgroundOrigin: "border-box", backgroundClip: "padding-box, border-box",
      animation: "fadeInUp 0.4s ease-out"
    }}>
      <button onClick={dismiss} style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.2rem" }}>
        ✕
      </button>

      <div style={{ textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.1em", color: "var(--text-secondary)", fontWeight: "700", marginBottom: "0.5rem" }}>
        Your week, {stats.dateRange}
      </div>

      <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "2.5rem", fontWeight: "800", lineHeight: "1", background: "linear-gradient(90deg, #f9d423, #f093fb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            +{stats.xpEarned}
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600", letterSpacing: "0.05em" }}>XP EARNED</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "2rem" }}>
          <div style={{ fontSize: "0.9rem" }}>✅ <strong>{stats.tasks} tasks</strong> done</div>
          <div style={{ fontSize: "0.9rem" }}>🔥 <strong>{stats.streak} days</strong> building</div>
          {stats.bestMoment && <div style={{ fontSize: "0.9rem" }}>🏆 <strong>{stats.bestMoment}</strong></div>}
        </div>
      </div>

      <div style={{ marginTop: "1rem", fontSize: "0.95rem", fontStyle: "italic", color: "rgba(255,255,255,0.85)" }}>
        "{stats.message}"
      </div>
    </div>
  );
}
