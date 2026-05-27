import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FloatingNav from "./components/FloatingNav";
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

export default function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  return (
    <Router>
      {showSplash && <Splash onComplete={() => setShowSplash(false)} />}
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg-page)" }}>
        
        <main style={{ flex: 1, padding: "8rem 20%", height: "100vh", overflowY: "auto", boxSizing: "border-box" }}>
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
      <FloatingNav />
    </Router>
  );
}
