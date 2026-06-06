import React from 'react';
import { Hero } from './blocks/hero';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div style={{ background: '#1B1F3B', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        padding: '20px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 100,
        background: 'rgba(27,31,59,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(232,224,213,0.06)'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="24" height="24" viewBox="0 0 64 64">
            <polygon
              points="32,4 52,12 60,32 52,52 32,60 12,52 4,32 12,12"
              fill="rgba(255,107,53,0.2)"
              stroke="#FF6B35"
              strokeWidth="2.5"
            />
            <circle cx="32" cy="4" r="3.5" fill="#FF6B35"/>
            <circle cx="60" cy="32" r="3.5" fill="#FF6B35"/>
            <circle cx="32" cy="60" r="3.5" fill="#FF6B35"/>
            <circle cx="4" cy="32" r="3.5" fill="#FF6B35"/>
          </svg>
          <span style={{
            fontSize: '17px', fontWeight: '700',
            color: '#E8E0D5', letterSpacing: '-0.02em'
          }}>
            Chapter
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <a href="#features" style={{
            fontSize: '14px', color: 'rgba(232,224,213,0.5)',
            textDecoration: 'none', fontWeight: '500'
          }}>
            Features
          </a>
          <Link to="/login" style={{
            fontSize: '14px', color: 'rgba(232,224,213,0.7)',
            textDecoration: 'none', fontWeight: '500'
          }}>
            Sign in
          </Link>
          <Link to="/signup" style={{
            background: '#FF6B35',
            color: '#1B1F3B',
            fontSize: '14px', fontWeight: '700',
            padding: '8px 20px', borderRadius: '8px',
            textDecoration: 'none',
            boxShadow: '0 3px 0 #C94A1A'
          }}>
            Start free
          </Link>
        </div>
      </nav>

      {/* LAMP HERO */}
      <Hero
        title="Start your next chapter."
        subtitle="Track goals. Reflect daily. Write letters to your future self. For ambitious people building a better life."
        actions={[
          {
            label: "Start for free →",
            href: "/signup",
            variant: "default"
          },
          {
            label: "See how it works",
            href: "#features",
            variant: "outline"
          }
        ]}
        titleClassName="text-5xl md:text-7xl font-bold tracking-tight"
        subtitleClassName="text-lg md:text-xl max-w-[540px] opacity-70"
        actionsClassName="mt-8 gap-4"
        style={{ background: 'transparent', paddingTop: '120px' }}
      />

      {/* SOCIAL PROOF — below hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        viewport={{ once: true }}
        style={{
          textAlign: 'center',
          padding: '0 40px 80px',
          color: 'rgba(232,224,213,0.35)',
          fontSize: '13px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase'
        }}
      >
        Free to start · No credit card · Your data stays private
      </motion.div>

      {/* FEATURES SECTION */}
      <section id="features" style={{ padding: '80px 40px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{
            textAlign: 'center',
            marginBottom: '60px'
          }}
        >
          <div style={{
            fontSize: '11px', fontWeight: '600',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#FF6B35', marginBottom: '12px'
          }}>
            Everything you need
          </div>
          <div style={{
            fontSize: '36px', fontWeight: '700',
            color: '#E8E0D5', letterSpacing: '-0.02em',
            lineHeight: 1.15
          }}>
            Built for people who want<br/>more from their lives.
          </div>
        </motion.div>

        {/* Feature cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {[
            {
              icon: '🎯',
              title: 'Goal tracking that sticks',
              body: 'Break big goals into steps and daily tasks. Watch your progress grow. Complete goals and unlock new chapters in your story.',
              accent: '#FF6B35'
            },
            {
              icon: '⚖️',
              title: 'Wheel of Life',
              body: 'Assess 8 dimensions of your life in one visual. Mental health, career, relationships and more — see exactly where to focus.',
              accent: '#4A9B8E'
            },
            {
              icon: '💌',
              title: 'Letters to your future self',
              body: 'Seal a letter today. Set a date. Read it in 6 months. Nothing else creates the same emotional connection to your own growth.',
              accent: '#C4596A'
            },
            {
              icon: '📋',
              title: '60-second daily check-in',
              body: 'Log your mood, one win, and one intention. Under a minute. Over time, patterns emerge that change how you see yourself.',
              accent: '#C9A84C'
            },
            {
              icon: '🔥',
              title: 'Streaks & XP',
              body: 'Show up daily and build your streak. Earn XP for every action. Progress through chapters as your life changes.',
              accent: '#FF6B35'
            },
            {
              icon: '🗺️',
              title: 'Your goals as a universe',
              body: 'Goals orbit as planets in your personal galaxy. Each one glowing with its own colour. A map of everything you\'re building.',
              accent: '#4A9B8E'
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              viewport={{ once: true }}
              style={{
                background: '#252A4A',
                border: '1px solid rgba(232,224,213,0.07)',
                borderTop: `3px solid ${feature.accent}`,
                borderRadius: '10px',
                padding: '24px'
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>
                {feature.icon}
              </div>
              <div style={{
                fontSize: '16px', fontWeight: '600',
                color: '#E8E0D5', marginBottom: '8px',
                letterSpacing: '-0.01em'
              }}>
                {feature.title}
              </div>
              <div style={{
                fontSize: '13px', color: 'rgba(232,224,213,0.5)',
                lineHeight: '1.65'
              }}>
                {feature.body}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        style={{
          padding: '100px 40px',
          textAlign: 'center',
          borderTop: '1px solid rgba(232,224,213,0.06)'
        }}
      >
        <div style={{
          fontSize: '42px', fontWeight: '700',
          color: '#E8E0D5', letterSpacing: '-0.025em',
          marginBottom: '16px', lineHeight: 1.15
        }}>
          Your story starts<br/>when you do.
        </div>
        <div style={{
          fontSize: '15px', color: 'rgba(232,224,213,0.45)',
          marginBottom: '36px', maxWidth: '400px',
          margin: '0 auto 36px'
        }}>
          Free forever. No credit card. Start in under 3 minutes.
        </div>
        <Link to="/signup" style={{
          display: 'inline-block',
          background: '#FF6B35',
          color: '#1B1F3B',
          fontSize: '16px', fontWeight: '700',
          padding: '16px 40px', borderRadius: '10px',
          textDecoration: 'none',
          boxShadow: '0 4px 0 #C94A1A'
        }}>
          Start your first chapter →
        </Link>
        <div style={{
          marginTop: '20px',
          fontSize: '12px',
          color: 'rgba(232,224,213,0.25)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase'
        }}>
          Join thousands building better lives
        </div>
      </motion.section>

      {/* FOOTER */}
      <footer style={{
        padding: '32px 40px',
        borderTop: '1px solid rgba(232,224,213,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <svg width="18" height="18" viewBox="0 0 64 64">
            <polygon points="32,4 52,12 60,32 52,52 32,60 12,52 4,32 12,12"
              fill="rgba(255,107,53,0.2)" stroke="#FF6B35" strokeWidth="2"/>
            <circle cx="32" cy="4" r="3" fill="#FF6B35"/>
            <circle cx="60" cy="32" r="3" fill="#FF6B35"/>
            <circle cx="32" cy="60" r="3" fill="#FF6B35"/>
            <circle cx="4" cy="32" r="3" fill="#FF6B35"/>
          </svg>
          <span style={{
            fontSize: '13px', fontWeight: '600',
            color: 'rgba(232,224,213,0.4)'
          }}>
            Chapter
          </span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link to="/privacy" style={{ fontSize: '13px', color: 'rgba(232,224,213,0.3)', textDecoration: 'none' }}>Privacy</Link>
          <Link to="/terms" style={{ fontSize: '13px', color: 'rgba(232,224,213,0.3)', textDecoration: 'none' }}>Terms</Link>
          <a href="mailto:lindamosomisagwe@gmail.com" style={{ fontSize: '13px', color: 'rgba(232,224,213,0.3)', textDecoration: 'none' }}>Contact</a>
        </div>
        <div style={{
          fontSize: '12px',
          color: 'rgba(232,224,213,0.2)'
        }}>
          © 2026 Chapter. Built with care ✦
        </div>
      </footer>
    </div>
  );
}
