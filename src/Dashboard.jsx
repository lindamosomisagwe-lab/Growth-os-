import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Views for the React Refactor
import HomeView from './components/HomeView';
import BalanceView from './components/BalanceView';
import GoalsView from './components/GoalsView';
import DailyLog from './components/DailyLog';
import VaultView from './components/VaultView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';

export default function Dashboard({ user }) {
  const [activePage, setActivePage] = useState('home');

  // Page switcher
  const renderPage = () => {
    switch (activePage) {
      case 'home':    return <HomeView user={user} setActivePage={setActivePage} />;
      case 'balance': return <BalanceView />;
      case 'goals':   return <GoalsView user={user} />;
      case 'today':   return <DailyLog user={user} />;
      case 'vault':   return <VaultView user={user} />;
      case 'profile': return <ProfileView user={user} />;
      case 'settings': return <SettingsView user={user} />;
      default:        return <HomeView user={user} />;
    }
  };

  return (
    <div 
      className="app-shell"
      style={{ background: 'var(--bg-app)' }}
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
