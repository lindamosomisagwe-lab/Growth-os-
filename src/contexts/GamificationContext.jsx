import React, { createContext, useContext, useState, useEffect } from 'react';

const GamificationContext = createContext();

export const useGamification = () => useContext(GamificationContext);

export const GamificationProvider = ({ children }) => {
  const [streak, setStreak] = useState(0);

  const calculateStreak = () => {
    try {
      const saved = localStorage.getItem('growth_os_v1');
      if (!saved) return 0;
      
      const parsed = JSON.parse(saved);
      const logs = parsed.dailyLogs || [];
      
      if (logs.length === 0) return 0;

      // Extract unique dates from logs and sort descending
      const uniqueDates = [...new Set(logs.map(l => l.date))]
        .map(d => new Date(d))
        .sort((a, b) => b - a);

      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (uniqueDates.length === 0) return 0;

      // Check if today or yesterday is the first date
      let checkDate = new Date(uniqueDates[0]);
      checkDate.setHours(0, 0, 0, 0);

      if (checkDate.getTime() === today.getTime() || checkDate.getTime() === yesterday.getTime()) {
        currentStreak = 1;
        
        // Count backwards
        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDate = new Date(uniqueDates[i]);
          prevDate.setHours(0, 0, 0, 0);
          
          const expectedDate = new Date(checkDate);
          expectedDate.setDate(expectedDate.getDate() - 1);
          
          if (prevDate.getTime() === expectedDate.getTime()) {
            currentStreak++;
            checkDate = prevDate;
          } else {
            break;
          }
        }
      }

      return currentStreak;
    } catch (e) {
      console.error(e);
      return 0;
    }
  };

  useEffect(() => {
    setStreak(calculateStreak());

    const handleSave = () => {
      setStreak(calculateStreak());
    };

    window.addEventListener("growth_os_save", handleSave);
    return () => window.removeEventListener("growth_os_save", handleSave);
  }, []);

  return (
    <GamificationContext.Provider value={{ streak }}>
      {children}
    </GamificationContext.Provider>
  );
};
