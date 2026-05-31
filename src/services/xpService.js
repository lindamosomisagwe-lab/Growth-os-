export const XP_VALUES = {
  task_complete: 10,
  step_complete: 50,
  goal_complete: 200,
  daily_checkin: 15,
  streak_7: 75,
  streak_30: 200,
  streak_100: 500,
  update_life_balance: 25,
  seal_letter: 30,
  log_chapter: 40,
  onboarding_complete: 50
};

export const CHAPTERS = [
  { level: 1, title: "The Beginning", emoji: "🌱", xp_required: 0 },
  { level: 2, title: "Finding Your Footing", emoji: "🌿", xp_required: 200 },
  { level: 3, title: "Building Momentum", emoji: "🌸", xp_required: 600 },
  { level: 4, title: "In Your Stride", emoji: "🌺", xp_required: 1400 },
  { level: 5, title: "Unstoppable", emoji: "🔥", xp_required: 3000 },
  { level: 6, title: "The Architect", emoji: "⭐", xp_required: 6000 }
];

export const FEATURE_GATES = {
  streak_tracking: 1,
  weekly_summary: 2,
  life_balance_history: 2,
  ai_goal_builder: 3,
  mood_trends_chart: 3,
  radar_compare: 3,
  custom_life_dimensions: 4,
  goal_analytics: 4,
  vault_themes: 5,
  archive_export: 5,
  shareable_profile: 3
};

// Mock Backend Database (until real Supabase is connected)
const getDB = () => {
  const data = localStorage.getItem("growth_os_xp_db");
  if (data) return JSON.parse(data);
  return {
    user_progress: {
      total_xp: 0,
      current_chapter: 1,
      streak_days: 0,
      last_active_date: null,
      goals_completed: 0,
      tasks_completed: 0,
      streak_shield_available: false,
      created_at: new Date().toISOString()
    },
    xp_events: []
  };
};

const saveDB = (db) => localStorage.setItem("growth_os_xp_db", JSON.stringify(db));

/**
 * Server-side / Edge Function mock
 */
export async function awardXP(userId, eventId) {
  // Extract base event type for checking XP values
  // e.g., "task_complete_123" -> "task_complete"
  let baseEventType = eventId;
  Object.keys(XP_VALUES).forEach(k => {
    if (eventId.startsWith(k)) baseEventType = k;
  });

  const baseXP = XP_VALUES[baseEventType] || 0;
  if (baseXP === 0) return { xpAwarded: 0, isBonus: false, leveledUp: false, newChapter: null };

  const db = getDB();
  const today = new Date().toISOString().split("T")[0];

  // Idempotency check: Don't award for the same exact eventId on the same day
  const alreadyAwarded = db.xp_events.some(
    e => e.event_type === eventId && e.created_at.startsWith(today)
  );

  if (alreadyAwarded) {
    return { xpAwarded: 0, isBonus: false, leveledUp: false, newChapter: null };
  }

  const isBonus = Math.random() < 0.2;
  const xpAwarded = isBonus ? baseXP * 2 : baseXP;

  // 1. Insert xp_event record
  db.xp_events.push({
    id: Date.now().toString(),
    user_id: userId,
    event_type: eventId,
    xp_awarded: xpAwarded,
    bonus_applied: isBonus,
    created_at: new Date().toISOString()
  });

  // 2. Increment user_progress.total_xp
  const oldXp = db.user_progress.total_xp;
  const newXp = oldXp + xpAwarded;
  db.user_progress.total_xp = newXp;

  // Track extra stats
  if (baseEventType === "goal_complete") db.user_progress.goals_completed++;
  if (baseEventType === "task_complete") db.user_progress.tasks_completed++;

  // 3. Check if new total crosses a chapter threshold
  const currentChapter = db.user_progress.current_chapter;
  let newChapter = currentChapter;
  let leveledUp = false;

  for (let i = CHAPTERS.length - 1; i >= 0; i--) {
    if (newXp >= CHAPTERS[i].xp_required) {
      if (CHAPTERS[i].level > currentChapter) {
        newChapter = CHAPTERS[i].level;
        leveledUp = true;
      }
      break;
    }
  }

  if (leveledUp) {
    db.user_progress.current_chapter = newChapter;
  }

  saveDB(db);

  // Dispatch a global event so the UI contexts can sync with the mock DB immediately
  window.dispatchEvent(new Event("xp_db_updated"));

  return { 
    xpAwarded, 
    isBonus, 
    leveledUp, 
    newChapter: leveledUp ? CHAPTERS.find(c => c.level === newChapter) : null,
    totalXp: newXp
  };
}

export function getUserProgress() {
  return getDB().user_progress;
}

export function getXPEvents() {
  return getDB().xp_events;
}

// Special function to manage streak since it needs daily check rules and shields
export async function processDailyStreak(userId) {
  const db = getDB();
  const today = new Date().toISOString().split("T")[0];
  const lastActive = db.user_progress.last_active_date;
  
  let milestoneHit = null;

  if (lastActive !== today) {
    if (lastActive) {
      const lastDate = new Date(lastActive);
      const current = new Date(today);
      const diffDays = Math.ceil(Math.abs(current - lastDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        db.user_progress.streak_days += 1;
      } else if (diffDays > 1) {
        if (db.user_progress.streak_shield_available) {
          db.user_progress.streak_shield_available = false; // consumed
          db.user_progress.streak_days += 1; // rescued!
        } else {
          db.user_progress.streak_days = 1; // reset
        }
      }
    } else {
      db.user_progress.streak_days = 1;
    }

    db.user_progress.last_active_date = today;

    const currentStreak = db.user_progress.streak_days;
    
    if (currentStreak === 7) milestoneHit = 7;
    if (currentStreak === 30) milestoneHit = 30;
    if (currentStreak === 100) milestoneHit = 100;

    if (currentStreak > 0 && currentStreak % 7 === 0) {
      db.user_progress.streak_shield_available = true;
    }

    saveDB(db);
    window.dispatchEvent(new Event("xp_db_updated"));
  }

  return { currentStreak: db.user_progress.streak_days, milestoneHit };
}
