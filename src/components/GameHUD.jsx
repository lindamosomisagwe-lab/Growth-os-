import React from "react";
import { useGamification } from "../contexts/GamificationContext";

export default function GameHUD() {
  const { progress } = useGamification();

  if (!progress) return null;

  // Format date nicely in "Tuesday, June 2" style
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="hud-container">
      <div className="hud-chip chip-streak">🔥 {progress.streak_days} streak</div>
      <div className="hud-chip chip-xp">⚡ {progress.total_xp} XP</div>
      <div className="hud-chip chip-chapter">📖 Ch.{progress.current_chapter}</div>
      <div style={{marginLeft:'auto', fontSize:'11px', fontWeight:'500', letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(26,16,8,0.3)', fontFamily: "var(--font-sans)"}}>
        {formattedDate}
      </div>
    </div>
  );
}
