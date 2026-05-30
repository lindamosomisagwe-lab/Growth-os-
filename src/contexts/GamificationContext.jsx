import React, { createContext, useContext, useState, useEffect } from 'react';

const GamificationContext = createContext();

export const useGamification = () => useContext(GamificationContext);

export const GamificationProvider = ({ children }) => {
  const [gp, setGp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastActionDate, setLastActionDate] = useState(null);
  const [badges, setBadges] = useState([]);
  const [dailyActions, setDailyActions] = useState(0);
  const [dailyActionDate, setDailyActionDate] = useState(null);
  const [streakShields, setStreakShields] = useState(0);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('growth_os_gamification');
      if (saved) {
        const parsed = JSON.parse(saved);
        setGp(parsed.gp || 0);
        setStreak(parsed.streak || 0);
        setLastActionDate(parsed.lastActionDate || null);
        setBadges(parsed.badges || []);
        
        // Check if daily actions belong to today
        const today = new Date().toISOString().split('T')[0];
        if (parsed.dailyActionDate === today) {
          setDailyActions(parsed.dailyActions || 0);
          setDailyActionDate(parsed.dailyActionDate);
        } else {
          setDailyActions(0);
          setDailyActionDate(today);
        }
        
        setStreakShields(parsed.streakShields || 0);
        
        // Background check: did we miss a day?
        if (parsed.lastActionDate) {
          const lastDate = new Date(parsed.lastActionDate);
          const current = new Date(today);
          const diffTime = Math.abs(current - lastDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays > 1) {
            // Missed at least one day
            let shieldsToUse = parsed.streakShields || 0;
            let currentStreak = parsed.streak || 0;
            
            // If they missed multiple days, they'd need multiple shields
            if (shieldsToUse >= (diffDays - 1)) {
              setStreakShields(shieldsToUse - (diffDays - 1));
              // Streak maintained!
            } else {
              setStreak(0);
              setStreakShields(0);
            }
          }
        }
      }
    } catch (e) {
      console.error("Could not load gamification state", e);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state = { gp, streak, lastActionDate, badges, dailyActions, dailyActionDate, streakShields };
    localStorage.setItem('growth_os_gamification', JSON.stringify(state));
  }, [gp, streak, lastActionDate, badges, dailyActions, dailyActionDate, streakShields]);

  const addGp = (amount, source) => {
    // 20% chance of 2x bonus
    const isBonus = Math.random() < 0.2;
    const finalAmount = isBonus ? amount * 2 : amount;
    
    setGp(prev => prev + finalAmount);
    
    // Check and update streak
    const today = new Date().toISOString().split('T')[0];
    if (lastActionDate !== today) {
      const lastDate = lastActionDate ? new Date(lastActionDate) : null;
      const current = new Date(today);
      const diffDays = lastDate ? Math.ceil(Math.abs(current - lastDate) / (1000 * 60 * 60 * 24)) : 0;
      
      if (diffDays === 1 || !lastDate) {
        // Normal streak increment
        setStreak(prev => {
          const newStreak = prev + 1;
          if (newStreak > 0 && newStreak % 7 === 0) {
            setStreakShields(s => s + 1);
            window.dispatchEvent(new CustomEvent('gp_awarded', { 
              detail: { amount: 0, isBonus: false, source: 'shield_earned', message: "🛡️ Streak Shield Earned!" }
            }));
          }
          return newStreak;
        });
      } else if (diffDays > 1) {
        // Missed days handled by mount effect, but if we somehow missed and acted the same session
        setStreak(1);
        setStreakShields(0);
      }
      setLastActionDate(today);
    }
    
    // Update daily actions
    if (dailyActionDate === today) {
       setDailyActions(prev => prev + 1);
    } else {
       setDailyActions(1);
       setDailyActionDate(today);
    }

    // Trigger visual toast event
    window.dispatchEvent(new CustomEvent('gp_awarded', { 
      detail: { amount: finalAmount, isBonus, source }
    }));
  };

  const getRank = () => {
    if (gp >= 4000) return { name: 'Thrive', emoji: '🌟' };
    if (gp >= 1500) return { name: 'Flourish', emoji: '🌺' };
    if (gp >= 600) return { name: 'Bloom', emoji: '🌸' };
    if (gp >= 200) return { name: 'Sprout', emoji: '🌿' };
    return { name: 'Seed', emoji: '🌱' };
  };

  return (
    <GamificationContext.Provider value={{ gp, addGp, streak, getRank, dailyActions, streakShields }}>
      {children}
    </GamificationContext.Provider>
  );
};
