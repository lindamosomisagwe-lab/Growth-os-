import React from "react";
import { NavLink } from "react-router-dom";

export default function FloatingNav() {
  const linkStyle = ({ isActive }) => ({
    textDecoration: "none",
    fontWeight: "300",
    fontSize: "0.75rem",
    letterSpacing: "0.1em",
    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
    borderBottom: isActive ? "0.5px solid var(--text-primary)" : "none",
    paddingBottom: "0.2rem",
    transition: "all 0.3s ease"
  });

  return (
    <nav style={{
      position: "fixed",
      bottom: "2rem",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      gap: "2rem",
      background: "rgba(253, 251, 247, 0.8)",
      backdropFilter: "blur(10px)",
      padding: "1rem 3rem",
      borderRadius: "100px",
      boxShadow: "0 10px 40px rgba(0,0,0,0.03)",
      zIndex: 3000,
      border: "0.5px solid rgba(74, 4, 4, 0.1)"
    }}>
      <NavLink to="/" style={linkStyle} end>Dashboard</NavLink>
      <NavLink to="/goals" style={linkStyle}>Goals</NavLink>
      <NavLink to="/wellness" style={linkStyle}>Wellness</NavLink>
      <NavLink to="/vault" style={linkStyle}>Vault</NavLink>
    </nav>
  );
}
