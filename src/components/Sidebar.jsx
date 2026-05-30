import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Logo from "./Logo";
import { useGamification } from "../contexts/GamificationContext";

// ── Sync status dot ────────────────────────────────────────────────────────────
function SyncDot() {
  const [status, setStatus] = useState("synced");
  useEffect(() => {
    const handler = () => {
      setStatus("syncing");
      setTimeout(() => setStatus("synced"), 800);
    };
    window.addEventListener("growth_os_save", handler);
    return () => window.removeEventListener("growth_os_save", handler);
  }, []);
  const color = status === "synced" ? "#4ade80" : status === "syncing" ? "#fbbf24" : "#f87171";
  const label = status === "synced" ? "Synced" : status === "syncing" ? "Syncing…" : "Error";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.5rem",
      fontSize: "0.72rem", color: "var(--text-secondary)",
      fontFamily: "var(--font-mono)", letterSpacing: "0.05em"
    }}>
      <span style={{
        width: "7px", height: "7px", borderRadius: "50%",
        background: color,
        boxShadow: status === "synced" ? `0 0 8px ${color}` : "none",
        flexShrink: 0, display: "inline-block",
        animation: status === "syncing" ? "pulse 1s infinite" : "none"
      }} />
      {label}
    </div>
  );
}

const coreLinks  = [
  { to: "/",         label: "Dashboard",     icon: "🏠", end: true },
  { to: "/wheel",    label: "Wheel of Life", icon: "🎯" },
  { to: "/goals",    label: "Goals",         icon: "🚀" },
  { to: "/chapters", label: "Life Chapters", icon: "📖" },
  { to: "/wellness", label: "Flo / Wellness",icon: "🌿" },
  { to: "/mood",     label: "Mood Log",      icon: "🧠" },
];
const toolLinks  = [
  { to: "/vault",    label: "Time Vault",    icon: "⏳" },
  { to: "/sparks",   label: "Sparks AI",     icon: "✨" },
  { to: "/spotify",  label: "Focus Music",   icon: "🎵" },
  { to: "/settings", label: "Settings",      icon: "⚙️" },
];

const groupLabel = {
  display: "block",
  fontSize: "0.63rem", fontWeight: "700",
  letterSpacing: "0.18em", textTransform: "uppercase",
  color: "var(--text-secondary)",
  fontFamily: "var(--font-mono)",
  padding: "0 0.35rem", marginBottom: "0.5rem"
};

function NavItem({ to, label, icon, end, onClick, isTool }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <NavLink 
      to={to} 
      end={end} 
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={({ isActive }) => (isActive ? "active" : "")}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isTool ? "0.58rem 1rem" : "0.72rem 1rem",
        fontSize: isTool ? "0.82rem" : "0.88rem",
        position: "relative"
      }}
    >
      {({ isActive }) => (
        <>
          <span>{label}</span>
          <span 
            aria-hidden="true"
            style={{
              opacity: hovered || isActive ? 1 : 0,
              transform: hovered || isActive ? "translateX(0)" : "translateX(-10px)",
              transition: "all 0.15s ease",
              filter: isActive ? "drop-shadow(0 0 6px rgba(167,139,250,0.5))" : "none"
            }}
          >
            {icon}
          </span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const [isOpen,   setIsOpen]   = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { gp, streak, getRank, streakShields } = useGamification();
  const rank = getRank();

  useEffect(() => {
    const handle = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const handleLinkClick = () => { if (isMobile) setIsOpen(false); };

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: "fixed", top: "1.25rem", left: "1.25rem", zIndex: 3000,
            background: "linear-gradient(135deg, #1A1535, #0D0B1A)",
            color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "12px", width: "44px", height: "44px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.2rem", cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)"
          }}
          aria-label="Toggle Menu"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      )}

      <aside>
        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.8rem",
          padding: "0 0.35rem", marginBottom: "2.25rem",
          position: "relative", zIndex: 1
        }}>
          <Logo size={26} color="var(--text-primary)" />
          <span style={{
            fontSize: "0.95rem", fontWeight: "700",
            letterSpacing: "0.08em", color: "var(--text-primary)",
            fontFamily: "var(--font-mono)", fontStyle: "normal"
          }}>
            GROWTH OS
          </span>
        </div>

        {/* CORE group */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.15rem", marginBottom: "1.5rem", position: "relative", zIndex: 1 }}>
          <span style={groupLabel}>Core</span>
          {coreLinks.map(link => (
            <NavItem key={link.to} {...link} onClick={handleLinkClick} />
          ))}
        </nav>

        {/* Hairline divider */}
        <div style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
          margin: "0 0.35rem 1.5rem",
          position: "relative", zIndex: 1
        }} />

        {/* TOOLS group */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.1rem", flex: 1, position: "relative", zIndex: 1 }}>
          <span style={groupLabel}>Tools</span>
          {toolLinks.map(link => (
            <NavItem key={link.to} {...link} onClick={handleLinkClick} isTool />
          ))}
        </nav>
        
        {/* GAMIFICATION STATS PANEL */}
        <div style={{
          margin: "1.5rem 0",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "1rem",
          display: "flex", flexDirection: "column", gap: "0.5rem",
          position: "relative", zIndex: 1,
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
            <span style={{ color: "var(--text-secondary)" }}>Total GP</span>
            <span style={{ color: "var(--accent-gold)", fontWeight: "800" }}>⚡ {gp.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
            <span style={{ color: "var(--text-secondary)" }}>Rank</span>
            <span style={{ color: "var(--text-primary)", fontWeight: "700" }}>{rank.emoji} {rank.name}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
            <span style={{ color: "var(--text-secondary)" }}>Streak</span>
            <span style={{ color: "#f5576c", fontWeight: "800" }}>🔥 {streak} {streak === 1 ? 'day' : 'days'}</span>
          </div>
          {streakShields > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
              <span style={{ color: "var(--text-secondary)" }}>Shields</span>
              <span style={{ color: "#60a5fa", fontWeight: "800" }}>🛡️ {streakShields}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: "auto",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "1rem",
          display: "flex", flexDirection: "column", gap: "0.5rem",
          position: "relative", zIndex: 1
        }}>
          <SyncDot />
          <div style={{
            fontSize: "0.68rem", color: "rgba(255,255,255,0.2)",
            fontFamily: "var(--font-mono)", letterSpacing: "0.05em", fontStyle: "normal"
          }}>
            Command Center v2.0
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed", top: 0, left: 0,
            width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.7)", zIndex: 1900,
            backdropFilter: "blur(4px)"
          }}
        />
      )}
    </>
  );
}
