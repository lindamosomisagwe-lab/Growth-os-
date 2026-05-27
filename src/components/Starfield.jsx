import React, { useEffect, useRef, useMemo } from 'react';
import '../index.css'; // ensure twinkle animations are loaded

export default function Starfield() {
  const containerRef = useRef(null);

  // Generate random stars once
  const stars = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // %
      y: Math.random() * 100, // %
      size: Math.random() * 2 + 1, // 1px to 3px
      depth: Math.random() * 2 + 1, // 1 to 3 for parallax depth
      twinkle: Math.random() > 0.7, // 30% of stars twinkle
      twinkleDelay: Math.random() * 5, // 0 to 5s delay
    }));
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const { innerWidth, innerHeight } = window;
      const mouseX = e.clientX / innerWidth - 0.5; // -0.5 to 0.5
      const mouseY = e.clientY / innerHeight - 0.5;

      const layers = containerRef.current.children;
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        const depth = parseFloat(layer.getAttribute('data-depth'));
        // Deepest layer moves the least, foreground moves the most
        const moveX = -(mouseX * depth * 15); 
        const moveY = -(mouseY * depth * 15);
        layer.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: -1, // ensure it sits at the absolute bottom
      overflow: 'hidden',
      pointerEvents: 'none',
      background: 'var(--bg-page)' // Base Deep Maroon color
    }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
        {[1, 2, 3].map((depthLevel) => (
          <div 
            key={depthLevel} 
            data-depth={depthLevel} 
            style={{ 
              position: 'absolute', top: '-5%', left: '-5%', width: '110%', height: '110%',
              willChange: 'transform',
              transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
          >
            {stars.filter(s => Math.round(s.depth) === depthLevel).map(star => (
              <div
                key={star.id}
                className={star.twinkle ? "star-twinkle" : ""}
                style={{
                  position: 'absolute',
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  backgroundColor: '#FDFBF7',
                  borderRadius: '50%',
                  opacity: star.size / 3, // larger stars are slightly brighter
                  animationDelay: `${star.twinkleDelay}s`
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
