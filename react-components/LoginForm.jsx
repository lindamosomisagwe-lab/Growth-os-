import { useState } from 'react';
import { auth } from './firebase-config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
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
    backgroundColor: 'rgba(245,240,232,0.04)',
    border: '1px solid rgba(245,240,232,0.13)',
    borderRadius: '10px',
    color: '#F5F0E8',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#7C5CFC',
    color: '#F5F0E8',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '10px',
    transition: 'background-color 0.2s'
  };

  return (
    <div style={{
      width: '320px',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(245,240,232,0.13)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
    }}>
      {error && (
        <div style={{ color: '#F05A7E', fontSize: '12px', marginBottom: '16px', padding: '8px', backgroundColor: 'rgba(240,90,126,0.1)', borderRadius: '6px' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email Address" 
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit" style={buttonStyle}>
          {isLogin ? 'Access System' : 'Initialize Account'}
        </button>
      </form>

      <div style={{ margin: '16px 0', color: 'rgba(245,240,232,0.4)', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
        <hr style={{ flex: 1, borderColor: 'rgba(245,240,232,0.1)', borderStyle: 'solid' }} />
        <span style={{ padding: '0 10px' }}>OR</span>
        <hr style={{ flex: 1, borderColor: 'rgba(245,240,232,0.1)', borderStyle: 'solid' }} />
      </div>

      <button onClick={handleGoogleSignIn} style={{
        ...buttonStyle,
        backgroundColor: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(245,240,232,0.13)'
      }}>
        Continue with Google
      </button>

      <p style={{ marginTop: '20px', fontSize: '12px', color: 'rgba(245,240,232,0.55)' }}>
        {isLogin ? "Don't have an access code? " : "Already initialized? "}
        <span 
          onClick={() => setIsLogin(!isLogin)} 
          style={{ color: '#7C5CFC', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isLogin ? 'Create Account' : 'Sign In'}
        </span>
      </p>
    </div>
  );
};

export default LoginForm;
