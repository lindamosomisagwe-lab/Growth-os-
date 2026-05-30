import React, { useState, useEffect, useRef } from "react";

const cognitiveStates = [
  { label: "I am feeling overwhelmed with tasks.", id: "overwhelmed" },
  { label: "I feel like I'm not making progress.", id: "stagnant" },
  { label: "I need motivation to start my goals.", id: "unmotivated" },
  { label: "I am feeling tired and anxious today.", id: "anxious" },
  { label: "I feel calm and ready to reflect.", id: "calm" },
  { label: "Just give me a general positive affirmation.", id: "general" },
];

// Fallback affirmations when no Claude API key is set
const fallbackAffirmations = {
  overwhelmed: "You are not behind. You are human, doing your best with what you have right now. One thing at a time is enough.",
  stagnant: "Progress often hides beneath the surface. Every intention you've held, every note you've taken — it is all building. Trust the compounding.",
  unmotivated: "Motivation follows action, not the other way around. Begin with the smallest possible step. The momentum will find you.",
  anxious: "Your body is trying to protect you. Take one slow breath. You are safe in this moment, and this moment is enough.",
  calm: "From this quiet place, you can see clearly. Use this stillness — it is a gift. What matters most to you right now?",
  general: "You are cultivating a life of deep purpose. Every small step today is a seed planted for your future self. Trust the timing."
};

function AffirmationFade({ text }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [text]);

  return (
    <p style={{
      fontSize: "1.15rem", lineHeight: "1.8", fontWeight: "600", margin: 0,
      color: "var(--text-primary)", letterSpacing: "-0.01em", fontStyle: "italic",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.6s ease-in",
      position: "relative", zIndex: 2
    }}>
      "{text}"
    </p>
  );
}

export default function Sparks() {
  const [activeState, setActiveState] = useState(() => localStorage.getItem("sparks_last_state") || "");
  const [affirmation, setAffirmation] = useState(() => localStorage.getItem("sparks_last_affirmation") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const getContextData = () => {
    try {
      const saved = localStorage.getItem("growth_os_v1");
      if (!saved) return { topGoal: null, recentMoods: [] };
      const parsed = JSON.parse(saved);
      const topGoal = parsed.goals?.find(g => !g.completed)?.title || null;
      const moodEntries = Object.entries(parsed.moodTracker || {})
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 3)
        .map(([date, emoji]) => `${date}: ${emoji}`);
      return { topGoal, recentMoods: moodEntries };
    } catch (e) {
      return { topGoal: null, recentMoods: [] };
    }
  };

  const generateAffirmation = async (stateId, stateLabel) => {
    setIsLoading(true);
    setError("");
    setAffirmation("");

    const claudeKey = localStorage.getItem("claude_api_key");

    if (!claudeKey) {
      // Fallback: use curated affirmation with short delay to simulate "thinking"
      await new Promise(r => setTimeout(r, 600));
      const text = fallbackAffirmations[stateId] || fallbackAffirmations.general;
      setAffirmation(text);
      localStorage.setItem("sparks_last_affirmation", text);
      localStorage.setItem("sparks_last_state", stateId);
      setIsLoading(false);
      return;
    }

    // Claude API call
    const { topGoal, recentMoods } = getContextData();
    const prompt = `You are a warm, grounded personal growth coach. Generate a short, personalized affirmation (2-3 sentences max) for someone who says: "${stateLabel}"
    
Context about this person:
- Current top goal: ${topGoal || "Not set yet"}
- Recent mood log: ${recentMoods.length > 0 ? recentMoods.join(", ") : "No recent entries"}

Write in second person ("you"), mixed case (not all caps), warm and direct tone. No generic platitudes. Be specific to their context if possible. Do not use quotation marks around the affirmation.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": claudeKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 150,
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.content?.[0]?.text?.trim() || fallbackAffirmations[stateId];
      setAffirmation(text);
      localStorage.setItem("sparks_last_affirmation", text);
      localStorage.setItem("sparks_last_state", stateId);
    } catch (err) {
      setError("Could not reach Claude API. Showing a curated affirmation instead.");
      const text = fallbackAffirmations[stateId] || fallbackAffirmations.general;
      setAffirmation(text);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (state) => {
    if (isLoading) return;
    setActiveState(state.id);
    generateAffirmation(state.id, state.label);
  };

  const handleRegenerate = () => {
    const state = cognitiveStates.find(s => s.id === activeState);
    if (state) generateAffirmation(state.id, state.label);
  };

  return (
    <div style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
      <header style={{ marginBottom: "2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
        <h2 style={{ margin: "0", fontSize: "1.6rem", fontWeight: "800", letterSpacing: "-0.03em" }}>
          Cognitive Calibration Sparks
        </h2>
        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
          SELECT A COGNITIVE STATE FOR A PERSONALIZED AFFIRMATION
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", alignItems: "start" }}>

        {/* State selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.8rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>
            SELECT CURRENT COGNITIVE STATE:
          </p>
          {cognitiveStates.map(state => {
            const isAct = activeState === state.id;
            return (
              <button
                key={state.id}
                onClick={() => handleSelect(state)}
                disabled={isLoading}
                style={{
                  background: isAct ? "rgba(254,214,64,0.15)" : "rgba(255,255,255,0.04)",
                  color: isAct ? "var(--accent-gold)" : "var(--text-primary)",
                  border: isAct ? "1px solid rgba(254,214,64,0.4)" : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isAct ? "0 0 16px rgba(254,214,64,0.15)" : "none",
                  padding: "0.9rem 1.2rem",
                  borderRadius: "12px",
                  cursor: isLoading ? "wait" : "pointer",
                  fontWeight: "600", fontSize: "0.88rem",
                  letterSpacing: "0.01em", textAlign: "left",
                  transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)", display: "block", width: "100%",
                  opacity: isLoading && !isAct ? 0.5 : 1,
                  transform: isAct ? "scale(1.02)" : "scale(1)"
                }}
              >
                {state.label}
              </button>
            );
          })}
        </div>

        {/* Affirmation Board */}
        <div className="stationery-card module-sparks" style={{
          textAlign: "center", display: "flex", flexDirection: "column",
          justifyContent: "center", minHeight: "300px", position: "relative",
          overflow: "hidden", padding: "2.5rem 2rem", gap: "1.5rem"
        }}>
          <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", fontWeight: "700" }}>
            [AFFIRMATION CALIBRATION]
          </span>

          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", minHeight: "80px" }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: "inline-block", width: "10px", height: "10px", borderRadius: "50%",
                  background: "var(--accent)", animation: `thinkBounce 1.2s ${i * 0.2}s infinite ease-in-out`
                }} />
              ))}
              <style>{`@keyframes thinkBounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
            </div>
          ) : affirmation ? (
            <AffirmationFade text={affirmation} />
          ) : (
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", fontStyle: "italic", margin: 0, lineHeight: 1.7 }}>
              Select a cognitive state to receive your affirmation.
            </p>
          )}

          {error && (
            <p style={{ fontSize: "0.75rem", color: "var(--accent-secondary)", fontFamily: "var(--font-mono)", margin: 0 }}>
              {error}
            </p>
          )}

          {affirmation && !isLoading && (
            <button onClick={handleRegenerate} className="btn-secondary" style={{ fontSize: "0.78rem", padding: "0.5rem 1.25rem", letterSpacing: "0.04em", alignSelf: "center" }}>
              Regenerate
            </button>
          )}

          {!localStorage.getItem("claude_api_key") && (
            <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", margin: 0, opacity: 0.6 }}>
              Add Claude API key in Settings for personalized affirmations.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
