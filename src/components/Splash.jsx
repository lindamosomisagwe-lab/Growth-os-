import React, { useState } from "react";

export default function Splash({ onComplete }) {
  const [step, setStep] = useState(0);
  const [fade, setFade] = useState("in");

  const [responses, setResponses] = useState({
    area: "",
    success: "",
    time: ""
  });

  const advanceStep = () => {
    setFade("out");
    setTimeout(() => {
      setStep(prev => prev + 1);
      setFade("in");
    }, 400);
  };

  const nextStep = (key, value) => {
    setResponses(prev => ({ ...prev, [key]: value }));
    if (step < 3) {
      advanceStep();
    } else {
      finishOnboarding(value);
    }
  };

  const finishOnboarding = (finalTimeResponse) => {
    setFade("out");
    setTimeout(() => {
      const saved = localStorage.getItem("growth_os_v1");
      const parsed = saved ? JSON.parse(saved) : {};
      
      parsed.wheelOfLife = {
        ratings: {
          Health: responses.area === "Health" ? 3 : 5,
          Work: responses.area === "Work" ? 3 : 5,
          Relationships: responses.area === "Relationships" ? 3 : 5,
          Money: responses.area === "Money" ? 3 : 5,
          "Personal Growth": responses.area === "Personal Growth" ? 3 : 5,
        },
        insights: {}
      };

      parsed.goals = [
        {
          id: Date.now(),
          title: responses.success || "Feel more in control",
          completed: false,
          pinned: true,
          subgoals: [
            { id: Date.now() + 1, title: "Take 5 minutes today to plan", completed: false }
          ]
        }
      ];

      localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
      onComplete();
    }, 600);
  };

  return (
    <div className="splash-container" style={{ background: "#09080F", display: "grid", placeContent: "center" }}>
      <div style={{ maxWidth: "600px", width: "100%", padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", opacity: fade === "in" ? 1 : 0, transition: "opacity 0.4s ease", textAlign: "center", position: "relative" }}>
        
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
            <div 
              onClick={advanceStep}
              className="anim-pulse-ring"
              style={{ 
                width: "80px", height: "80px", borderRadius: "50%", background: "var(--accent)", cursor: "pointer", display: "grid", placeContent: "center",
                boxShadow: "0 0 40px rgba(167,139,250,0.6)"
              }}
            >
              <span style={{ fontSize: "2rem", color: "#FFF" }}>✨</span>
            </div>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "#FFF", margin: "0 0 0.5rem" }}>Tap to begin</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>You are here. Let's find out where you're going.</p>
            </div>
          </div>
        )}

        {step === 1 && (
          <>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#FFF", letterSpacing: "-0.02em" }}>
              What's one area of your life you most want to improve right now?
            </h1>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {["Health", "Work", "Relationships", "Money", "Personal Growth", "Other"].map(area => (
                <button
                  key={area}
                  className="btn-secondary"
                  style={{ padding: "1.2rem", fontSize: "1.2rem" }}
                  onClick={() => nextStep("area", area)}
                >
                  {area}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#FFF", letterSpacing: "-0.02em" }}>
              What would feel like success in 3 months?
            </h1>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <textarea
                autoFocus
                placeholder="e.g. feel less stressed, get promoted, save £1,000..."
                value={responses.success}
                onChange={e => setResponses(prev => ({ ...prev, success: e.target.value }))}
                rows={3}
                style={{ fontSize: "1.2rem", textAlign: "center", background: "rgba(255,255,255,0.05)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: "16px", padding: "1rem", color: "#FFF" }}
              />
              <button
                className="btn-primary"
                style={{ padding: "1.2rem", fontSize: "1.2rem" }}
                onClick={() => nextStep("success", responses.success)}
                disabled={!responses.success.trim()}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#FFF", letterSpacing: "-0.02em" }}>
              How much time do you have for yourself each day?
            </h1>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {["Just 5 minutes", "About 10 minutes", "Up to 20 minutes"].map(time => (
                <button
                  key={time}
                  className="btn-secondary"
                  style={{ padding: "1.2rem", fontSize: "1.2rem" }}
                  onClick={() => nextStep("time", time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
