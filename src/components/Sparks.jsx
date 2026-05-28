import React, { useState, useEffect, useRef } from "react";

const affirmations = [
  "YOU ARE CULTIVATING A LIFE OF DEEP PURPOSE. TRUST THE TIMING.",
  "EVERY SMALL STEP YOU TAKE TODAY IS A SEED PLANTED FOR YOUR FUTURE SELF.",
  "BE GENTLE WITH YOURSELF. GROWTH IS NOT A RACE, IT IS A SEASONAL JOURNEY.",
  "YOU POSSESS A BEAUTIFUL, QUIET STRENGTH. BELIEVE IN YOUR CAPACITY TO ADAPT.",
  "ALLOW YOURSELF THE SPACE TO BREATHE, REFLECT, AND JUST BE. YOU ARE ENOUGH.",
  "YOUR ASPIRATIONS ARE VALID, AND YOUR EFFORTS ARE FULLY HONORABLE.",
  "REMEMBER: EVEN THE GRANDEST TREES START AS TINY SPROUTS IN THE DARK.",
  "YOUR PATH IS UNIQUE. EMBRACE YOUR PACE AND CELEBRATE PERSONAL MILESTONES."
];

const prompts = [
  "I am feeling overwhelmed with tasks.",
  "I feel like I'm not making progress.",
  "I need motivation to start my goals.",
  "I am feeling tired and anxious today.",
  "Just give me a general positive prompt."
];

export default function Sparks() {
  const [spark, setSpark] = useState(() => {
    return localStorage.getItem("sparks_last_affirmation") || affirmations[0];
  });
  const [activePrompt, setActivePrompt] = useState(() => {
    return localStorage.getItem("sparks_last_prompt") || "";
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const streamIntervalRef = useRef(null);

  const triggerSpark = index => {
    if (isStreaming) return;
    
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
    }
    
    setActivePrompt(prompts[index]);
    setIsStreaming(true);
    setSpark("");
    
    const randomIdx = Math.floor(Math.random() * affirmations.length);
    const targetText = affirmations[randomIdx];
    let currentIndex = 0;
    
    streamIntervalRef.current = setInterval(() => {
      currentIndex++;
      const current = targetText.substring(0, currentIndex);
      setSpark(current);
      if (currentIndex >= targetText.length) {
        clearInterval(streamIntervalRef.current);
        setIsStreaming(false);
        // Persist completed affirmation + prompt
        localStorage.setItem("sparks_last_affirmation", targetText);
        localStorage.setItem("sparks_last_prompt", prompts[index]);
      }
    }, 40);
  };
  
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  return (
    <div style={{ color: "#ffffff", fontFamily: "var(--font-sans)" }}>
      <header style={{ marginBottom: "2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
        <h2 style={{ margin: "0", fontSize: "1.6rem", fontWeight: "800", letterSpacing: "-0.03em", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          Cognitive Calibration Sparks
        </h2>
        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#888888", fontFamily: "var(--font-mono)", }}>
          SELECT BASES FOR REAL-TIME TYPOGRAPHICAL AFFIRMATION ALIGNMENT
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", alignItems: "start" }}>
        {/* Choices panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.8rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: "#888888", letterSpacing: "0.05em" }}>
            SELECT CURRENT COGNITIVE STATE:
          </p>
          {prompts.map((p, idx) => {
            const isAct = activePrompt === p;
            return (
              <button
                key={p}
                onClick={() => triggerSpark(idx)}
                className={isAct && isStreaming ? "loading-glow" : ""}
                style={{
                  background: isAct ? "#ffffff" : "transparent",
                  color: isAct ? "#000000" : "#ffffff",
                  border: isAct ? "1px solid #ffffff" : "1px solid var(--border-color)",
                  borderRadius: "0px",
                  padding: "1rem",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  letterSpacing: "0.02em",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  display: "block",
                  width: "100%"
                }}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Affirmation Board */}
        <div className="stationery-card" style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minHeight: "280px",
          position: "relative",
          overflow: "hidden",
          background: "#ffffff",
          color: "#000000",
          border: "1px solid #ffffff",
          padding: "2rem"
        }}>
          <span style={{ fontSize: "1.2rem", color: "#888888", fontFamily: "var(--font-mono)", letterSpacing: "0.05em", display: "block", marginBottom: "1.5rem" }}>
            [AFFIRMATION CALIBRATION]
          </span>
          <p style={{
            fontSize: "1.3rem",
            lineHeight: "1.7",
            fontWeight: "800",
            margin: 0,
            color: "#000000",
            letterSpacing: "-0.02em",
            position: "relative",
            zIndex: 2
          }}>
            "{spark}"
          </p>
        </div>
      </div>
    </div>
  );
}
