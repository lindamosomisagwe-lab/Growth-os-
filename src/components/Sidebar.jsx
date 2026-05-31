import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useGamification } from "../contexts/GamificationContext";
import XPBar from "./XPBar";

const coreLinks = [
  { path: "/", label: "Home", icon: "🏠" },
  { path: "/wheel", label: "Life Balance", icon: "⚖️" },
  { path: "/goals", label: "Goals", icon: "🎯" },
  { path: "/log", label: "Today", icon: "📋" },
  { path: "/vault", label: "Vault", icon: "💌" }
];

export default function Sidebar() {
  const { progress } = useGamification();
  const streak = progress?.streak_days || 0;
  const shield = progress?.streak_shield_available || false;
  
  const [streakBounce, setStreakBounce] = useState(false);

  useEffect(() => {
    const handleXPEvent = (e) => {
      if (e.detail.eventType === 'daily_checkin') {
        setStreakBounce(true);
        setTimeout(() => setStreakBounce(false), 500);
      }
    };
    window.addEventListener("xp_awarded_event", handleXPEvent);
    return () => window.removeEventListener("xp_awarded_event", handleXPEvent);
  }, []);

  return (
    <aside style={{ width: "260px", padding: "2rem 1.5rem", display: "flex", flexDirection: "column" }}>
      
      {/* Brand */}
      <div style={{ marginBottom: "3rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #A78BFA, #667eea)", display: "grid", placeContent: "center", boxShadow: "0 0 15px rgba(167,139,250,0.4)" }}>
          <span style={{ color: "#fff", fontSize: "1.2rem" }} aria-hidden="true">✦</span>
        </div>
        <h1 style={{ margin: 0, fontSize: "1.25rem", letterSpacing: "0.05em", color: "var(--text-primary)" }}>
          Growth OS
        </h1>
      </div>

      {/* Main Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
        {coreLinks.map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => isActive ? "active" : ""}
            style={{ display: "flex", alignItems: "center", gap: "1rem", textDecoration: "none" }}
          >
            <span style={{ fontSize: "1.2rem", opacity: 0.9 }} aria-hidden="true">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Gamification Area */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column" }}>
        
        {/* Streak Display */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0 1rem", marginBottom: "1rem", color: "#F0EEF8", fontWeight: "500" }}>
          <span style={{ 
            display: "inline-block", 
            transform: streakBounce ? "scale(1.3)" : "scale(1)", 
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" 
          }}>🔥</span> 
          <span>{streak} day streak</span>
          {shield && <span style={{ fontSize: "0.8rem", marginLeft: "auto" }} title="Streak Shield Available">🛡️</span>}
        </div>

        <XPBar />

        {/* User Profile / Settings */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem", borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "1.25rem" }}>
          <NavLink to="/profile" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none", color: "var(--text-primary)" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "grid", placeContent: "center", fontSize: "1.2rem" }}>👤</div>
            <span style={{ fontSize: "0.95rem", fontWeight: "600" }}>Profile</span>
          </NavLink>
          
          <NavLink to="/settings" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "1.1rem", opacity: 0.7, transition: "opacity 0.2s" }} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.7}>
            <span aria-hidden="true">⚙️</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
