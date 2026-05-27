import React from "react";
import useLocalStorage from "../hooks/useLocalStorage";

export default function Dashboard() {
  const [goals] = useLocalStorage("lifemart-goals", []);
  
  // Hero Goal
  const heroGoal = goals.length > 0 ? goals[0] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
      <h2 style={{ fontSize: "1rem", fontWeight: "300", letterSpacing: "0.2em", color: "var(--text-secondary)", marginBottom: "2rem" }}>
        Goal of the Day
      </h2>
      
      {heroGoal ? (
        <div style={{ maxWidth: "600px" }}>
          <h1 style={{ fontSize: "4rem", lineHeight: "1.1", marginBottom: "3rem", fontStyle: "italic", fontFamily: "var(--font-serif)" }}>
            {heroGoal.title}
          </h1>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {heroGoal.subGoals && heroGoal.subGoals.slice(0,3).map(sub => (
              <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: "1rem", justifyContent: "center", fontSize: "0.95rem", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
                <span style={{ width: "12px", height: "0.5px", background: "var(--text-secondary)" }}></span>
                {sub.title}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p style={{ fontStyle: "italic", color: "var(--text-secondary)" }}>No active goals. Open your journal to begin.</p>
      )}
    </div>
  );
}
