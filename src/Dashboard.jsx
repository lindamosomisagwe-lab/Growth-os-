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

export default function Dashboard({ user }) {
  const [activePage, setActivePage] = useState('home');

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
