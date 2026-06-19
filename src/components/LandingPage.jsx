import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing-body">
      {/* HEADER */}
      <header className="landing-header">
        <Link to="/" className="landing-logo">
          Chapter
        </Link>
        <Link to="/login" className="landing-signin">
          Sign in
        </Link>
      </header>

      {/* MAIN HERO */}
      <main className="landing-hero">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="landing-eyebrow"
        >
          A PERSONAL NOTEBOOK FOR AMBITIOUS PEOPLE
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="landing-title"
        >
          Keep the promises<br />you make to yourself.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="landing-description"
        >
          Set goals you actually finish. Reflect for sixty seconds a day. Write letters that unlock months from now.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <Link to="/signup" className="landing-btn">
            Begin your first chapter
          </Link>
          <span className="landing-subtext">
            Takes under three minutes. No account needed to start.
          </span>
        </motion.div>
      </main>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-footer-left">
          © Chapter
        </div>
        <div className="landing-footer-right">
          <Link to="/privacy" className="landing-footer-link">
            Privacy
          </Link>
          <Link to="/terms" className="landing-footer-link">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}
