import React from "react";
import { NavLink } from "react-router-dom";
import { useGamification } from "../contexts/GamificationContext";

const coreLinks = [
  { path: "/", label: "Home", icon: "🏠" },
  { path: "/wheel", label: "Life Balance", icon: "⚖️" },
  { path: "/goals", label: "Goals", icon: "🎯" },
  { path: "/log", label: "Today", icon: "📋" },
  { path: "/vault", label: "Vault", icon: "💌" }
];

export default function Sidebar() {
  const { streak } = useGamification();

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

      {/* Footer Area */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ padding: "1rem", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", marginBottom: "0.25rem" }}>CURRENT STREAK</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "700", color: "var(--text-primary)" }}>
            <span aria-hidden="true">🔥</span> {streak} days
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>v2.0</span>
          <NavLink to="/settings" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "1.1rem", opacity: 0.7, transition: "opacity 0.2s" }} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.7}>
            <span aria-hidden="true">⚙️</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
