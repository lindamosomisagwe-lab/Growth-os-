import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Logo from "./Logo";

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

  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.8rem 1.2rem",
    borderRadius: "0px",
    textDecoration: "none",
    fontWeight: isActive ? "700" : "500",
    fontSize: "0.9rem",
    fontSize: "0.9rem",
    letterSpacing: "0.1em",
    transition: "all 0.15s ease-in-out",
    color: isActive ? "var(--bg-page)" : "var(--text-secondary)",
    background: isActive ? "var(--text-primary)" : "transparent",
    border: isActive ? "1px solid var(--text-primary)" : "1px solid var(--border-color)",
    boxShadow: "none"
  });

  const toggleSidebar = () => setIsOpen(!isOpen);
  const handleLinkClick = () => {
    if (isMobile) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Drawer Menu Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            top: "1.25rem",
            left: "1.25rem",
            zIndex: 3000,
            background: "#ffffff",
            color: "#000000",
            border: "1px solid #ffffff",
            borderRadius: "0px",
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.3rem",
            cursor: "pointer",
            boxShadow: "none"
          }}
          aria-label="Toggle Menu"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      )}

      {/* Sidebar aside Container */}
      <aside
        style={{
          width: "260px",
          background: "var(--bg-page)",
          borderRight: "1px solid var(--border-color)",
          padding: "2.5rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
          height: "100vh",
          boxSizing: "border-box",
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          left: isMobile ? (isOpen ? 0 : "-260px") : 0,
          zIndex: 2000,
          transition: "left 0.3s ease-in-out",
          boxShadow: "none"
        }}
      >
        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0 0.5rem" }}>
          <Logo size={28} color="var(--text-primary)" />
          <span style={{ fontSize: "1.1rem", fontWeight: "600", letterSpacing: "0.08em", color: "var(--text-primary)" }}>
            Growth OS
          </span>
        </div>

        {/* Nav list */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.6rem", flex: 1 }}>
          <NavLink to="/" style={linkStyle} onClick={handleLinkClick} end>
            Dashboard
          </NavLink>
          <NavLink to="/wheel" style={linkStyle} onClick={handleLinkClick}>
            Wheel of Life
          </NavLink>
          <NavLink to="/goals" style={linkStyle} onClick={handleLinkClick}>
            Goals
          </NavLink>
          <NavLink to="/chapters" style={linkStyle} onClick={handleLinkClick}>
            Life Chapters
          </NavLink>
          <NavLink to="/wellness" style={linkStyle} onClick={handleLinkClick}>
            Flo / Wellness
          </NavLink>
          <NavLink to="/mood" style={linkStyle} onClick={handleLinkClick}>
            Mood Log
          </NavLink>
          <NavLink to="/vault" style={linkStyle} onClick={handleLinkClick}>
            Time Vault
          </NavLink>
          <NavLink to="/sparks" style={linkStyle} onClick={handleLinkClick}>
            Sparks AI
          </NavLink>
          <NavLink to="/spotify" style={linkStyle} onClick={handleLinkClick}>
            Focus Music
          </NavLink>
          <NavLink to="/settings" style={linkStyle} onClick={handleLinkClick}>
            Settings
          </NavLink>
        </nav>

        {/* Footer / Brand metadata */}
        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", borderTop: "1px solid var(--border-color)", paddingTop: "1.2rem", letterSpacing: "0.05em", fontFamily: "var(--font-mono)" }}>
          Command Center v1.0
        </div>
      </aside>
      
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 1900
          }}
        />
      )}
    </>
  );
}
