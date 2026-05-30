import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import WheelOfLife from "./components/WheelOfLife";
import Goals from "./components/Goals";
import LifeChapters from "./components/LifeChapters";
import FloWellness from "./components/FloWellness";
import MoodTracker from "./components/MoodTracker";
import Vault from "./components/Vault";
import Sparks from "./components/Sparks";
import SpotifyWidget from "./components/SpotifyWidget";
import Settings from "./components/Settings";
import Splash from "./components/Splash";
import { GamificationProvider } from "./contexts/GamificationContext";

function GPToast() {
  const [toasts, setToasts] = React.useState([]);

  React.useEffect(() => {
    const handleGP = (e) => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, ...e.detail }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 1500); // 1.5s float animation
    };
    window.addEventListener('gp_awarded', handleGP);
    return () => window.removeEventListener('gp_awarded', handleGP);
  }, []);

  return (
    <div style={{ position: "fixed", pointerEvents: "none", zIndex: 9999, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
      {toasts.map(t => (
        <div key={t.id} className="float-anim" style={{
          position: "absolute",
          color: t.isBonus ? "var(--accent-gold)" : "var(--accent)",
          fontWeight: "800",
          fontSize: t.isBonus ? "1.5rem" : "1.2rem",
          textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          whiteSpace: "nowrap",
          animation: "floatY 1.5s ease-out forwards, fadeOut 1.5s ease-out forwards"
        }}>
          +{t.amount} GP ⚡ {t.isBonus && "BONUS!"}
        </div>
      ))}
      <style>{`
        @keyframes fadeOut {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  return (
    <GamificationProvider>
      <Router>
        {showSplash && <Splash onComplete={() => setShowSplash(false)} />}
        <GPToast />
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-page)" }}>
          <Sidebar />
          <main style={{ flex: 1, padding: "3rem", height: "100vh", overflowY: "auto", boxSizing: "border-box" }}>
            <div className="page-wrap">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/wheel" element={<WheelOfLife />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/chapters" element={<LifeChapters />} />
                <Route path="/wellness" element={<FloWellness />} />
                <Route path="/mood" element={<MoodTracker />} />
                <Route path="/vault" element={<Vault />} />
                <Route path="/sparks" element={<Sparks />} />
                <Route path="/spotify" element={<SpotifyWidget />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </GamificationProvider>
  );
}
