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

// Component to handle dynamic body ombre based on time, mood, and streak
function OmbreBackgroundController() {
  const { progress } = useGamification();
  const streak = progress ? progress.streak_days : 0;
  const [dailyLogs, setDailyLogs] = useState([]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("growth_os_v1");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.dailyLogs) setDailyLogs(parsed.dailyLogs);
        } catch (e) {}
      }
    };
    handleStorageChange();
    window.addEventListener("growth_os_save", handleStorageChange);
    return () => window.removeEventListener("growth_os_save", handleStorageChange);
  }, []);

  useEffect(() => {
    const hr = new Date().getHours();
    let grad1, grad2, grad3;

    // Time of day base
    if (hr >= 5 && hr < 12) {
      grad1 = "#0f0c29"; grad2 = "#302b63"; grad3 = "#c47a2a"; // Morning
    } else if (hr >= 12 && hr < 17) {
      grad1 = "#0f2027"; grad2 = "#203a43"; grad3 = "#2c5364"; // Afternoon
    } else if (hr >= 17 && hr < 21) {
      grad1 = "#0f0c29"; grad2 = "#302b63"; grad3 = "#6d28d9"; // Evening
    } else {
      grad1 = "#09080F"; grad2 = "#130F2E"; grad3 = "#1e1b4b"; // Night
    }

    // Mood tinting (look at last 3 logs)
    let sadCount = 0;
    let happyCount = 0;
    const last3Logs = dailyLogs.slice(0, 3);
    last3Logs.forEach(log => {
      if (log.mood === "sad" || log.mood === "angry") sadCount++;
      if (log.mood === "happy" || log.mood === "content") happyCount++;
    });

    if (happyCount >= 2) {
      // Warm it up
      grad3 = "#9e4e24"; // warmer
    } else if (sadCount >= 2) {
      // Cool it down to deep indigo
      grad2 = "#0B091B"; 
      document.body.style.animationDuration = "18s"; // slow down
    } else {
      document.body.style.animationDuration = "12s";
    }

    // Streak brightness
    if (streak >= 7) {
      // add subtle brightness by tweaking grad1
      if (hr >= 5 && hr < 17) grad1 = "#1a164a";
      else grad1 = "#1a164a"; 
    }

    document.body.style.setProperty("--grad-1", grad1);
    document.body.style.setProperty("--grad-2", grad2);
    document.body.style.setProperty("--grad-3", grad3);
  }, [dailyLogs, streak]);

  return null;
}

function RouteColorController() {
  const location = useLocation();
  
  useEffect(() => {
    let accent = "#7C5CFC"; // Home default (Purple-indigo)
    const path = location.pathname;
    
    if (path === "/wheel") accent = "#4FACFE"; // Sky blue
    else if (path === "/goals") accent = "#F05A7E"; // Coral-pink
    else if (path === "/log") accent = "#43E97B"; // Mint green
    else if (path === "/vault") accent = "#A78BFA"; // Deep purple
    
    document.documentElement.style.setProperty("--page-accent", accent);
  }, [location.pathname]);

  return null;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Check if first time
  useEffect(() => {
    const isFirstTime = localStorage.getItem("growth_os_onboarded");
    if (isFirstTime === "true") {
      setShowSplash(false);
    }
  }, []);

  return (
    <GamificationProvider>
      <OmbreBackgroundController />
      <Router>
        <RouteColorController />
        {showSplash && <Splash onComplete={() => {
          localStorage.setItem("growth_os_onboarded", "true");
          setShowSplash(false);
        }} />}
        <div style={{ display: "flex", minHeight: "100vh", background: "transparent" }}>
          <Sidebar />
          <main style={{ flex: 1, padding: "0", height: "100vh", overflowY: "auto", boxSizing: "border-box", position: "relative" }}>
            <GameHUD />
            <div className="page-wrap" style={{ padding: "2rem 3rem" }}>
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
