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
import SettingsView from './components/SettingsView';

const PAGE_COLORS = {
  home:    { accent: '#7C5CFC', grad: 'linear-gradient(135deg,#7C5CFC,#5B3FD4)' },
  balance: { accent: '#4FACFE', grad: 'linear-gradient(135deg,#4FACFE,#00C6FF)' },
  goals:   { accent: '#F05A7E', grad: 'linear-gradient(135deg,#F05A7E,#E83B6A)' },
  today:   { accent: '#43E97B', grad: 'linear-gradient(135deg,#43E97B,#38F9D7)' },
  vault:   { accent: '#A78BFA', grad: 'linear-gradient(135deg,#A78BFA,#8B5CF6)' },
  profile: { accent: '#F5A623', grad: 'linear-gradient(135deg,#F5A623,#F76B1C)' },
  settings:{ accent: '#A0AEC0', grad: 'linear-gradient(135deg,#A0AEC0,#718096)' }
};

export default function Dashboard({ user }) {
  const [activePage, setActivePage] = useState('home');

  // Update accent colors when page changes
  useEffect(() => {
    const colorConfig = PAGE_COLORS[activePage] || PAGE_COLORS.home;
    const root = document.documentElement;
    root.style.setProperty('--color-accent', colorConfig.accent);
    root.style.setProperty('--grad-accent', colorConfig.grad);
  }, [activePage]);

  // Page switcher
  const renderPage = () => {
    switch (activePage) {
      case 'home':    return <HomeView />;
      case 'balance': return <BalanceView />;
      case 'goals':   return <GoalsView />;
      case 'today':   return <TodayView />;
      case 'vault':   return <VaultView />;
      case 'profile': return <ProfileView user={user} />;
      case 'settings': return <SettingsView user={user} />;
      default:        return <HomeView />;
    }
  };

  return (
    <div 
      className="app-shell"
      style={{ background: '#0d0d14' }}
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
