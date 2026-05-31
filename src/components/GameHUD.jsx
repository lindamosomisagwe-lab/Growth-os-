import React from "react";
import { useGamification } from "../contexts/GamificationContext";

export default function GameHUD() {
  const { progress } = useGamification();

  return (
    <div className="game-hud-bar">
      <div className="hud-chip">
        <span className="icon">🔥</span>
        <span className="val">{progress.streakDays}</span>
        <span className="lbl">streak</span>
      </div>
      <div className="hud-chip">
        <span className="icon">⭐</span>
        <span className="val">{progress.totalXP}</span>
        <span className="lbl">XP</span>
      </div>
      <div className="hud-chip">
        <span className="icon">🌸</span>
        <span className="val">Ch.{progress.currentChapter}</span>
      </div>
      {progress.streakShieldAvailable && (
        <div className="hud-chip" style={{ background: "rgba(249, 212, 35, 0.15)", borderColor: "rgba(249, 212, 35, 0.3)" }}>
          <span className="icon">🛡️</span>
          <span className="val" style={{ color: "#F9D423" }}>Ready</span>
        </div>
      )}
    </div>
  );
}
