import { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import WelcomeScreen from './WelcomeScreen';
import Dashboard from './Dashboard';
import { auth } from './firebase-config';
import { onAuthStateChanged } from 'firebase/auth';

const App = () => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Entrance animation duration: 2s (matches splash auto-advance)
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // If user is logged in, show the dashboard immediately
  if (authChecked && user) {
    return <Dashboard user={user} />;
  }

  return (
    <div className="app-container" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow for the Auth screen (top right) */}
      {!isAnimating && (
        <div style={{
          position: 'absolute',
          top: '-10%', right: '-5%',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,92,252,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />
      )}

      {isAnimating ? (
        <WelcomeScreen skipAnimation={() => setIsAnimating(false)} />
      ) : (
        <div className="auth-container" style={{
          animation: 'fadeIn 0.5s ease-in-out',
          width: '100%',
          maxWidth: '400px',
          padding: '0 20px',
          position: 'relative',
          zIndex: 1
        }}>
          <LoginForm />
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
