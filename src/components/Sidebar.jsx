import React from "react";
import { NavLink } from "react-router-dom";
import { useGamification } from "../contexts/GamificationContext";

const coreLinks = [
  { path: "/", label: "Home", icon: "🏠", color: "var(--accent-gold)" },
  { path: "/wheel", label: "Life Balance", icon: "⚖️", color: "var(--accent-steel)" },
  { path: "/goals", label: "Goals Map", icon: "🗺️", color: "var(--accent-rust)" },
  { path: "/log", label: "Today", icon: "📋", color: "var(--accent-sage)" },
  { path: "/vault", label: "Vault", icon: "💌", color: "var(--accent-plum)" }
];

export default function Sidebar() {
  const { progress } = useGamification();
  
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 className="app-name">Growth OS</h1>
        <p className="app-tagline">your story is being written</p>
      </div>

      {/* Main Nav */}
      <nav className="sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {coreLinks.map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-dot" style={{ backgroundColor: link.color }} aria-hidden="true" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Cursive Stats & Profile Link at bottom */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {progress && (
          <div className="sidebar-stats">
            <div className="sidebar-stat">
              📖 Chapter <strong>{progress.current_chapter}</strong>
            </div>
            <div className="sidebar-stat">
              ⚡ Stamped <strong>{progress.total_xp} XP</strong>
            </div>
            <div className="sidebar-stat">
              🔥 Day Streak: <strong>{progress.streak_days} days</strong>
            </div>
          </div>
        )}

        <NavLink 
          to="/profile" 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.75rem", 
            textDecoration: "none", 
            background: "rgba(255,255,255,0.04)", 
            padding: "10px 14px", 
            borderRadius: "4px", 
            border: "1px solid rgba(255,255,255,0.06)", 
            transition: "background 0.2s" 
          }} 
          onMouseOver={e => e.currentTarget.style.background="rgba(255,255,255,0.08)"} 
          onMouseOut={e => e.currentTarget.style.background="rgba(255,255,255,0.04)"}
        >
          <div style={{ fontSize: "18px" }}>🌸</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#fafafa", fontWeight: "600", fontSize: "12px" }}>Journal Profile</span>
            <span style={{ color: "rgba(250,250,250,0.4)", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.05em" }}>View Achievements</span>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}
