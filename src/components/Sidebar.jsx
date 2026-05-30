import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Logo from "./Logo";

// Sync status: green dot = synced (localStorage-based)
function SyncDot() {
  const [status, setStatus] = useState("synced"); // synced | syncing | error
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
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
      <span style={{
        width: "7px", height: "7px", borderRadius: "50%", background: color,
        boxShadow: status === "synced" ? `0 0 6px ${color}` : "none",
        flexShrink: 0, display: "inline-block",
        animation: status === "syncing" ? "pulse 1s infinite" : "none"
      }} />
      {label}
    </div>
  );
}

const coreLinks = [
  { to: "/",          label: "Dashboard",    end: true },
  { to: "/wheel",     label: "Wheel of Life" },
  { to: "/goals",     label: "Goals"         },
  { to: "/chapters",  label: "Life Chapters" },
  { to: "/wellness",  label: "Flo / Wellness"},
  { to: "/mood",      label: "Mood Log"      },
];

const toolLinks = [
  { to: "/vault",     label: "Time Vault"    },
  { to: "/sparks",    label: "Sparks AI"     },
  { to: "/spotify",   label: "Focus Music"   },
  { to: "/settings",  label: "Settings"      },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const coreLinkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    borderRadius: "0px",
    textDecoration: "none",
    fontWeight: isActive ? "700" : "500",
    fontSize: "0.88rem",
    letterSpacing: "0.04em",
    transition: "all 0.15s ease-in-out",
    color: isActive ? "var(--bg-page)" : "rgba(255,255,255,0.7)",
    background: isActive ? "var(--text-primary)" : "transparent",
    border: isActive ? "1px solid var(--text-primary)" : "1px solid rgba(255,255,255,0.1)",
    boxShadow: "none"
  });

  const toolLinkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.6rem 1rem",
    borderRadius: "0px",
    textDecoration: "none",
    fontWeight: isActive ? "700" : "400",
    fontSize: "0.8rem",
    letterSpacing: "0.04em",
    transition: "all 0.15s ease-in-out",
    color: isActive ? "var(--bg-page)" : "rgba(255,255,255,0.45)",
    background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
    border: isActive ? "1px solid rgba(255,255,255,0.3)" : "1px solid transparent",
    boxShadow: "none"
  });

  const handleLinkClick = () => { if (isMobile) setIsOpen(false); };

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      {/* Mobile hamburger */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: "fixed", top: "1.25rem", left: "1.25rem", zIndex: 3000,
            background: "#ffffff", color: "#000000",
            border: "1px solid #ffffff", borderRadius: "0px",
            width: "44px", height: "44px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.3rem", cursor: "pointer", boxShadow: "none"
          }}
          aria-label="Toggle Menu"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      )}

      <aside
        style={{
          width: "240px",
          background: "var(--bg-sidebar)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "2rem 1.25rem",
          display: "flex", flexDirection: "column", gap: "0",
          height: "100vh", boxSizing: "border-box",
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          left: isMobile ? (isOpen ? 0 : "-260px") : 0,
          zIndex: 2000,
          transition: "left 0.3s ease-in-out",
          overflowY: "auto"
        }}
      >
        {/* Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0 0.25rem", marginBottom: "2rem" }}>
          <Logo size={26} color="rgba(255,255,255,0.9)" />
          <span style={{ fontSize: "1rem", fontWeight: "700", letterSpacing: "0.06em", color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-mono)" }}>
            GROWTH OS
          </span>
        </div>

        {/* ── CORE group ── */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginBottom: "1.5rem" }}>
          <span style={{
            display: "block", fontSize: "0.65rem", fontWeight: "700",
            letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)",
            fontFamily: "var(--font-mono)", textTransform: "uppercase",
            padding: "0 0.25rem", marginBottom: "0.5rem"
          }}>
            Core
          </span>
          {coreLinks.map(({ to, label, end }) => (
            <NavLink key={to} to={to} style={coreLinkStyle} onClick={handleLinkClick} end={end}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Hairline divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "0 0.25rem 1.5rem" }} />

        {/* ── TOOLS group ── */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.2rem", flex: 1 }}>
          <span style={{
            display: "block", fontSize: "0.65rem", fontWeight: "700",
            letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)",
            fontFamily: "var(--font-mono)", textTransform: "uppercase",
            padding: "0 0.25rem", marginBottom: "0.5rem"
          }}>
            Tools
          </span>
          {toolLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} style={toolLinkStyle} onClick={handleLinkClick}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer: sync dot + version */}
        <div style={{ marginTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <SyncDot />
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
            Command Center v1.0
          </div>
        </div>
      </aside>

      {/* Mobile overlay backdrop */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed", top: 0, left: 0,
            width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.5)", zIndex: 1900
          }}
        />
      )}
    </>
  );
}
