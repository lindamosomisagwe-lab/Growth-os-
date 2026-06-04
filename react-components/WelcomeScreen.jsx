import React from 'react';

const WelcomeScreen = () => {
  return (
    <div className="splash-screen" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a1033',
      height: '100vh',
      width: '100vw',
      animation: 'fadeInOut 2.5s ease-in-out'
    }}>
      {/* Assuming logo.svg is in your public folder */}
      <img 
        src="/logo.svg" 
        className="logo-animate" 
        alt="Growth OS Logo" 
        style={{
          width: '120px',
          height: 'auto',
          animation: 'scaleUp 2s ease-out'
        }}
        onError={(e) => {
          // Fallback if logo.svg is missing
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'block';
        }}
      />
      
      {/* Fallback text if logo fails to load */}
      <div style={{
        display: 'none',
        fontSize: '3rem',
        fontWeight: '900',
        color: '#7C5CFC',
        letterSpacing: '0.1em',
        animation: 'scaleUp 2s ease-out'
      }}>
        GROWTH OS
      </div>
      
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.9); }
          to { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default WelcomeScreen;
