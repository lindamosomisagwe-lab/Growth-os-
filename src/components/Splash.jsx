import React, { useState, useEffect } from "react";
import VaporizeTextCycle, { Tag } from "./ui/vapour-text-effect";

function dispatchSave() { window.dispatchEvent(new Event("growth_os_save")); }

export default function Splash({ onComplete }) {
  const [fade, setFade] = useState("in");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Silently initialize default localStorage states for fresh users
  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (!saved) {
      const parsed = {
        wheelOfLife: {
          ratings: {
            Health: 5,
            Work: 5,
            Relationships: 5,
            Money: 5,
            "Personal Growth": 5,
            Fun: 5,
            Creativity: 5,
            Learning: 5
          },
          notes: {},
          snapshots: []
        },
        goals: [
          {
            id: Date.now(),
            title: "Outline my life blueprint",
            category: "growth",
            lifeArea: "growth",
            completed: false,
            pinned: true,
            subgoals: [
              { id: Date.now() + 1, title: "Review my life balance scores", completed: false, tasks: [] },
              { id: Date.now() + 2, title: "Write down 2 key target goals", completed: false, tasks: [] }
            ],
            relatedIds: []
          }
        ],
        dailyLogs: []
      };
      localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
      dispatchSave();
    }
  }, []);

  // Automatic cinematic transition timer adjusted for 4 short text cycles (8.4s total cycle)
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFade("out");
    }, 8200);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 8800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className="splash-container" 
      style={{ 
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#f7f3ec", // Premium cream background
        display: "grid", 
        placeContent: "center",
        opacity: fade === "in" ? 1 : 0, 
        transition: "opacity 0.6s ease",
        pointerEvents: "none"
      }}
    >
      <div style={{ width: "90vw", maxWidth: "600px", padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem", textAlign: "center" }}>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: isMobile ? "2rem" : "3rem",
          fontWeight: 700,
          color: "#1a1008",
          margin: 0,
          animation: "fadeInUp 0.8s ease-out"
        }}>
          Growth OS
        </h1>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: isMobile ? "1rem" : "1.2rem",
          fontWeight: 400,
          color: "rgba(26,16,8,0.6)",
          margin: 0,
          animation: "fadeInUp 0.8s ease-out 0.3s both"
        }}>
          Ready to plan your life?
        </p>
      </div>
    </div>
  );
}
