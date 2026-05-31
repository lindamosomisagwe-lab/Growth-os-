import React, { useState, useEffect } from "react";
import { useGamification } from "../contexts/GamificationContext";
import { CHAPTERS } from "../services/xpService";

export default function XPBar() {
  const { progress } = useGamification();
  const [displayXp, setDisplayXp] = useState(0);
  const [displayChapter, setDisplayChapter] = useState(1);
  const [isFlashing, setIsFlashing] = useState(false);
  const [bonuses, setBonuses] = useState([]);

  // Initialize once
  useEffect(() => {
    if (progress && displayXp === 0) {
      setDisplayXp(progress.total_xp);
      setDisplayChapter(progress.current_chapter);
    }
  }, [progress]);

  useEffect(() => {
    const handleXPEvent = (e) => {
      const { xpAwarded, isBonus, leveledUp, newChapter, totalXp } = e.detail;
      
      if (isBonus) {
        const id = Date.now();
        setBonuses(prev => [...prev, { id, amount: xpAwarded }]);
        setTimeout(() => {
          setBonuses(prev => prev.filter(b => b.id !== id));
        }, 1500);
      }

      if (leveledUp) {
        // Animate overflow
        const targetChapter = CHAPTERS.find(c => c.level === newChapter.level);
        const threshold = targetChapter.xp_required;
        setDisplayXp(threshold); // Fill to 100%
        
        setTimeout(() => {
          setIsFlashing(true); // Flash white
          setTimeout(() => {
            setIsFlashing(false);
            setDisplayChapter(newChapter.level);
            setDisplayXp(totalXp); // Continue filling into new chapter
          }, 300); // flash duration
        }, 1200); // Wait for transition to hit 100%
      } else {
        setDisplayXp(totalXp);
      }
    };

    window.addEventListener("xp_awarded_event", handleXPEvent);
    return () => window.removeEventListener("xp_awarded_event", handleXPEvent);
  }, []);

  if (!progress) return null;

  const currentChapterConfig = CHAPTERS.find(c => c.level === displayChapter) || CHAPTERS[0];
  const nextChapterConfig = CHAPTERS.find(c => c.level === displayChapter + 1);
  
  const startXp = currentChapterConfig.xp_required;
  const targetXp = nextChapterConfig ? nextChapterConfig.xp_required : startXp + 5000;
  
  // Guard against visual bugs at max level
  const percentage = Math.min(100, Math.max(0, ((displayXp - startXp) / (targetXp - startXp)) * 100));

  return (
    <div style={{ position: "relative", marginBottom: "1.5rem", padding: "0 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
        <span style={{ fontSize: "11px", color: "#9B93BC", fontWeight: "600", letterSpacing: "0.02em" }}>
          {currentChapterConfig.emoji} {currentChapterConfig.title}
        </span>
      </div>
      
      <div style={{ position: "relative" }}>
        <div style={{ 
          width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden",
          boxShadow: isFlashing ? "0 0 20px rgba(255,255,255,0.8)" : "none",
          transition: "box-shadow 0.3s ease"
        }}>
          <div style={{
            height: "100%",
            width: `${percentage}%`,
            background: "linear-gradient(90deg, #667eea, #a78bfa, #f093fb)",
            borderRadius: "3px",
            transition: "width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }} />
        </div>

        {/* Bonus Floating Indicators */}
        {bonuses.map(b => (
          <div key={b.id} style={{
            position: "absolute", right: 0, bottom: "10px",
            color: "#F9D423", fontWeight: "800", fontSize: "0.85rem",
            textShadow: "0 2px 10px rgba(249, 212, 35, 0.4)",
            animation: "floatUpAndFade 1.2s ease-out forwards",
            pointerEvents: "none"
          }}>
            ⚡ BONUS! +{b.amount}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "0.3rem", fontSize: "10px", color: "rgba(255,255,255,0.3)", textAlign: "right", fontFamily: "var(--font-mono)" }}>
        {Math.floor(displayXp)} / {targetXp} XP
      </div>
    </div>
  );
}
