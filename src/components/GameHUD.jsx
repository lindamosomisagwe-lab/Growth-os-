import React from "react";
import { useGamification } from "../contexts/GamificationContext";

export default function GameHUD() {
  const { progress } = useGamification();

  if (!progress) return null;

  return (
    <div className="game-hud-bar">
      <div className="hud-chip">
        <span className="icon">🔥</span>
        <span className="val">{progress.streak_days}</span>
        <span className="lbl">streak</span>
      </div>
      <div className="hud-chip">
        <span className="icon">⭐</span>
        <span className="val">{progress.total_xp}</span>
        <span className="lbl">XP</span>
      </div>
      <div className="hud-chip">
        <span className="icon">🌸</span>
        <span className="val">Ch.{progress.current_chapter}</span>
      </div>
      {progress.streak_shield_available && (
        <div className="hud-chip">
          <span className="icon">🛡️</span>
          <span className="val" style={{ color: "#F9D423" }}>Ready</span>
        </div>
      )}
    </div>
  );
}
