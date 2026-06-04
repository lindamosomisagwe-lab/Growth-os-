import { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import WelcomeScreen from './WelcomeScreen';
import Dashboard from './Dashboard'; // Assuming you have a Dashboard component
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
    // Entrance animation duration: 2.5 seconds
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // If user is logged in, bypass the welcome screen and login form
  if (authChecked && user && !isAnimating) {
    return <Dashboard user={user} />;
  }

  return (
    <div className="app-container" style={{ 
      backgroundColor: '#1a1033', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: '#F5F0E8',
      fontFamily: 'Inter, sans-serif'
    }}>
      {isAnimating ? (
        <WelcomeScreen />
      ) : (
        <div className="auth-container" style={{
          animation: 'fadeIn 0.5s ease-in-out',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Welcome to Growth OS</h2>
          <p style={{ color: 'rgba(245,240,232,0.55)', marginBottom: '30px' }}>
            Create an account to activate your system.
          </p>
          <LoginForm />
        </div>
      )}
    </div>
  );
};

export default App;
