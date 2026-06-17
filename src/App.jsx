import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Agentation } from 'agentation';
import Dashboard from './Dashboard';
import OnboardingFlow from './components/OnboardingFlow';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import { auth, db } from './firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const ProtectedRoute = ({ user, authChecked, loadingData, onboardingComplete, children }) => {
  if (!authChecked || loadingData) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  if (!onboardingComplete) return <Navigate to="/onboarding" />;
  return children;
};

const PublicOnlyRoute = ({ user, authChecked, loadingData, onboardingComplete, children }) => {
  if (!authChecked || loadingData) return <LoadingScreen />;
  if (user && onboardingComplete) return <Navigate to="/home" />;
  if (user && !onboardingComplete) return <Navigate to="/onboarding" />;
  return children;
};

const LoadingScreen = () => (
  <div style={{ background: 'var(--bg-app)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</div>
  </div>
);

const App = () => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(docRef);
          if (snap.exists() && snap.data().onboardingComplete === true) {
            setOnboardingComplete(true);
          } else {
            setOnboardingComplete(false);
          }
        } catch (err) {
          console.error("Failed to fetch onboarding status", err);
          setOnboardingComplete(false);
        }
      } else {
        setUser(null);
        setOnboardingComplete(false);
      }
      setAuthChecked(true);
      setLoadingData(false);
    });
    return () => unsubscribe();
  }, []);

  if (!authChecked || loadingData) {
    return <LoadingScreen />;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicOnlyRoute user={user} authChecked={authChecked} loadingData={loadingData} onboardingComplete={onboardingComplete}><LandingPage /></PublicOnlyRoute>} />
          <Route path="/login" element={<PublicOnlyRoute user={user} authChecked={authChecked} loadingData={loadingData} onboardingComplete={onboardingComplete}><LoginPage /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute user={user} authChecked={authChecked} loadingData={loadingData} onboardingComplete={onboardingComplete}><SignupPage /></PublicOnlyRoute>} />
          
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          
          <Route path="/onboarding" element={
            (!user || !onboardingComplete) ? (
              <OnboardingFlow onComplete={() => setOnboardingComplete(true)} />
            ) : (
              <Navigate to="/home" />
            )
          } />

          <Route path="/*" element={
            <ProtectedRoute user={user} authChecked={authChecked} loadingData={loadingData} onboardingComplete={onboardingComplete}>
              <Dashboard user={user} />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
      {import.meta.env.DEV && (
        <Agentation
          endpoint="http://localhost:4747"
          onSessionCreated={(sessionId) => {
            console.log("Session started:", sessionId);
          }}
        />
      )}
    </>
  );
};

export default App;
