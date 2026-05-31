import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProgress, awardXP, processDailyStreak, CHAPTERS, FEATURE_GATES } from '../services/xpService';

const GamificationContext = createContext();

export const useGamification = () => useContext(GamificationContext);

export const useFeatureUnlock = (featureName) => {
  const { progress } = useGamification();
  const requiredChapter = FEATURE_GATES[featureName] || 1;
  const currentChapter = progress?.current_chapter || 1;
  
  return { 
    unlocked: currentChapter >= requiredChapter,
    requiredChapter,
    chapterTitle: CHAPTERS.find(c => c.level === requiredChapter)?.title || ""
  };
};

export const GamificationProvider = ({ children }) => {
  const [progress, setProgress] = useState(null);
  
  useEffect(() => {
    const init = async () => {
      const userId = "local_user";
      await processDailyStreak(userId);
      setProgress(getUserProgress());
    };
    init();

    const handleUpdate = () => {
      setProgress(getUserProgress());
    };

    window.addEventListener("xp_db_updated", handleUpdate);
    return () => window.removeEventListener("xp_db_updated", handleUpdate);
  }, []);

  const triggerAwardXP = async (eventType) => {
    const res = await awardXP("local_user", eventType);
    if (res && res.xpAwarded > 0) {
      window.dispatchEvent(new CustomEvent("xp_awarded_event", { detail: res }));
    }
    return res;
  };

  return (
    <GamificationContext.Provider value={{ progress, awardXP: triggerAwardXP }}>
      {children}
    </GamificationContext.Provider>
  );
};
