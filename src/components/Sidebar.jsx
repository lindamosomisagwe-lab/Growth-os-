import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Logo from "./Logo";

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
      fontSize: "0.72rem", color: "rgba(255,255,255,0.35)",
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
  { to: "/",         label: "Dashboard",     end: true },
  { to: "/wheel",    label: "Wheel of Life"              },
  { to: "/goals",    label: "Goals"                      },
  { to: "/chapters", label: "Life Chapters"              },
  { to: "/wellness", label: "Flo / Wellness"             },
  { to: "/mood",     label: "Mood Log"                   },
];
const toolLinks  = [
  { to: "/vault",    label: "Time Vault"  },
  { to: "/sparks",   label: "Sparks AI"  },
  { to: "/spotify",  label: "Focus Music" },
  { to: "/settings", label: "Settings"   },
];

// Section label shared style
const groupLabel = {
  display: "block",
  fontSize: "0.63rem", fontWeight: "700",
  letterSpacing: "0.18em", textTransform: "uppercase",
  color: "rgba(255,255,255,0.25)",
  fontFamily: "var(--font-mono)",
  padding: "0 0.35rem", marginBottom: "0.5rem"
};

export default function Sidebar() {
  const [isOpen,   setIsOpen]   = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handle = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  // Core links — more prominent style
  const coreStyle = ({ isActive }) => ({
    display: "flex", alignItems: "center",
    padding: "0.72rem 1rem",
    borderRadius: "0px",
    textDecoration: "none",
    fontSize: "0.88rem",
    letterSpacing: "0.03em",
    transition: "all 0.15s ease",
    fontWeight: isActive ? "700" : "500",
    fontStyle: "normal",
    // Active: gradient pill + gold left bar
    background: isActive
      ? "linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.06) 100%)"
      : "transparent",
    color: isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)",
    borderLeft: isActive ? "2px solid rgba(201,168,76,0.75)" : "2px solid transparent",
    borderRight: "none", borderTop: "none", borderBottom: "none",
    boxShadow: isActive ? "inset 0 0 0 1px rgba(255,255,255,0.1)" : "none",
  });

  // Tool links — slightly quieter
  const toolStyle = ({ isActive }) => ({
    display: "flex", alignItems: "center",
    padding: "0.58rem 1rem",
    borderRadius: "0px",
    textDecoration: "none",
    fontSize: "0.82rem",
    letterSpacing: "0.03em",
    transition: "all 0.15s ease",
    fontWeight: isActive ? "700" : "400",
    fontStyle: "normal",
    background: isActive
      ? "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)"
      : "transparent",
    color: isActive ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.38)",
    borderLeft: isActive ? "2px solid rgba(201,168,76,0.55)" : "2px solid transparent",
    borderRight: "none", borderTop: "none", borderBottom: "none",
    boxShadow: isActive ? "inset 0 0 0 1px rgba(255,255,255,0.08)" : "none",
  });

  const handleLinkClick = () => { if (isMobile) setIsOpen(false); };

  return (
    <>
      {/* Mobile hamburger */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: "fixed", top: "1.25rem", left: "1.25rem", zIndex: 3000,
            background: "linear-gradient(135deg, #2A235C, #1A1535)",
            color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "0px", width: "44px", height: "44px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.2rem", cursor: "pointer",
            boxShadow: "0 2px 8px rgba(26,21,53,0.4)"
          }}
          aria-label="Toggle Menu"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      )}

      <aside style={{
        width: "240px",
        /* Gradient: CSS class handles background, but keep inline fallback */
        background: "linear-gradient(180deg, #1C1640 0%, #0F0D28 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        padding: "2rem 1.25rem",
        display: "flex", flexDirection: "column",
        height: "100vh", boxSizing: "border-box",
        position: isMobile ? "fixed" : "sticky",
        top: 0,
        left: isMobile ? (isOpen ? 0 : "-260px") : 0,
        zIndex: 2000,
        transition: "left 0.3s ease-in-out",
        overflowY: "auto",
        boxShadow: "2px 0 24px rgba(0,0,0,0.18)"
      }}>
        {/* Dot-grid micro-texture overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          pointerEvents: "none", zIndex: 0
        }} />

        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.8rem",
          padding: "0 0.35rem", marginBottom: "2.25rem",
          position: "relative", zIndex: 1
        }}>
          <Logo size={26} color="rgba(255,255,255,0.85)" />
          <span style={{
            fontSize: "0.95rem", fontWeight: "700",
            letterSpacing: "0.08em", color: "rgba(255,255,255,0.85)",
            fontFamily: "var(--font-mono)", fontStyle: "normal"
          }}>
            GROWTH OS
          </span>
        </div>

        {/* CORE group */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.15rem", marginBottom: "1.5rem", position: "relative", zIndex: 1 }}>
          <span style={groupLabel}>Core</span>
          {coreLinks.map(({ to, label, end }) => (
            <NavLink key={to} to={to} style={coreStyle} onClick={handleLinkClick} end={end}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Hairline divider */}
        <div style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)",
          margin: "0 0.35rem 1.5rem",
          position: "relative", zIndex: 1
        }} />

        {/* TOOLS group */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.1rem", flex: 1, position: "relative", zIndex: 1 }}>
          <span style={groupLabel}>Tools</span>
          {toolLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} style={toolStyle} onClick={handleLinkClick}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          marginTop: "2rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "1rem",
          display: "flex", flexDirection: "column", gap: "0.5rem",
          position: "relative", zIndex: 1
        }}>
          <SyncDot />
          <div style={{
            fontSize: "0.68rem", color: "rgba(255,255,255,0.18)",
            fontFamily: "var(--font-mono)", letterSpacing: "0.05em", fontStyle: "normal"
          }}>
            Command Center v1.0
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
            background: "rgba(0,0,0,0.55)", zIndex: 1900,
            backdropFilter: "blur(2px)"
          }}
        />
      )}
    </>
  );
}
