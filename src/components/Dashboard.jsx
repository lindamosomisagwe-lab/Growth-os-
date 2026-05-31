import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGamification } from "../contexts/GamificationContext";
import SpotifyWidget from "./SpotifyWidget";
import WeeklyRecap from "./WeeklyRecap";

// Helper to get dates for the current week (Mon-Sun)
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

export default function Dashboard() {
  const [state, setState] = useState({ wheelOfLife: null, goals: [], dailyLogs: [], vaultCapsules: [], lifeChapters: [] });
  const [showMusic, setShowMusic] = useState(false);
  const [doneAnim, setDoneAnim] = useState(false);
  const { streak, progress, awardXP } = useGamification();
  const navigate = useNavigate();

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
    finalGreeting = `You've shown up ${streak} days in a row. That's not nothing. 🔥`;
  } else if (streak === 0 && !hasLoggedToday) {
    finalGreeting = "Ready to check in? It only takes a minute.";
  }

  // Pinned Goal & Task
  const pinnedGoal = state.goals?.find(g => g.pinned && !g.completed) || state.goals?.find(g => !g.completed);
  const pinnedTask = pinnedGoal?.subgoals?.find(s => !s.completed);

  const handleTaskAction = async (action) => {
    if (!pinnedGoal || !pinnedTask) return;
    
    if (action === "done") {
      setDoneAnim(true);
      await awardXP(`task_complete_${pinnedTask.id}`);
      
      // Delay to let animation play
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

  // Weekly Mood Strip
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

  // Vault Teaser
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
          <div style={{ position: "absolute", top: "50px", right: "0", zIndex: 100, background: "var(--bg-page)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "1rem", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <SpotifyWidget />
          </div>
        )}
      </div>

      {/* Hero */}
      <div style={{
        padding: "2rem 0", marginBottom: "2rem",
        position: "relative",
      }}>
        {/* Floating Emojis */}
        <div className="float-anim" style={{ position: "absolute", right: "10%", top: "20%", fontSize: "4rem", opacity: 0.2, pointerEvents: "none", filter: "blur(2px)" }} aria-hidden="true">{timeConfig.emoji}</div>
        <div className="float-anim" style={{ position: "absolute", right: "30%", top: "60%", fontSize: "2rem", opacity: 0.1, pointerEvents: "none", animationDelay: "1.5s" }} aria-hidden="true">{timeConfig.emoji}</div>
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans)", letterSpacing: "0.02em", marginBottom: "0.5rem" }}>
            {todayStr}
          </div>
          <h1 style={{ margin: "0", fontSize: "2.5rem", fontWeight: "400", letterSpacing: "-0.02em", fontStyle: "normal" }}>
            {finalGreeting}
          </h1>
        </div>
      </div>

      <WeeklyRecap />

      {/* The Centerpiece: Today's Focus */}
      <div className="stationery-card" style={{ padding: "2.5rem", marginBottom: "2.5rem", textAlign: "center" }}>
        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
          Today's focus
        </div>
        
        {pinnedTask ? (
          <>
            <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.8rem", fontWeight: "600", color: "var(--text-primary)" }}>
              {pinnedTask.title}
            </h2>
            <p style={{ margin: "0 0 2rem 0", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
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
                style={{ padding: "0.8rem 2rem", fontSize: "0.95rem", position: "relative" }}
                disabled={doneAnim}
              >
                {doneAnim ? "✓" : "✓ Done"}
                {!doneAnim && (
                  <span style={{ position: "absolute", top: "-8px", right: "-8px", background: "#A78BFA", color: "#FFF", fontSize: "0.6rem", padding: "2px 6px", borderRadius: "10px", fontWeight: "700" }}>
                    +10 XP
                  </span>
                )}
              </button>
              <button onClick={() => handleTaskAction('tomorrow')} className="btn-secondary" style={{ padding: "0.8rem 1.5rem", fontSize: "0.95rem" }}>
                ↷ Tomorrow
              </button>
              <button onClick={() => handleTaskAction('skip')} className="btn-secondary" style={{ padding: "0.8rem 1.5rem", fontSize: "0.95rem", opacity: 0.7, border: "none" }}>
                Skip
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.4rem", fontWeight: "400", color: "var(--text-secondary)" }}>
              Your plate is clear.
            </h2>
            <Link to="/goals" className="btn-secondary" style={{ display: "inline-block", padding: "0.8rem 2rem" }}>
              Set a goal
            </Link>
          </>
        )}
      </div>

      {/* Compact Stat Chips */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
        <Link to="/wheel" className="stationery-card" style={{ flex: 1, minWidth: "140px", padding: "1.25rem", textDecoration: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem" }}>⚖️</span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Life balance</span>
          <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>{averageRating}/10</span>
        </Link>
        <div className="stationery-card" style={{ flex: 1, minWidth: "140px", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem" }}>🔥</span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Your streak</span>
          <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>
            {streak} days {progress?.streak_shield_available && <span style={{ fontSize: "0.8rem" }}>🛡️</span>}
          </span>
        </div>
        <Link to="/log" className="stationery-card" style={{ flex: 1, minWidth: "140px", padding: "1.25rem", textDecoration: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem" }}>📋</span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Today</span>
          <span style={{ fontSize: "1.1rem", fontWeight: "700", color: hasLoggedToday ? "var(--accent)" : "var(--text-primary)" }}>
            {hasLoggedToday ? "Logged" : "Not yet"}
          </span>
        </Link>
      </div>

      {/* Weekly Mood Strip */}
      <div className="stationery-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {weekLogs.map((day, i) => {
            const isToday = day.date === todayRaw;
            return (
              <div key={i} onClick={() => { if(day.log || isToday) navigate('/log') }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", cursor: (day.log || isToday) ? "pointer" : "default" }}>
                <div style={{ fontSize: "0.75rem", color: isToday ? "var(--text-primary)" : "var(--text-secondary)", opacity: isToday ? 1 : 0.6 }}>
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}
                </div>
                <div style={{ 
                  width: "40px", height: "40px", borderRadius: "50%", 
                  background: day.emoji ? "rgba(255,255,255,0.05)" : "transparent",
                  border: day.emoji ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.05)",
                  display: "grid", placeContent: "center", fontSize: "1.2rem",
                }}>
                  {day.emoji}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Vault Nudge */}
      {daysUntilCapsule !== null && daysUntilCapsule <= 30 ? (
        <Link to="/vault" className="stationery-card" style={{ padding: "1.5rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "1rem", background: "rgba(167,139,250,0.05)", borderColor: "rgba(167,139,250,0.2)" }}>
          <span style={{ fontSize: "1.5rem" }}>💌</span>
          <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-primary)" }}>
            A letter from your past self unlocks in <span style={{ color: "var(--accent)", fontWeight: "600" }}>{daysUntilCapsule} days</span>.
          </p>
        </Link>
      ) : (
        <Link to="/vault" className="stationery-card" style={{ padding: "1.5rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "1.5rem" }}>💌</span>
          <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-secondary)" }}>
            It's been {daysSinceLastVault} days since your last letter. Write to your future self?
          </p>
        </Link>
      )}
      
    </div>
  );
}
