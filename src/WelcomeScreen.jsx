import React from 'react';

const WelcomeScreen = ({ skipAnimation }) => {
  return (
    <div 
      className="splash-screen" 
      onClick={skipAnimation}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0d0d14',
        height: '100vh',
        width: '100vw',
        animation: 'fadeOut 0.5s ease-in-out 1.5s forwards',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle off-center glow for the splash screen */}
      <div style={{
        position: 'absolute',
        top: '-10%', left: '20%',
        width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,92,252,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{
        fontSize: '3.5rem',
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: '0.05em',
        animation: 'scaleUp 2s ease-out',
        position: 'relative',
        zIndex: 1
      }}>
        Growth OS
      </div>
      
      <div style={{
        fontSize: '1.2rem',
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '400',
        marginTop: '12px',
        animation: 'fadeInUp 1s ease-out 0.5s both',
        position: 'relative',
        zIndex: 1
      }}>
        Your story is being written.
      </div>
      
      <style>{`
        @keyframes fadeOut {
          to { opacity: 0; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default WelcomeScreen;
