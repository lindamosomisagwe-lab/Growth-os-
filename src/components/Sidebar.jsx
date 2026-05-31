import React from "react";
import { NavLink } from "react-router-dom";
import { useGamification } from "../contexts/GamificationContext";

const coreLinks = [
  { path: "/", label: "Home", icon: "🏠" },
  { path: "/wheel", label: "Life Balance", icon: "⚖️" },
  { path: "/goals", label: "Goals Map", icon: "🗺️" },
  { path: "/log", label: "Today", icon: "📋" },
  { path: "/vault", label: "Vault", icon: "💌" }
];

export default function Sidebar() {
  const { progress } = useGamification();
  
  const xpInChapter = progress.totalXP - progress.currentChapterStartXP;
  const chapterSize = progress.nextChapterXP - progress.currentChapterStartXP;
  const percent = chapterSize > 0 ? Math.min(100, Math.round((xpInChapter / chapterSize) * 100)) : 100;
  
  // Circumference of a 20px radius circle is ~125.6
  const circ = 125.6;
  const strokeDash = `${(percent / 100) * circ} ${circ}`;

  return (
    <aside style={{ width: "280px", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", background: "var(--bg-sidebar)", zIndex: 100 }}>
      
      {/* Brand */}
      <div style={{ marginBottom: "2.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "linear-gradient(135deg, var(--page-accent), rgba(255,255,255,0.2))", display: "grid", placeContent: "center", boxShadow: "0 0 15px rgba(255,255,255,0.1)", position: "relative" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19s3-3 7-3 7 3 7 3 M12 3v13 M8 7l4-4 4 4" />
          </svg>
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "800", color: "#FFF", fontFamily: "var(--font-serif)" }}>
            Growth OS
          </h1>
          <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--text-body)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Your story is being written
          </p>
        </div>
      </div>

      {/* Main Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
        {coreLinks.map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "1rem", textDecoration: "none",
              height: "52px", padding: "0 1rem", borderRadius: "16px",
              background: isActive ? "linear-gradient(135deg, rgba(124,92,252,0.3), rgba(167,139,250,0.15))" : "rgba(255,255,255,0.05)",
              border: isActive ? "1px solid rgba(124,92,252,0.4)" : "1px solid transparent",
              color: isActive ? "#FFF" : "var(--text-body)",
              fontWeight: isActive ? "800" : "600",
              position: "relative",
              transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && <div style={{ position: "absolute", left: "6px", width: "4px", height: "24px", background: "var(--page-accent)", borderRadius: "2px" }} />}
                <span style={{ fontSize: "1.3rem", filter: isActive ? "drop-shadow(0 0 8px rgba(255,255,255,0.4))" : "none", transition: "transform 0.2s", transform: isActive ? "scale(1.1)" : "scale(1)" }} aria-hidden="true">{link.icon}</span>
                <span>{link.label}</span>
                <span className="nav-arrow" style={{ marginLeft: "auto", opacity: isActive ? 1 : 0, transform: isActive ? "translateX(0)" : "translateX(-10px)", transition: "all 0.2s" }}>→</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile Character Block */}
      <div style={{ marginTop: "auto" }}>
        <NavLink to="/profile" style={{ display: "flex", alignItems: "center", gap: "1rem", textDecoration: "none", background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.background="rgba(255,255,255,0.08)"} onMouseOut={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
          <div style={{ position: "relative", width: "48px", height: "48px" }}>
            <svg width="48" height="48" style={{ position: "absolute", top: 0, left: 0 }} className="progress-ring">
              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
              <circle cx="24" cy="24" r="20" fill="none" stroke="var(--page-accent)" strokeWidth="4" strokeDasharray={strokeDash} strokeLinecap="round" className="progress-ring__circle" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeContent: "center", fontSize: "20px" }}>
              🌸
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#FFF", fontWeight: "800", fontSize: "15px" }}>Chapter {progress.currentChapter}</span>
            <span style={{ color: "var(--text-body)", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>{progress.totalXP} XP • {progress.streakDays}🔥</span>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}
