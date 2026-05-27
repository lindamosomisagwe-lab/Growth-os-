import React, { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

export default function Goals() {
  const [goals, setGoals] = useLocalStorage("lifemart-goals", []);
  const [showAll, setShowAll] = useState(false);

  const topGoals = goals.slice(0, 3);
  const remainingGoals = goals.slice(3);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "10rem" }}>
      <div style={{ textAlign: "center", marginBottom: "8rem" }}>
        <h1 style={{ fontSize: "3rem", fontStyle: "italic" }}>The Archive</h1>
        <p style={{ letterSpacing: "0.1em", fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "1rem" }}>
          Intentions and Architecture
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10rem" }}>
        {topGoals.map(goal => (
          <article key={goal.id} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <h2 style={{ fontSize: "2.5rem", fontStyle: "italic", borderBottom: "0.5px solid var(--border-color)", paddingBottom: "2rem" }}>
              {goal.title}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingLeft: "2rem" }}>
              {goal.subGoals && goal.subGoals.map(sub => (
                <div key={sub.id} style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem" }}>
                  <span style={{ fontSize: "0.75rem", letterSpacing: "0.1em", color: "var(--text-secondary)", marginTop: "0.3rem" }}>—</span>
                  <div style={{ fontSize: "1rem", fontWeight: "300", lineHeight: "1.6", letterSpacing: "0.02em" }}>
                    {sub.title}
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      {remainingGoals.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "8rem" }}>
          <button 
            onClick={() => setShowAll(!showAll)}
            style={{ 
              background: "transparent", 
              border: "none", 
              borderBottom: "0.5px solid var(--text-primary)",
              color: "var(--text-primary)",
              padding: "0 0 0.2rem 0",
              letterSpacing: "0.1em",
              fontSize: "0.8rem",
              cursor: "pointer"
            }}
          >
            {showAll ? "Hide Library" : "View Library"}
          </button>
          
          {showAll && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4rem", marginTop: "4rem", textAlign: "left" }}>
              {remainingGoals.map(goal => (
                <article key={goal.id} style={{ opacity: 0.7 }}>
                  <h3 style={{ fontSize: "1.5rem", fontStyle: "italic", marginBottom: "1rem" }}>{goal.title}</h3>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
