import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebase-config';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { Eye, EyeOff } from 'lucide-react';

export default function OnboardingFlow({ onComplete }) {
  // Step state:
  // 1: Splash ("your story is being written")
  // 2: Step 1 of 4 (Category Selection)
  // 3: Step 2 of 4 (Goal Vision text area)
  // 4: Step 3 of 4 (Daily Commitment minutes)
  // 5: Step 4 of 4 (Goal Summary & Consent Checkbox)
  // 6: Save Progress (Signup/Login)
  // 7: Welcome Splash ("Welcome to Chapter")
  const [step, setStep] = useState(1);
  
  // Quiz selections
  const [lifeArea, setLifeArea] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [commitment, setCommitment] = useState(15);

  // Consent & Auth state
  const [healthConsent, setHealthConsent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Auto-advance Splash Screen 1
  useEffect(() => {
    if (step === 1) {
      const timer = setTimeout(() => setStep(2), 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Auto-advance Welcome Screen 7
  useEffect(() => {
    if (step === 7) {
      const timer = setTimeout(() => onComplete(), 3000);
      return () => clearTimeout(timer);
    }
  }, [step, onComplete]);

  const handleAreaSelect = (area) => {
    setLifeArea(area);
    setTimeout(() => setStep(3), 200);
  };

  const saveOnboardingData = async (user) => {
    try {
      // 1. Update user onboarding record
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || 'Traveler',
        onboardingComplete: true,
        primaryLifeArea: lifeArea,
        dailyCommitment: `${commitment}min`,
        createdAt: serverTimestamp(),
      }, { merge: true });

      // 2. Create user progress
      await setDoc(doc(db, 'user_progress', user.uid), {
        totalXp: 50,
        currentChapter: 1,
        streakDays: 0,
        goalsCompleted: 0,
        lastActiveDate: null,
      });

      // 3. Create first goal
      await addDoc(collection(db, 'goals'), {
        userId: user.uid,
        title: goalDescription,
        lifeArea: lifeArea,
        tier: 1,
        progressPercent: 0,
        status: 'in-progress',
        createdAt: serverTimestamp(),
      });

      // 4. Save consent
      const consentId = `consent_${user.uid}_${Date.now()}`;
      await setDoc(doc(db, 'consent_records', consentId), {
        userId: user.uid,
        consentVersion: "1.0",
        accountDataConsent: true,
        healthDataConsent: healthConsent,
        analyticsConsent: false,
        consentTimestamp: serverTimestamp(),
        userAgent: navigator.userAgent
      });

    } catch (err) {
      console.error('Error saving onboarding data:', err);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError('');
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userSnap = await getDoc(doc(db, 'users', result.user.uid));
      const isFullyOnboarded = userSnap.exists() && userSnap.data().onboardingComplete === true;
      
      if (isFullyOnboarded) {
        onComplete();
      } else {
        await saveOnboardingData(result.user);
        setStep(7);
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);
    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const userSnap = await getDoc(doc(db, 'users', result.user.uid));
        const isFullyOnboarded = userSnap.exists() && userSnap.data().onboardingComplete === true;
        
        if (isFullyOnboarded) {
          onComplete();
        } else {
          await saveOnboardingData(result.user);
          setStep(7);
        }
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await saveOnboardingData(result.user);
        setStep(7);
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Dynamic content mapper based on chosen category (Step 1 Selection)
  const getDynamicContent = (area, minutes) => {
    const areaLabels = {
      mental_health: 'mental health',
      physical_health: 'physical health',
      career_finances: 'career & finances',
      relationships: 'relationships',
      creativity: 'creativity',
      personal_development: 'personal development'
    };
    const label = areaLabels[area] || 'personal growth';
    
    return {
      subgoals: [
        `Build the ${label} habit`,
        'Track weekly progress',
        'Review and adjust monthly'
      ],
      tasks: [
        `Spend ${minutes || 15} minutes today on ${label}`,
        'Write down what success looks like this week',
        'Identify one obstacle and one way around it'
      ]
    };
  };

  // Header progress bar
  const renderProgressHeader = (currentStep) => {
    const pct = (currentStep / 4) * 100;
    return (
      <header style={{ width: '100%', maxWidth: '640px', margin: '0 auto', padding: '16px 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px' }}>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', fontWeight: 700, color: '#1B1D1D' }}>
            Chapter
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500, color: '#8C918C' }}>
            Step {currentStep} of 4
          </span>
        </div>
        <div style={{ width: '100%', height: '1px', background: 'rgba(27,31,29,0.08)', position: 'relative' }}>
          <div 
            style={{ 
              position: 'absolute', top: '-0.5px', left: 0, height: '2px', 
              background: '#607A66', width: `${pct}%`, transition: 'width 0.3s ease' 
            }} 
          />
        </div>
      </header>
    );
  };

  // Screens
  const renderSplash = () => (
    <motion.div key="splash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', background: '#FAF9F6' }}>
      <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '36px', fontWeight: 700, color: '#1B1D1D', margin: 0 }}>
        Chapter
      </h1>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: '#8C918C', textTransform: 'uppercase', marginTop: '12px' }}>
        your story is being written
      </span>
    </motion.div>
  );

  const renderStep1 = () => {
    const options = [
      { id: 'mental_health', label: 'Mental health' },
      { id: 'physical_health', label: 'Physical health' },
      { id: 'career_finances', label: 'Career & finances' },
      { id: 'relationships', label: 'Relationships' },
      { id: 'creativity', label: 'Creativity' },
      { id: 'personal_development', label: 'Personal development' }
    ];

    return (
      <motion.div key="step1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '32px', fontWeight: 700, color: '#1B1D1D', marginBottom: '8px', lineHeight: 1.25 }}>
          What part of your life do you want to give attention to first?
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', color: '#5C615C', marginBottom: '32px' }}>
          You can change this anytime. Start with what feels most alive.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
          {options.map(opt => {
            const isSelected = lifeArea === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => handleAreaSelect(opt.id)}
                style={{
                  background: isSelected ? '#E6ECE8' : 'transparent',
                  border: `1px solid ${isSelected ? '#607A66' : 'rgba(27,31,29,0.1)'}`,
                  borderWidth: isSelected ? '1.5px' : '1px',
                  borderRadius: '8px',
                  padding: '20px 24px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#1B1D1D',
                  transition: 'all 0.15s ease',
                  userSelect: 'none'
                }}
                onMouseEnter={e => {
                  if (!isSelected) e.currentTarget.style.borderColor = '#607A66';
                }}
                onMouseLeave={e => {
                  if (!isSelected) e.currentTarget.style.borderColor = 'rgba(27,31,29,0.1)';
                }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  const renderStep2 = () => (
    <motion.div key="step2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '32px', fontWeight: 700, color: '#1B1D1D', marginBottom: '8px', lineHeight: 1.25 }}>
        If three months from now this is going well, what does it look like?
      </h2>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', color: '#5C615C', marginBottom: '24px' }}>
        A sentence is enough. Be honest, not aspirational.
      </p>

      <textarea
        autoFocus
        value={goalDescription}
        onChange={e => setGoalDescription(e.target.value)}
        placeholder="In three months I..."
        style={{
          width: '100%',
          minHeight: '130px',
          background: 'rgba(27,31,29,0.01)',
          border: '1px solid rgba(27,31,29,0.15)',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '16px',
          fontFamily: "'Inter', sans-serif",
          color: '#1B1D1D',
          outline: 'none',
          resize: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s'
        }}
        onFocus={e => e.target.style.borderColor = '#607A66'}
        onBlur={e => e.target.style.borderColor = 'rgba(27,31,29,0.15)'}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' }}>
        <button 
          onClick={() => setStep(2)} 
          style={{ background: 'none', border: 'none', color: '#5C615C', fontSize: '15px', fontWeight: 500, cursor: 'pointer', padding: 0 }}
        >
          Back
        </button>
        <button 
          onClick={() => setStep(4)}
          disabled={!goalDescription.trim()}
          style={{
            background: goalDescription.trim() ? '#607A66' : '#C6D1C9',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 28px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: goalDescription.trim() ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s'
          }}
        >
          Continue
        </button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div key="step3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '32px', fontWeight: 700, color: '#1B1D1D', marginBottom: '8px', lineHeight: 1.25 }}>
        How much time can you give this each day?
      </h2>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', color: '#5C615C', marginBottom: '32px' }}>
        Be realistic. Small and consistent beats big and abandoned.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <input 
          type="number"
          value={commitment}
          onChange={e => setCommitment(Math.max(1, parseInt(e.target.value) || 0))}
          style={{
            width: '100px',
            height: '48px',
            background: 'rgba(27,31,29,0.01)',
            border: '1px solid rgba(27,31,29,0.15)',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 600,
            color: '#1B1D1D',
            outline: 'none',
            boxSizing: 'border-box'
          }}
          onFocus={e => e.target.style.borderColor = '#607A66'}
          onBlur={e => e.target.style.borderColor = 'rgba(27,31,29,0.15)'}
        />
        <span style={{ fontSize: '16px', color: '#5C615C', fontWeight: 500 }}>
          minutes per day
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '48px' }}>
        <button 
          onClick={() => setStep(3)} 
          style={{ background: 'none', border: 'none', color: '#5C615C', fontSize: '15px', fontWeight: 500, cursor: 'pointer', padding: 0 }}
        >
          Back
        </button>
        <button 
          onClick={() => setStep(5)}
          style={{
            background: '#607A66',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 28px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Continue
        </button>
      </div>
    </motion.div>
  );

  const renderStep4 = () => {
    const summary = getDynamicContent(lifeArea, commitment);
    
    return (
      <motion.div key="step4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', padding: '24px 0' }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: '#8C918C', textTransform: 'uppercase', marginBottom: '8px' }}>
          YOUR FIRST GOAL
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '32px', fontWeight: 700, color: '#1B1D1D', marginBottom: '6px', lineHeight: 1.2 }}>
          {goalDescription}
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', color: '#5C615C', marginBottom: '24px' }}>
          {goalDescription}
        </p>

        {/* Outline summary card */}
        <div style={{
          border: '1px solid rgba(27,31,29,0.08)',
          borderRadius: '8px',
          padding: '24px',
          background: 'rgba(27,31,29,0.01)',
          marginBottom: '24px'
        }}>
          {/* Subgoals */}
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: '#8C918C', textTransform: 'uppercase', marginBottom: '12px' }}>
            SUB-GOALS
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {summary.subgoals.map((g, idx) => (
              <li key={idx} style={{ fontSize: '15px', color: '#1B1D1D', display: 'flex', gap: '10px' }}>
                <span style={{ color: '#8C918C' }}>—</span> {g}
              </li>
            ))}
          </ul>

          <div style={{ borderBottom: '1px solid rgba(27,31,29,0.06)', margin: '16px 0' }} />

          {/* First tasks */}
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: '#8C918C', textTransform: 'uppercase', marginBottom: '12px' }}>
            FIRST TASKS
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {summary.tasks.map((t, idx) => (
              <li key={idx} style={{ fontSize: '15px', color: '#1B1D1D', display: 'flex', gap: '10px' }}>
                <span style={{ color: '#8C918C' }}>—</span> {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Consent checkbox */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={healthConsent}
              onChange={e => setHealthConsent(e.target.checked)}
              style={{ marginTop: '3px', accentColor: '#607A66', width: '16px', height: '16px', flexShrink: 0 }}
            />
            <span style={{ fontSize: '13px', color: '#5C615C', lineHeight: '1.5', userSelect: 'none' }}>
              I consent to Chapter storing wellness data I choose to record (mood logs, journal entries, life-balance scores). This is separate from the Terms of Service — you can use Chapter without this.
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={() => setStep(4)} 
            style={{ background: 'none', border: 'none', color: '#5C615C', fontSize: '15px', fontWeight: 500, cursor: 'pointer', padding: 0 }}
          >
            Back
          </button>
          <button 
            disabled={!healthConsent}
            onClick={async () => {
              if (auth.currentUser) {
                await saveOnboardingData(auth.currentUser);
                setStep(7);
              } else {
                setStep(6);
              }
            }}
            style={{
              background: healthConsent ? '#607A66' : '#C6D1C9',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 28px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: healthConsent ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s'
            }}
          >
            Continue
          </button>
        </div>
      </motion.div>
    );
  };

  const renderSignup = () => (
    <motion.div key="signup" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '360px', width: '100%', margin: '0 auto', padding: '24px 0' }}>
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '28px', fontWeight: 700, color: '#1B1D1D', marginBottom: '8px', textAlign: 'center' }}>
        Save your progress.
      </h2>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#5C615C', textAlign: 'center', marginBottom: '32px' }}>
        Create a free account to keep everything you just set up.
      </p>

      {authError && (
        <div style={{ fontSize: '13px', color: '#C4596A', padding: '10px 12px', background: 'rgba(196,89,106,0.06)', borderRadius: '6px', border: '1px solid rgba(196,89,106,0.15)', marginBottom: '16px', textAlign: 'center' }}>
          {authError}
        </div>
      )}

      {/* Google Signin */}
      <button 
        onClick={handleGoogleAuth}
        disabled={isLoggingIn}
        style={{
          width: '100%', background: '#FAF9F6', border: '1px solid rgba(27,31,29,0.12)', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: 600, color: '#1B1D1D', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(27,31,29,0.06)' }} />
        <span style={{ fontSize: '12px', color: '#8C918C' }}>or</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(27,31,29,0.06)' }} />
      </div>

      <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '12px 14px', background: 'rgba(27,31,29,0.01)', border: '1px solid rgba(27,31,29,0.12)', borderRadius: '8px', fontSize: '15px', color: '#1B1D1D', outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = '#607A66'}
          onBlur={e => e.target.style.borderColor = 'rgba(27,31,29,0.12)'}
        />

        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            style={{ width: '100%', padding: '12px 40px 12px 14px', background: 'rgba(27,31,29,0.01)', border: '1px solid rgba(27,31,29,0.12)', borderRadius: '8px', fontSize: '15px', color: '#1B1D1D', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#607A66'}
            onBlur={e => e.target.style.borderColor = 'rgba(27,31,29,0.12)'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8C918C', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, outline: 'none' }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {!isLogin && (
          <div style={{ margin: '4px 0 12px' }}>
            <label style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" required style={{ marginTop: '3px', accentColor: '#607A66' }} />
              <span style={{ fontSize: '13px', color: '#5C615C', lineHeight: '1.4' }}>
                I confirm I meet the minimum age requirement for my country
              </span>
            </label>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoggingIn}
          style={{ width: '100%', background: '#607A66', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '13px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s', marginTop: '8px' }}
        >
          {isLoggingIn ? 'Processing...' : (isLogin ? 'Sign in →' : 'Create account →')}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <span 
          onClick={() => setIsLogin(!isLogin)}
          style={{ fontSize: '13px', color: '#5C615C', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </span>
      </div>
    </motion.div>
  );

  const renderWelcome = () => (
    <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', background: '#FAF9F6' }}>
      <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '32px', fontWeight: 700, color: '#1B1D1D', margin: '0 0 16px' }}>
          Welcome to Chapter.
        </h2>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: '#8C918C', textTransform: 'uppercase', marginBottom: '32px' }}>
          Chapter 1: The Beginning
        </div>
      </motion.div>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.8, bounce: 0.4 }} style={{ fontSize: '64px', marginBottom: '32px' }}>
        🌱
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', color: '#5C615C', fontStyle: 'italic' }}>
          Your story starts now.
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div style={{ background: '#FAF9F6', minHeight: '100vh', width: '100vw', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '32px 40px', overflowX: 'hidden' }}>
      
      {/* Header bar only rendered on step 2, 3, 4, 5 (Steps 1 to 4 of Onboarding) */}
      {step >= 2 && step <= 5 && renderProgressHeader(step - 1)}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
        <AnimatePresence mode="wait">
          {step === 1 && renderSplash()}
          {step === 2 && renderStep1()}
          {step === 3 && renderStep2()}
          {step === 4 && renderStep3()}
          {step === 5 && renderStep4()}
          {step === 6 && renderSignup()}
          {step === 7 && renderWelcome()}
        </AnimatePresence>
      </div>

      {/* Render matching copyright footer only on non-splash views */}
      {step >= 2 && step <= 6 && (
        <footer style={{ width: '100%', maxWidth: '640px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 0', borderTop: '1px solid rgba(27,31,29,0.04)' }}>
          <div style={{ fontSize: '13px', color: '#8C918C' }}>
            © Chapter
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="/privacy" target="_blank" style={{ fontSize: '13px', color: '#8C918C', textDecoration: 'none' }}>Privacy</a>
            <a href="/terms" target="_blank" style={{ fontSize: '13px', color: '#8C918C', textDecoration: 'none' }}>Terms</a>
          </div>
        </footer>
      )}
    </div>
  );
}
