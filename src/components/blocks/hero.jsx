import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

export function Hero({ title, subtitle, actions, titleClassName, subtitleClassName, actionsClassName, style }) {
  return (
    <section 
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden',
        minHeight: '60vh',
        ...style
      }}
    >
      {/* Lamp Glow Effect */}
      <div 
        style={{
          position: 'absolute',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          maxWidth: '800px',
          height: '400px',
          background: 'radial-gradient(ellipse at top, rgba(255,107,53,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ position: 'relative', zIndex: 1, padding: '0 24px', maxWidth: '800px' }}
      >
        <h1 className={titleClassName} style={{ fontSize: '56px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#E8E0D5', marginBottom: '24px' }}>
          {title}
        </h1>
        <p className={subtitleClassName} style={{ fontSize: '18px', color: 'rgba(232,224,213,0.6)', maxWidth: '540px', margin: '0 auto 32px', lineHeight: 1.6 }}>
          {subtitle}
        </p>
        <div className={actionsClassName} style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          {actions && actions.map((action, i) => (
            <Link key={i} to={action.href}>
              <Button variant={action.variant} size="lg" style={{ fontSize: '16px', padding: '12px 28px', height: 'auto', borderRadius: '8px' }}>
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
