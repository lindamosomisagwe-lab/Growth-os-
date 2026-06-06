import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase-config';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate('/onboarding');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/onboarding');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#1B1F3B',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Lamp glow effect behind the card */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(255,107,53,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }}/>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <svg width="32" height="32" viewBox="0 0 64 64"
            style={{ margin: '0 auto 12px', display: 'block' }}>
            <polygon
              points="32,4 52,12 60,32 52,52 32,60 12,52 4,32 12,12"
              fill="rgba(255,107,53,0.2)" stroke="#FF6B35" strokeWidth="2.5"
            />
            <circle cx="32" cy="4" r="3.5" fill="#FF6B35"/>
            <circle cx="60" cy="32" r="3.5" fill="#FF6B35"/>
            <circle cx="32" cy="60" r="3.5" fill="#FF6B35"/>
            <circle cx="4" cy="32" r="3.5" fill="#FF6B35"/>
          </svg>
          <div style={{
            fontSize: '22px', fontWeight: '700',
            color: '#E8E0D5', letterSpacing: '-0.02em'
          }}>
            Chapter
          </div>
          <div style={{
            fontSize: '14px', color: 'rgba(232,224,213,0.4)',
            marginTop: '6px'
          }}>
            Start your story. It's free.
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#252A4A',
          border: '1px solid rgba(232,224,213,0.08)',
          borderTop: '3px solid #FF6B35',
          borderRadius: '12px',
          padding: '32px'
        }}>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#E8E0D5',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '700',
              color: '#1B1F3B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 3px 0 rgba(0,0,0,0.3)',
              marginBottom: '20px',
              transition: 'all 0.08s ease'
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

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(232,224,213,0.08)' }}/>
            <span style={{ fontSize: '12px', color: 'rgba(232,224,213,0.3)' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(232,224,213,0.08)' }}/>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: '600',
                color: 'rgba(232,224,213,0.4)', letterSpacing: '0.06em',
                textTransform: 'uppercase', marginBottom: '6px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%', padding: '11px 14px',
                  background: 'rgba(232,224,213,0.05)',
                  border: '1px solid rgba(232,224,213,0.12)',
                  borderRadius: '8px',
                  fontSize: '14px', color: '#E8E0D5',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#FF6B35'}
                onBlur={e => e.target.style.borderColor = 'rgba(232,224,213,0.12)'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: '600',
                color: 'rgba(232,224,213,0.4)', letterSpacing: '0.06em',
                textTransform: 'uppercase', marginBottom: '6px'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                style={{
                  width: '100%', padding: '11px 14px',
                  background: 'rgba(232,224,213,0.05)',
                  border: '1px solid rgba(232,224,213,0.12)',
                  borderRadius: '8px',
                  fontSize: '14px', color: '#E8E0D5',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#FF6B35'}
                onBlur={e => e.target.style.borderColor = 'rgba(232,224,213,0.12)'}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  required
                  style={{ marginTop: '2px', accentColor: '#FF6B35' }}
                />
                <span style={{
                  fontSize: '13px', color: 'rgba(232,224,213,0.45)',
                  lineHeight: '1.5'
                }}>
                  I confirm I meet the minimum age requirement for my country
                </span>
              </label>
            </div>

            {error && (
              <div style={{
                fontSize: '13px', color: '#C4596A',
                marginBottom: '16px', padding: '10px 14px',
                background: 'rgba(196,89,106,0.1)',
                borderRadius: '6px', border: '1px solid rgba(196,89,106,0.2)'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: '#FF6B35',
                border: 'none', borderRadius: '8px',
                fontSize: '14px', fontWeight: '700',
                color: '#1B1F3B', cursor: 'pointer',
                boxShadow: '0 3px 0 #C94A1A',
                transition: 'all 0.08s ease',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Creating your account...' : 'Create account →'}
            </button>
          </form>

          {/* Sign in link */}
          <div style={{
            textAlign: 'center', marginTop: '20px',
            fontSize: '13px', color: 'rgba(232,224,213,0.35)'
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{
              color: '#FF6B35', textDecoration: 'none', fontWeight: '500'
            }}>
              Sign in
            </Link>
          </div>
        </div>

        {/* Privacy note */}
        <div style={{
          textAlign: 'center', marginTop: '16px',
          fontSize: '12px', color: 'rgba(232,224,213,0.2)',
          lineHeight: 1.6
        }}>
          🔒 Your data is private and encrypted.<br/>
          We never sell it. Ever.
        </div>
      </motion.div>
    </div>
  );
}
