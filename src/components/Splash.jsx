import React, { useState, useEffect } from 'react';
import Logo from './Logo';

export default function Splash({ onComplete }) {
  const [stage, setStage] = useState('hidden');

  useEffect(() => {
    // 1. Initial delay then fade in logo
    const t1 = setTimeout(() => setStage('show-logo'), 100);
    // 2. Logo visible for 800ms, then peel overlay
    const t2 = setTimeout(() => setStage('peel'), 900);
    // 3. Peel animation takes 600ms, then complete to unmount
    const t3 = setTimeout(() => {
      setStage('done');
      if (onComplete) onComplete();
    }, 1500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  if (stage === 'done') return null;

  return (
    <div className={`splash-container ${stage === 'peel' ? 'peel-active' : ''}`}>
      <div className={`splash-logo ${stage === 'show-logo' ? 'visible' : ''}`}>
        <Logo size={120} color="#FDFBF7" />
      </div>
    </div>
  );
}
