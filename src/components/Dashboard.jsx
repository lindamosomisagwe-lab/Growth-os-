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
    <div className="nb-card home" style={{ padding: "20px", textAlign: "center", cursor: "pointer", marginBottom: "1.5rem" }} onClick={openChest}>
      <div style={{ fontSize: "3rem", animation: animating ? "chestShimmer 0.6s forwards" : "pulse 2s infinite" }}>
        {animating ? "✨" : "🎁"}
      </div>
      <h3 className="card-title" style={{ margin: "10px 0 4px", fontSize: "16px", fontWeight: "700" }}>Daily Reward Available</h3>
      <p className="card-body" style={{ margin: 0, fontSize: "13px" }}>Tap to claim your daily XP stamp</p>
      <div className="card-annotation">expires tonight</div>
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const streak = progress ? progress.streak_days : 0;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    finalGreeting = "Hey. Hope today is a little kinder to you.";
  } else if (streak >= 7) {
    finalGreeting = `You have shown up ${streak} days in a row. Exceptional.`;
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
    let bgColor = "transparent";
    if (log && log.mood) {
      if (log.mood === "happy") { emoji = "😄"; bgColor = "rgba(201, 169, 110, 0.2)"; }
      else if (log.mood === "content") { emoji = "😊"; bgColor = "rgba(92, 122, 92, 0.2)"; }
      else if (log.mood === "neutral") { emoji = "😐"; bgColor = "rgba(26, 16, 8, 0.08)"; }
      else if (log.mood === "sad") { emoji = "😢"; bgColor = "rgba(92, 143, 168, 0.2)"; }
      else if (log.mood === "angry") { emoji = "😤"; bgColor = "rgba(139, 58, 42, 0.2)"; }
    }
    return { date, emoji, log, bgColor };
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
    <div style={{ color: "var(--ink-dark)", maxWidth: "850px", margin: "0 auto", paddingBottom: "4rem" }}>
      
      {/* Header Widget */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem", position: "relative" }}>
        <button 
          onClick={() => setShowMusic(!showMusic)}
          style={{ background: "var(--page-white)", border: "1px solid rgba(26,16,8,0.12)", borderRadius: "50%", width: "40px", height: "40px", display: "grid", placeContent: "center", cursor: "pointer", transition: "all 0.2s", boxShadow: "var(--shadow-card)" }}
        >
          🎵
        </button>
        {showMusic && (
          <div style={{ position: "absolute", top: "50px", right: "0", zIndex: 100, background: "var(--page-white)", border: "1px solid rgba(26,16,8,0.15)", borderRadius: "8px", padding: "1rem", boxShadow: "var(--shadow-raised)" }}>
            <SpotifyWidget />
          </div>
        )}
      </div>

      <DailyChest awardXP={awardXP} triggerToast={triggerToast} />

      {/* Hero Greeting */}
      <div style={{ padding: "1.5rem 0", marginBottom: "1rem" }}>
        <div className="page-date">{todayStr}</div>
        <h1 className="home-greeting">{finalGreeting}</h1>
        <div className="page-rule" />
      </div>

      <WeeklyRecap />

      {/* Home structured grid */}
      <div className="home-grid" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: "16px", padding: 0 }}>
        {/* Row 1: Today's Focus (Full-width / Left side) */}
        <div style={{ gridColumn: isMobile ? "span 1" : "span 2" }}>
          <div className="nb-card home" style={{ padding: "24px", minHeight: "180px" }}>
            <div className="card-eyebrow">⚔️ Today's Quest</div>
            {pinnedTask ? (
              <>
                <h2 className="card-title" style={{ fontSize: "22px", marginBottom: "6px" }}>
                  {pinnedTask.title}
                </h2>
                <p className="card-body" style={{ marginBottom: "18px", color: "var(--ink-light)" }}>
                  Part of: {pinnedGoal.title}
                </p>
                <div style={{ display: "flex", gap: "10px", position: "relative" }}>
                  {doneAnim && (
                    <div className="xp-float" style={{ top: "-30px", left: "20px" }}>
                      +10 XP
                    </div>
                  )}
                  <button 
                    onClick={() => handleTaskAction('done')} 
                    className="btn-gold"
                    style={{ border: "none", outline: "none" }}
                    disabled={doneAnim}
                  >
                    {doneAnim ? "✓ Stamped" : "✓ Done"}
                  </button>
                  <button onClick={() => handleTaskAction('tomorrow')} className="btn-secondary">
                    ↷ Tomorrow
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="card-body" style={{ fontSize: "15px", fontStyle: "italic", marginBottom: "12px", color: "var(--ink-light)" }}>
                  No active quests right now. Write one down on your goals map.
                </h2>
                <Link to="/goals" className="btn-secondary" style={{ display: "inline-block", textDecoration: "none" }}>
                  View Goals Map →
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Row 2: Life Balance Card & Daily Reward Side by Side (or stacked on mobile) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Link to="/wheel" className="nb-card balance" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
            <div style={{ position: "relative", width: "50px", height: "50px", flexShrink: 0 }}>
              <svg width="50" height="50" className="progress-ring">
                <circle cx="25" cy="25" r="20" fill="none" stroke="var(--ink-faint)" strokeWidth="4" />
                <circle cx="25" cy="25" r="20" fill="none" stroke="var(--accent-steel)" strokeWidth="4" strokeDasharray={`${(wheelPercent / 100) * 125.6} 125.6`} strokeLinecap="round" className="progress-ring__circle" />
              </svg>
              <div className="card-title" style={{ position: "absolute", inset: 0, display: "grid", placeContent: "center", fontSize: "14px", fontWeight: "800", margin: 0 }}>
                {averageRating}
              </div>
            </div>
            <div>
              <div className="card-eyebrow" style={{ margin: 0 }}>Balance</div>
              <div className="card-title" style={{ fontSize: "15px", margin: 0 }}>Wheel of Life</div>
            </div>
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Link to="/log" className="nb-card today" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
            <div style={{ position: "relative", width: "50px", height: "50px", flexShrink: 0 }}>
              <svg width="50" height="50" className="progress-ring">
                <circle cx="25" cy="25" r="20" fill="none" stroke="var(--ink-faint)" strokeWidth="4" />
                <circle cx="25" cy="25" r="20" fill="none" stroke={hasLoggedToday ? "var(--accent-sage)" : "var(--ink-faint)"} strokeWidth="4" strokeDasharray={hasLoggedToday ? "125.6 125.6" : "0 125.6"} strokeLinecap="round" className="progress-ring__circle" />
              </svg>
              <div className="card-title" style={{ position: "absolute", inset: 0, display: "grid", placeContent: "center", fontSize: "15px", margin: 0 }}>
                {hasLoggedToday ? "✓" : "📋"}
              </div>
            </div>
            <div>
              <div className="card-eyebrow" style={{ margin: 0 }}>Today</div>
              <div className="card-title" style={{ fontSize: "15px", margin: 0 }}>{hasLoggedToday ? "Logged" : "Not yet logged"}</div>
            </div>
          </Link>
        </div>

        {/* Row 3: Weekly mood strip (ruled style) */}
        <div style={{ gridColumn: isMobile ? "span 1" : "span 2" }}>
          <div className="nb-card today" style={{ padding: "20px" }}>
            <div className="card-eyebrow">📅 Weekly mood strip</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
              {weekLogs.map((day, i) => {
                const isToday = day.date === todayRaw;
                return (
                  <div key={i} onClick={() => { if(day.log || isToday) navigate('/log') }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: (day.log || isToday) ? "pointer" : "default" }}>
                    <div style={{ fontSize: "11px", fontWeight: isToday ? "700" : "500", color: isToday ? "var(--ink-dark)" : "var(--ink-light)" }}>
                      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}
                    </div>
                    <div style={{ 
                      width: "32px", height: "32px", borderRadius: "50%", 
                      background: day.emoji ? "var(--page-cream)" : "transparent",
                      border: day.emoji ? "1.5px solid var(--accent-sage)" : "1.5px solid var(--ink-faint)",
                      display: "grid", placeContent: "center", fontSize: "16px",
                    }}>
                      {day.emoji ? day.emoji : "•"}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Row 4: Vault nudge */}
        <div style={{ gridColumn: isMobile ? "span 1" : "span 2" }}>
          {daysUntilCapsule !== null && daysUntilCapsule <= 30 ? (
            <Link to="/vault" className="nb-card vault" style={{ padding: "16px", textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "24px" }}>💌</span>
              <p className="card-body" style={{ margin: 0 }}>
                A letter from your past self unlocks in <strong style={{ color: "var(--accent-plum)" }}>{daysUntilCapsule} days</strong>.
              </p>
            </Link>
          ) : (
            <Link to="/vault" className="nb-card vault" style={{ padding: "16px", textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "24px" }}>💌</span>
              <p className="card-body" style={{ margin: 0, fontStyle: "normal" }}>
                It's been {daysSinceLastVault} days since your last letter. Write to your future self?
              </p>
            </Link>
          )}
        </div>
      </div>
      {toast.show && <div className="toast-notification">{toast.message}</div>}
    </div>
  );
}
