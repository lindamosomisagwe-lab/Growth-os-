import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Views for the React Refactor
import HomeView from './components/HomeView';
import BalanceView from './components/BalanceView';
import GoalsView from './components/GoalsView';
import TodayView from './components/TodayView';
import VaultView from './components/VaultView';
import ProfileView from './components/ProfileView';

const PAGE_COLORS = {
  home:    { accent: '#7C5CFC', grad: 'linear-gradient(135deg,#7C5CFC,#5B3FD4)', bg: 'linear-gradient(160deg,#1a0533 0%,#2d0f55 40%,#09080F 100%)' },
  balance: { accent: '#4FACFE', grad: 'linear-gradient(135deg,#4FACFE,#00C6FF)', bg: 'linear-gradient(160deg,#0c2a4a 0%,#0f3d6e 40%,#09080F 100%)' },
  goals:   { accent: '#F05A7E', grad: 'linear-gradient(135deg,#F05A7E,#E83B6A)', bg: 'linear-gradient(160deg,#2d0a1e 0%,#5c1035 40%,#09080F 100%)' },
  today:   { accent: '#43E97B', grad: 'linear-gradient(135deg,#43E97B,#38F9D7)', bg: 'linear-gradient(160deg,#052e16 0%,#0a4a26 40%,#09080F 100%)' },
  vault:   { accent: '#A78BFA', grad: 'linear-gradient(135deg,#A78BFA,#8B5CF6)', bg: 'linear-gradient(160deg,#1a0c2e 0%,#2e1555 40%,#09080F 100%)' },
  profile: { accent: '#F5A623', grad: 'linear-gradient(135deg,#F5A623,#F76B1C)', bg: 'linear-gradient(160deg,#3d2a0d 0%,#5a310c 40%,#09080F 100%)' },
  settings:{ accent: '#A0AEC0', grad: 'linear-gradient(135deg,#A0AEC0,#718096)', bg: 'linear-gradient(160deg,#1a202c 0%,#2d3748 40%,#09080F 100%)' }
};

export default function Dashboard({ user }) {
  const [activePage, setActivePage] = useState('home');
  const [prevPage, setPrevPage] = useState('home');
  const [bgNext, setBgNext] = useState('transparent');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Crossfade background logic
  useEffect(() => {
    if (activePage === prevPage) return;
    
    const colorConfig = PAGE_COLORS[activePage] || PAGE_COLORS.home;
    const root = document.documentElement;
    root.style.setProperty('--color-accent', colorConfig.accent);
    root.style.setProperty('--grad-accent', colorConfig.grad);
    root.style.setProperty('--bg-page', colorConfig.bg);

    setBgNext(colorConfig.bg);
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setIsTransitioning(false);
      setPrevPage(activePage);
    }, 700);

    return () => clearTimeout(timer);
  }, [activePage, prevPage]);

  // Page switcher
  const renderPage = () => {
    switch (activePage) {
      case 'home':    return <HomeView />;
      case 'balance': return <BalanceView />;
      case 'goals':   return <GoalsView />;
      case 'today':   return <TodayView />;
      case 'vault':   return <VaultView />;
      case 'profile': return <ProfileView user={user} />;
      case 'settings': return <div style={{ color: 'white', padding: '40px' }}>Settings Modal (TODO)</div>;
      default:        return <HomeView />;
    }
  };

  return (
    <div 
      className={`app-shell ${isTransitioning ? 'transitioning' : ''}`}
      style={{ 
        background: PAGE_COLORS[prevPage]?.bg || PAGE_COLORS.home.bg,
        '--bg-next': bgNext 
      }}
    >
      <Sidebar activePage={activePage} setActivePage={setActivePage} user={user} />
      
      <main className="main-scroll" style={{ position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%' }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
