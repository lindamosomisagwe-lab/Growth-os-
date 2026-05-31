import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGamification } from "../contexts/GamificationContext";
import SpotifyWidget from "./SpotifyWidget";
import WeeklyRecap from "./WeeklyRecap";

const getWeekDates = () => {
  const curr = new Date();
  const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(curr.setDate(first + i));
    days.push(d.toLocaleDateString());
  }
  return days;
};

function DailyChest({ awardXP, triggerToast }) {
  const chestKey = "daily_chest_date";
  const todayStr = new Date().toDateString();
  const [opened, setOpened] = useState(localStorage.getItem(chestKey) === todayStr);
  const [animating, setAnimating] = useState(false);

  const openChest = async () => {
    if (opened) return;
    setAnimating(true);
    await new Promise(r => setTimeout(r, 600));
    const res = await awardXP("daily_chest");
    localStorage.setItem(chestKey, todayStr);
    setOpened(true);
    setAnimating(false);
    if (res && res.xpAwarded) {
      triggerToast(`🎁 Daily chest opened! +${res.xpAwarded} XP`);
    }
  };

  if (opened) return null;

  return (
    <div className="stationery-card anim-float-up" style={{ padding: "2rem", textAlign: "center", cursor: "pointer", background: "linear-gradient(135deg, rgba(249, 212, 35, 0.1), rgba(255, 142, 83, 0.1))", border: "1px solid rgba(249, 212, 35, 0.3)", marginBottom: "2rem" }} onClick={openChest}>
      <div style={{ fontSize: "4rem", animation: animating ? "chestShimmer 0.6s forwards" : "pulse 2s infinite" }}>
        {animating ? "✨" : "🎁"}
      </div>
      <h3 style={{ margin: "1rem 0 0", color: "#F9D423", fontSize: "1.2rem", fontWeight: "800" }}>Daily Reward Available</h3>
      <p style={{ margin: "0.5rem 0 0", color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: "600" }}>Tap to claim your XP</p>
    </div>
  );
}

export default function Dashboard() {
  const [state, setState] = useState({ wheelOfLife: null, goals: [], dailyLogs: [], vaultCapsules: [], lifeChapters: [] });
  const [showMusic, setShowMusic] = useState(false);
  const [doneAnim, setDoneAnim] = useState(false);
  const { progress, awardXP } = useGamification();
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: "" });

  const streak = progress ? progress.streak_days : 0;

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try { setState(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const dispatchSave = (newState) => {
    localStorage.setItem("growth_os_v1", JSON.stringify(newState));
    setState(newState);
    window.dispatchEvent(new Event("growth_os_save"));
  };

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 4000);
  };

  const hr = new Date().getHours();
  const timeConfig = hr >= 5 && hr < 12 
    ? { emoji: "🌅", greeting: "Good morning." }
    : hr >= 12 && hr < 17 
    ? { emoji: "☀️", greeting: "Good afternoon." }
    : hr >= 17 && hr < 21
    ? { emoji: "🌆", greeting: "Good evening." }
    : { emoji: "🌙", greeting: "Good night." };

  const todayStr = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const todayRaw = new Date().toLocaleDateString();

  // Snapshot Data
  const ratings = state.wheelOfLife?.ratings || {};
  const wheelCategories = Object.keys(ratings);
  const averageRating = wheelCategories.length ? (wheelCategories.reduce((sum, cat) => sum + (ratings[cat] || 0), 0) / wheelCategories.length).toFixed(1) : "—";
  const wheelPercent = averageRating !== "—" ? Math.round((parseFloat(averageRating) / 10) * 100) : 0;
  const wheelCirc = 125.6;

  const todayLog = (state.dailyLogs || []).find(l => l.date === todayRaw);
  const hasLoggedToday = !!todayLog;

  // Greeting Logic
  let finalGreeting = timeConfig.greeting;
  let recentSadCount = 0;
  const recentLogs = (state.dailyLogs || []).slice(0, 3);
  recentLogs.forEach(l => { if (l.mood === "sad" || l.mood === "angry") recentSadCount++; });
  
  if (recentSadCount >= 3) {
    finalGreeting = "Hey. Hope today's a little kinder to you. 💙";
  } else if (streak >= 7) {
    finalGreeting = `You've shown up ${streak} days in a row. Epic streak. 🔥`;
  } else if (streak === 0 && !hasLoggedToday) {
    finalGreeting = "Ready to start a new streak? Let's check in.";
  }

  // Pinned Goal & Task
  const pinnedGoal = state.goals?.find(g => g.pinned && !g.completed) || state.goals?.find(g => !g.completed);
  const pinnedTask = pinnedGoal?.subgoals?.find(s => !s.completed);

  const handleTaskAction = async (action) => {
    if (!pinnedGoal || !pinnedTask) return;
    
    if (action === "done") {
      setDoneAnim(true);
      await awardXP(`task_complete_${pinnedTask.id}`);
      
      setTimeout(() => {
        const newGoals = [...state.goals];
        const goalIndex = newGoals.findIndex(g => g.id === pinnedGoal.id);
        const taskIndex = newGoals[goalIndex].subgoals.findIndex(s => s.id === pinnedTask.id);
        newGoals[goalIndex].subgoals[taskIndex].completed = true;
        
        if (newGoals[goalIndex].subgoals.every(s => s.completed)) {
          newGoals[goalIndex].completed = true;
        }
        dispatchSave({ ...state, goals: newGoals });
        setDoneAnim(false);
      }, 800);
      return;
    }

    const newGoals = [...state.goals];
    const goalIndex = newGoals.findIndex(g => g.id === pinnedGoal.id);
    const taskIndex = newGoals[goalIndex].subgoals.findIndex(s => s.id === pinnedTask.id);
    
    if (action === "skip") {
      newGoals[goalIndex].subgoals[taskIndex].completed = true;
    } else if (action === "tomorrow") {
      const t = newGoals[goalIndex].subgoals.splice(taskIndex, 1)[0];
      newGoals[goalIndex].subgoals.push(t);
    }

    if (newGoals[goalIndex].subgoals.every(s => s.completed)) {
      newGoals[goalIndex].completed = true;
    }
    dispatchSave({ ...state, goals: newGoals });
  };

  const weekDates = getWeekDates();
  const weekLogs = weekDates.map(date => {
    const log = (state.dailyLogs || []).find(l => l.date === date);
    let emoji = "";
    if (log && log.mood) {
      if (log.mood === "happy") emoji = "😄";
      else if (log.mood === "content") emoji = "😊";
      else if (log.mood === "neutral") emoji = "😐";
      else if (log.mood === "sad") emoji = "😢";
      else if (log.mood === "angry") emoji = "😤";
    }
    return { date, emoji, log };
  });

  const todayIso = new Date().toISOString().split("T")[0];
  const upcomingCapsules = (state.vaultCapsules || []).filter(c => c.revealDate > todayIso).sort((a,b) => a.revealDate < b.revealDate ? -1 : 1);
  const nextCapsule = upcomingCapsules[0];
  const daysUntilCapsule = nextCapsule ? Math.ceil((new Date(nextCapsule.revealDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
  
  let lastVaultDate = null;
  if (state.vaultCapsules?.length) {
    const latest = state.vaultCapsules[state.vaultCapsules.length - 1];
    lastVaultDate = new Date(latest.createdAt);
  }
  const daysSinceLastVault = lastVaultDate ? Math.floor((new Date() - lastVaultDate) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)", maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem" }}>
      
      {/* Header Widget */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem", position: "relative" }}>
        <button 
          onClick={() => setShowMusic(!showMusic)}
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: "40px", height: "40px", display: "grid", placeContent: "center", cursor: "pointer", transition: "all 0.2s" }}
        >
          🎵
        </button>
        {showMusic && (
          <div className="anim-flip" style={{ position: "absolute", top: "50px", right: "0", zIndex: 100, background: "var(--bg-page)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "1rem", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <SpotifyWidget />
          </div>
        )}
      </div>

      <DailyChest awardXP={awardXP} triggerToast={triggerToast} />

      {/* Hero */}
      <div style={{ padding: "2rem 0", marginBottom: "2rem", position: "relative" }}>
        <div className="float-anim" style={{ position: "absolute", right: "10%", top: "20%", fontSize: "4rem", opacity: 0.2, pointerEvents: "none", filter: "blur(2px)" }} aria-hidden="true">{timeConfig.emoji}</div>
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans)", letterSpacing: "0.02em", marginBottom: "0.5rem" }}>
            {todayStr}
          </div>
          <h1 style={{ margin: "0", fontSize: "2.5rem", fontWeight: "800", letterSpacing: "-0.02em", fontFamily: "var(--font-serif)" }}>
            {finalGreeting}
          </h1>
        </div>
      </div>

      <WeeklyRecap />

      {/* The Centerpiece: Today's Focus */}
      <div className="stationery-card" style={{ padding: "2.5rem", marginBottom: "2.5rem", textAlign: "center" }}>
        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "800", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
          Today's Quest
        </div>
        
        {pinnedTask ? (
          <>
            <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)" }}>
              {pinnedTask.title}
            </h2>
            <p style={{ margin: "0 0 2rem 0", fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "600" }}>
              Part of: {pinnedGoal.title}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", position: "relative" }}>
              {doneAnim && (
                <div style={{ position: "absolute", top: "-30px", fontSize: "1.2rem", fontWeight: "bold", color: "#FFFFFF", animation: "floatUpAndFade 0.8s ease-out forwards" }}>
                  +10 XP
                </div>
              )}
              <button 
                onClick={() => handleTaskAction('done')} 
                className={doneAnim ? "btn-secondary" : "btn-primary"}
                style={{ padding: "0.8rem 2rem", fontSize: "1.1rem", position: "relative" }}
                disabled={doneAnim}
              >
                {doneAnim ? "✓" : "✓ Done"}
              </button>
              <button onClick={() => handleTaskAction('tomorrow')} className="btn-secondary" style={{ padding: "0.8rem 1.5rem", fontSize: "1.1rem" }}>
                ↷ Tomorrow
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.4rem", fontWeight: "600", color: "var(--text-secondary)" }}>
              No active quests right now.
            </h2>
            <Link to="/goals" className="btn-secondary" style={{ display: "inline-block", padding: "0.8rem 2rem" }}>
              View Map
            </Link>
          </>
        )}
      </div>

      {/* Circular Stats */}
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2.5rem" }}>
        {/* Wheel of life ring */}
        <Link to="/wheel" className="stationery-card" style={{ flex: 1, padding: "1.5rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "1.5rem", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform="translateY(-4px)"} onMouseOut={e => e.currentTarget.style.transform="none"}>
          <div style={{ position: "relative", width: "56px", height: "56px" }}>
            <svg width="56" height="56" className="progress-ring">
              <circle cx="28" cy="28" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
              <circle cx="28" cy="28" r="20" fill="none" stroke="#4FACFE" strokeWidth="6" strokeDasharray={`${(wheelPercent / 100) * wheelCirc} ${wheelCirc}`} strokeLinecap="round" className="progress-ring__circle" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeContent: "center", fontSize: "16px", fontWeight: "800", color: "#FFF" }}>
              {averageRating}
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase" }}>Balance</div>
            <div style={{ color: "#FFF", fontSize: "1.1rem", fontWeight: "800" }}>Wheel of Life</div>
          </div>
        </Link>

        <Link to="/log" className="stationery-card" style={{ flex: 1, padding: "1.5rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "1.5rem", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform="translateY(-4px)"} onMouseOut={e => e.currentTarget.style.transform="none"}>
          <div style={{ position: "relative", width: "56px", height: "56px" }}>
            <svg width="56" height="56" className="progress-ring">
              <circle cx="28" cy="28" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
              <circle cx="28" cy="28" r="20" fill="none" stroke={hasLoggedToday ? "#43E97B" : "rgba(255,255,255,0.1)"} strokeWidth="6" strokeDasharray={hasLoggedToday ? `${wheelCirc} ${wheelCirc}` : `0 ${wheelCirc}`} strokeLinecap="round" className="progress-ring__circle" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeContent: "center", fontSize: "20px" }}>
              {hasLoggedToday ? "✓" : "📋"}
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase" }}>Today</div>
            <div style={{ color: "#FFF", fontSize: "1.1rem", fontWeight: "800" }}>{hasLoggedToday ? "Logged" : "Not yet logged"}</div>
          </div>
        </Link>
      </div>

      <div className="stationery-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {weekLogs.map((day, i) => {
            const isToday = day.date === todayRaw;
            return (
              <div key={i} onClick={() => { if(day.log || isToday) navigate('/log') }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", cursor: (day.log || isToday) ? "pointer" : "default" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: "700", color: isToday ? "var(--text-primary)" : "var(--text-secondary)", opacity: isToday ? 1 : 0.6 }}>
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}
                </div>
                <div style={{ 
                  width: "44px", height: "44px", borderRadius: "16px", 
                  background: day.emoji ? "rgba(255,255,255,0.05)" : "transparent",
                  border: day.emoji ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.05)",
                  display: "grid", placeContent: "center", fontSize: "1.4rem",
                }}>
                  {day.emoji}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {daysUntilCapsule !== null && daysUntilCapsule <= 30 ? (
        <Link to="/vault" className="stationery-card" style={{ padding: "1.5rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "1rem", background: "rgba(167,139,250,0.05)", borderColor: "rgba(167,139,250,0.2)" }}>
          <span style={{ fontSize: "2rem" }}>💌</span>
          <p style={{ margin: 0, fontSize: "1rem", fontWeight: "600", color: "var(--text-primary)" }}>
            A letter from your past self unlocks in <span style={{ color: "var(--accent)", fontWeight: "800" }}>{daysUntilCapsule} days</span>.
          </p>
        </Link>
      ) : (
        <Link to="/vault" className="stationery-card" style={{ padding: "1.5rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "2rem" }}>💌</span>
          <p style={{ margin: 0, fontSize: "1rem", fontWeight: "600", color: "var(--text-secondary)" }}>
            It's been {daysSinceLastVault} days since your last letter. Write to your future self?
          </p>
        </Link>
      )}

      {toast.show && <div className="toast-notification">{toast.message}</div>}
      
    </div>
  );
}
