import React, { useState, useEffect } from "react";
import { getUserProgress, getXPEvents, CHAPTERS } from "../services/xpService";
import XPBar from "./XPBar"; // We will make a slight prop tweak or just use a custom one if needed. Actually we'll just build a custom one for the profile since it's larger.

const ALL_BADGES = [
  { id: "first_step", label: "First Step", icon: "🌱", desc: "Completed any action" },
  { id: "goal_setter", label: "Goal Setter", icon: "🎯", desc: "Set your first big goal" },
  { id: "goal_crusher", label: "Goal Crusher", icon: "🏆", desc: "Completed a big goal" },
  { id: "week_warrior", label: "Week Warrior", icon: "🔥", desc: "7-day streak" },
  { id: "month_master", label: "Month Master", icon: "🔥🔥", desc: "30-day streak" },
  { id: "self_aware", label: "Self-Aware", icon: "⚖️", desc: "Life balance assessment" },
  { id: "time_traveler", label: "Time Traveler", icon: "💌", desc: "Sealed a letter" },
  { id: "momentum", label: "Momentum", icon: "⭐", desc: "Reached Chapter 3" }
];

export default function Profile() {
  const [progress, setProgress] = useState(null);
  const [earnedBadges, setEarnedBadges] = useState(new Set());

  useEffect(() => {
    const p = getUserProgress();
    setProgress(p);

    const events = getXPEvents() || [];
    const earned = new Set();
    
    if (events.length > 0) earned.add("first_step");
    if (events.some(e => e.event_type.startsWith("goal_complete"))) earned.add("goal_crusher");
    if (p.streak_days >= 7) earned.add("week_warrior");
    if (p.streak_days >= 30) earned.add("month_master");
    if (events.some(e => e.event_type === "update_life_balance")) earned.add("self_aware");
    if (events.some(e => e.event_type === "seal_letter")) earned.add("time_traveler");
    if (p.current_chapter >= 3) earned.add("momentum");
    
    // We can infer goal_setter if goals_completed > 0 or by checking growth_os_v1
    const v1 = localStorage.getItem("growth_os_v1");
    if (v1 && JSON.parse(v1).goals?.length > 0) earned.add("goal_setter");

    setEarnedBadges(earned);
  }, []);

  if (!progress) return null;

  const currentChapterConfig = CHAPTERS.find(c => c.level === progress.current_chapter) || CHAPTERS[0];
  const nextChapterConfig = CHAPTERS.find(c => c.level === progress.current_chapter + 1);
  const startXp = currentChapterConfig.xp_required;
  const targetXp = nextChapterConfig ? nextChapterConfig.xp_required : startXp + 5000;
  const percentage = Math.min(100, Math.max(0, ((progress.total_xp - startXp) / (targetXp - startXp)) * 100));

  return (
    <div style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)", maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem" }}>
      
      {/* Top Card: Identity */}
      <div className="stationery-card" style={{ padding: "3rem 2rem", textAlign: "center", marginBottom: "2rem", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50%", left: "-50%", width: "200%", height: "200%", background: "radial-gradient(circle at center, rgba(167,139,250,0.15) 0%, transparent 60%)", pointerEvents: "none" }} />
        
        <div style={{ fontSize: "5rem", animation: "floatY 6s ease-in-out infinite" }}>
          {currentChapterConfig.emoji}
        </div>
        <h2 style={{ fontSize: "2rem", margin: "1rem 0 0.5rem 0", background: "linear-gradient(135deg, #E0D7FF, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Chapter {currentChapterConfig.level}: {currentChapterConfig.title}
        </h2>
        <div style={{ fontSize: "1.2rem", fontWeight: "600", color: "#FFF" }}>Local Explorer</div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontStyle: "italic", marginTop: "0.25rem" }}>
          On this journey since {new Date(progress.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total XP", value: progress.total_xp, icon: "⭐" },
          { label: "Goals Completed", value: progress.goals_completed, icon: "🏆" },
          { label: "Day Streak", value: progress.streak_days, icon: "🔥" },
          { label: "Tasks Done", value: progress.tasks_completed, icon: "📋" }
        ].map((s, i) => (
          <div key={i} className="stationery-card" style={{ padding: "1.5rem 1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{s.icon}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#FFF" }}>{s.value}</div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", fontWeight: "600" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* XP Progress Card */}
      <div className="stationery-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.2rem", fontWeight: "600", color: "#FFF" }}>Journey Progress</h3>
        
        <div style={{ position: "relative", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.9rem", color: "#FFF", fontWeight: "600" }}>{currentChapterConfig.title}</span>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{progress.total_xp} / {targetXp} XP</span>
          </div>
          <div style={{ width: "100%", height: "12px", background: "rgba(255,255,255,0.1)", borderRadius: "6px", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${percentage}%`,
              background: "linear-gradient(90deg, #667eea, #a78bfa, #f093fb)",
              borderRadius: "6px", transition: "width 1s ease-out"
            }} />
          </div>
        </div>

        {/* Chapter History */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", borderLeft: "2px solid rgba(255,255,255,0.05)", paddingLeft: "1.5rem", marginLeft: "0.5rem" }}>
          {CHAPTERS.filter(c => c.level <= progress.current_chapter).reverse().map(c => (
            <div key={c.level} style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "-1.85rem", top: "0.25rem", width: "10px", height: "10px", borderRadius: "50%", background: "#A78BFA", boxShadow: "0 0 10px rgba(167,139,250,0.5)" }} />
              <div style={{ fontSize: "1rem", color: "#FFF", fontWeight: "600" }}>{c.emoji} Chapter {c.level}: {c.title}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Unlocked at {c.xp_required} XP</div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="stationery-card" style={{ padding: "2rem" }}>
        <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.2rem", fontWeight: "600", color: "#FFF" }}>Milestone Badges</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "2rem 1rem", textAlign: "center" }}>
          {ALL_BADGES.map(b => {
            const isEarned = earnedBadges.has(b.id);
            return (
              <div key={b.id} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem",
                opacity: isEarned ? 1 : 0.4,
                filter: isEarned ? "none" : "grayscale(100%)",
                transition: "all 0.3s"
              }}>
                <div style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  background: isEarned ? "linear-gradient(135deg, rgba(167,139,250,0.2), rgba(102,126,234,0.2))" : "rgba(255,255,255,0.05)",
                  border: isEarned ? "2px solid rgba(167,139,250,0.5)" : "2px solid rgba(255,255,255,0.1)",
                  display: "grid", placeContent: "center", fontSize: "2rem",
                  boxShadow: isEarned ? "0 0 20px rgba(167,139,250,0.3)" : "none",
                  position: "relative"
                }}>
                  {b.icon}
                  {!isEarned && (
                    <div style={{ position: "absolute", bottom: "-5px", right: "-5px", background: "#1A1535", borderRadius: "50%", width: "24px", height: "24px", display: "grid", placeContent: "center", fontSize: "0.7rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                      🔒
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#FFF" }}>{b.label}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.2" }}>{b.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
