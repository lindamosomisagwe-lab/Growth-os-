import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import GameHUD from "./components/GameHUD";
import Dashboard from "./components/Dashboard";
import WheelOfLife from "./components/WheelOfLife";
import Goals from "./components/Goals";
import DailyLog from "./components/DailyLog";
import Vault from "./components/Vault";
import Settings from "./components/Settings";
import Splash from "./components/Splash";
import Profile from "./components/Profile";
import { GamificationProvider, useGamification } from "./contexts/GamificationContext";

// Controllers removed for theme alignment

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <GamificationProvider>
      <Router>
        {showSplash && <Splash onComplete={() => {
          localStorage.setItem("growth_os_onboarded", "true");
          setShowSplash(false);
        }} />}
        <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "transparent" }}>
          <Sidebar />
          <main style={{ flex: 1, padding: "0", height: "100vh", overflowY: "auto", boxSizing: "border-box", position: "relative" }}>
            <GameHUD />
            <div className="page-wrap" style={{ padding: "1.5rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/wheel" element={<WheelOfLife />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/log" element={<DailyLog />} />
                <Route path="/vault" element={<Vault />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </GamificationProvider>
  );
}
