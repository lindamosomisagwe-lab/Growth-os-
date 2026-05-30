import React, { useState } from "react";

export default function Splash({ onComplete }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("in");

  const [responses, setResponses] = useState({
    area: "",
    success: "",
    time: ""
  });

  const nextStep = (key, value) => {
    setResponses(prev => ({ ...prev, [key]: value }));
    if (step < 3) {
      setFade("out");
      setTimeout(() => {
        setStep(prev => prev + 1);
        setFade("in");
      }, 400);
    } else {
      finishOnboarding(value); // passing the last value directly because state update is async
    }
  };

  const finishOnboarding = (finalTimeResponse) => {
    setFade("out");
    
    setTimeout(() => {
      // 1. Seed Life Balance
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

      // 2. Draft Big Goal (without API)
      parsed.goals = [
        {
          id: Date.now(),
          title: responses.success || "Feel more in control",
          completed: false,
          pinned: true, // Pinned to home
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
    <div className="splash-container" style={{ background: "linear-gradient(135deg, #09080F, #130F2E, #1e1b4b)", backgroundSize: "400% 400%", animation: "breathe 12s ease infinite" }}>
      <div style={{ maxWidth: "500px", width: "100%", padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", opacity: fade === "in" ? 1 : 0, transition: "opacity 0.4s ease", textAlign: "center" }}>
        
        {step === 1 && (
          <>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              What's one area of your life you most want to improve right now?
            </h1>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {["Health", "Work", "Relationships", "Money", "Personal Growth", "Other"].map(area => (
                <button
                  key={area}
                  className="btn-secondary"
                  style={{ padding: "1rem", fontSize: "1rem" }}
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
            <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              What would feel like success in 3 months?
            </h1>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <textarea
                autoFocus
                placeholder="e.g. feel less stressed, get promoted, save £1,000..."
                value={responses.success}
                onChange={e => setResponses(prev => ({ ...prev, success: e.target.value }))}
                rows={3}
                style={{ fontSize: "1.2rem", textAlign: "center" }}
              />
              <button
                className="btn-primary"
                style={{ padding: "1rem", fontSize: "1rem" }}
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
            <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              How much time do you have for yourself each day?
            </h1>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {["Just 5 minutes", "About 10 minutes", "Up to 20 minutes"].map(time => (
                <button
                  key={time}
                  className="btn-secondary"
                  style={{ padding: "1rem", fontSize: "1rem" }}
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
