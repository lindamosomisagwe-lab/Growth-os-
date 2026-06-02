import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GoalCompleteSequence({ result, onClose }) {
  const { goal, xpAwarded, isBonus, leveledUp, newChapter } = result;
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [reflection, setReflection] = useState("");
  
  useEffect(() => {
    // Sequence timing
    const t1 = setTimeout(() => setStep(2), 2000);
    
    const t2 = setTimeout(() => {
      setStep(leveledUp ? 3 : 4);
    }, 3500);

    const t3 = setTimeout(() => {
      if (leveledUp) setStep(4);
    }, 6500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [leveledUp]);

  const handleSaveReflection = () => {
    if (reflection.trim()) {
      // Save to Vault logic
      const saved = localStorage.getItem("growth_os_xp_db") || "{}"; // we store in v1 instead!
      // Since Vault looks at growth_os_v1, we need to save there
      const v1Data = localStorage.getItem("growth_os_v1");
      if (v1Data) {
        const parsed = JSON.parse(v1Data);
        if (!parsed.lifeChapters) parsed.lifeChapters = [];
        parsed.lifeChapters.unshift({
          id: Date.now(),
          title: `${goal.text} — Reflection`,
          phase: new Date().toLocaleDateString(),
          note: reflection.trim()
        });
        localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
      }
    }
    setStep(5);
  };

  useEffect(() => {
    let tFinal;
    if (step === 5) {
      tFinal = setTimeout(() => {
        onClose();
        navigate("/goals");
      }, 8000);
    }
    return () => clearTimeout(tFinal);
  }, [step, navigate, onClose]);

  // Handle fast-forward on click
  const handleOverlayClick = (e) => {
    if (e.target.tagName !== "TEXTAREA" && e.target.tagName !== "BUTTON") {
      if (step < 4) setStep(4);
    }
  };

  return (
    <div 
      onClick={handleOverlayClick}
      style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: step >= 4 ? "rgba(250,250,250,0.98)" : "rgba(250,250,250,0.92)",
        backdropFilter: "blur(4px)",
        zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        animation: "fadeInUp 0.3s ease-out", transition: "background 0.8s ease"
      }}
    >
      {/* Step 1 & 2: Goal Title & XP */}
      {step < 3 && (
        <div style={{ textAlign: "center", animation: step === 1 ? "fadeInUp 0.5s ease-out" : "none" }}>
          <h2 style={{ fontSize: "3rem", margin: "0 0 1rem 0", color: "#18181b", fontFamily: "'Playfair Display', serif" }}>
            {goal.text}
          </h2>
          <div style={{ textTransform: "uppercase", color: "rgba(24,24,27,0.5)", letterSpacing: "0.15em", fontSize: "0.9rem", fontWeight: "700" }}>
            Goal Complete
          </div>
          
          {step === 2 && (
            <div style={{
              marginTop: "3rem", fontSize: "2.5rem", fontWeight: "800",
              color: isBonus ? "#d97706" : "#4d7c0f",
              animation: "floatUpAndFade 1.5s ease-out forwards",
              fontFamily: "'Playfair Display', serif"
            }}>
              +{xpAwarded} XP {isBonus && "⚡ BONUS!"}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Level Up */}
      {step === 3 && leveledUp && (
        <div style={{ textAlign: "center", animation: "fadeInUp 0.5s ease-out" }}>
          <div style={{ fontSize: "5rem", animation: "bounceScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            {newChapter.emoji}
          </div>
          <h2 style={{ fontSize: "2.5rem", margin: "1rem 0 0.5rem 0", color: "#18181b", fontFamily: "'Playfair Display', serif" }}>
            Chapter {newChapter.level}: {newChapter.title}
          </h2>
          <p style={{ color: "rgba(24,24,27,0.6)", fontSize: "1.1rem", fontFamily: "'Inter', sans-serif" }}>A new chapter of your story begins.</p>
        </div>
      )}

      {/* Step 4: Reflection */}
      {step === 4 && (
        <div style={{ width: "100%", maxWidth: "600px", padding: "2rem", animation: "fadeInUp 0.5s ease-out" }}>
          <h2 style={{ fontSize: "2rem", margin: "0 0 0.5rem 0", color: "#18181b", textAlign: "center", fontFamily: "'Playfair Display', serif" }}>
            Before you move on...
          </h2>
          <p style={{ color: "rgba(24,24,27,0.6)", textAlign: "center", marginBottom: "2rem", fontFamily: "'Inter', sans-serif" }}>
            What did completing this goal teach you?
          </p>
          <textarea
            value={reflection}
            onChange={e => setReflection(e.target.value)}
            placeholder="Write anything — even one sentence..."
            rows={4}
            style={{ 
              width: "100%", 
              fontSize: "1.1rem", 
              marginBottom: "1.5rem",
              background: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(24,24,27,0.15)",
              borderRadius: "4px",
              padding: "16px",
              fontFamily: "'Inter', sans-serif",
              color: "#18181b"
            }}
            autoFocus
          />
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button className="btn-secondary" onClick={() => setStep(5)}>Skip for now</button>
            <button className="btn-primary" onClick={handleSaveReflection}>Save to Vault</button>
          </div>
        </div>
      )}

      {/* Step 5: What's next */}
      {step === 5 && (
        <div style={{ textAlign: "center", animation: "fadeInUp 0.5s ease-out" }}>
          <h2 style={{ fontSize: "2.5rem", margin: "0 0 2rem 0", color: "#18181b", fontFamily: "'Playfair Display', serif" }}>
            Ready for your next chapter?
          </h2>
          <button className="btn-primary btn-goals" onClick={() => { onClose(); navigate("/goals"); }} style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}>
            Let's go →
          </button>
        </div>
      )}
    </div>
  );
}
