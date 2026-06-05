import { useState } from 'react';
import { auth } from './firebase-config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const LoginForm = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (activeTab === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    marginBottom: '16px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };

  const isLogin = activeTab === 'signin';

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#161622',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '24px',
      padding: '32px 24px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Small Logo */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '32px', height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #7C5CFC, #5B3FD4)',
          color: '#FFF', fontWeight: '900', fontSize: '16px',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '12px'
        }}>G</div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FFF', margin: 0 }}>Growth OS</h2>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: '4px',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <button 
          onClick={() => { setActiveTab('signin'); setError(''); }}
          style={{
            flex: 1, padding: '8px', border: 'none', borderRadius: '8px',
            backgroundColor: isLogin ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: isLogin ? '#FFF' : 'rgba(255,255,255,0.5)',
            fontWeight: '600', fontSize: '13px', cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Sign in
        </button>
        <button 
          onClick={() => { setActiveTab('signup'); setError(''); }}
          style={{
            flex: 1, padding: '8px', border: 'none', borderRadius: '8px',
            backgroundColor: !isLogin ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: !isLogin ? '#FFF' : 'rgba(255,255,255,0.5)',
            fontWeight: '600', fontSize: '13px', cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Create account
        </button>
      </div>

      {error && (
        <div style={{ color: '#F05A7E', fontSize: '12px', marginBottom: '16px', padding: '10px', backgroundColor: 'rgba(240,90,126,0.1)', borderRadius: '8px', border: '1px solid rgba(240,90,126,0.2)' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email address" 
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={(e) => e.target.style.borderColor = '#7C5CFC'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={(e) => e.target.style.borderColor = '#7C5CFC'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          required
        />
        
        {isLogin && (
          <div style={{ textAlign: 'right', marginBottom: '16px', marginTop: '-8px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>Forgot password?</span>
          </div>
        )}

        <button 
          type="submit" 
          className="btn-primary"
          style={{ width: '100%', marginBottom: '16px' }}
        >
          {isLogin ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <div style={{ margin: '16px 0', color: 'rgba(255,255,255,0.3)', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
        <hr style={{ flex: 1, borderColor: 'rgba(255,255,255,0.05)', borderStyle: 'solid' }} />
        <span style={{ padding: '0 10px' }}>OR</span>
        <hr style={{ flex: 1, borderColor: 'rgba(255,255,255,0.05)', borderStyle: 'solid' }} />
      </div>

      <button onClick={handleGoogleSignIn} style={{
        width: '100%',
        padding: '12px',
        backgroundColor: 'transparent',
        color: 'rgba(255,255,255,0.9)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'background 0.2s'
      }}
      onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <p style={{ marginTop: '28px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
        Track goals. Build habits. Write to your future self.
      </p>
    </div>
  );
};

export default LoginForm;
