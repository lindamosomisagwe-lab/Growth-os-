import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  return (
    <div style={{
      background: '#1B1F3B',
      minHeight: '100vh',
      padding: '60px 24px',
      color: 'var(--text-primary)', 
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Back link */}
        <Link to="/" style={{
          fontSize: '13px', color: 'rgba(232,224,213,0.4)',
          textDecoration: 'none', display: 'block', marginBottom: '40px'
        }}>
          ← Back to Chapter
        </Link>

        {/* Title */}
        <div style={{
          fontSize: '32px', fontWeight: '700',
          color: '#E8E0D5', letterSpacing: '-0.02em',
          marginBottom: '8px'
        }}>
          Privacy Policy
        </div>
        <div style={{
          fontSize: '13px', color: 'rgba(232,224,213,0.35)',
          marginBottom: '48px'
        }}>
          Last updated June 2026
        </div>

        {/* Short version callout */}
        <div style={{
          background: 'rgba(255,107,53,0.08)',
          border: '1px solid rgba(255,107,53,0.2)',
          borderLeft: '3px solid #FF6B35',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '40px'
        }}>
          <div style={{
            fontSize: '13px', fontWeight: '600',
            color: '#FF6B35', marginBottom: '6px',
            textTransform: 'uppercase', letterSpacing: '0.06em'
          }}>
            The short version
          </div>
          <div style={{
            fontSize: '14px', color: 'rgba(232,224,213,0.75)',
            lineHeight: '1.65'
          }}>
            We collect only what we need. We never sell your data.
            Your mood logs are private and encrypted.
            You can delete everything at any time.
          </div>
        </div>

        <PolicySection title="1. Who we are">
          Chapter is a personal goal tracking and wellness app.<br/>
          Operated by Linda Mosomisagwe, based in Kenya.<br/>
          Contact: lindamosomisagwe@gmail.com
        </PolicySection>

        <PolicySection title="2. What data we collect">
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <li style={{ marginBottom: '8px' }}><strong>Account data:</strong> email, display name (when you create an account)</li>
            <li style={{ marginBottom: '8px' }}><strong>Mood logs:</strong> your daily emotional check-ins (special category health data)</li>
            <li style={{ marginBottom: '8px' }}><strong>Wheel of Life scores:</strong> self-reported ratings across 8 life dimensions</li>
            <li style={{ marginBottom: '8px' }}><strong>Goals and tasks:</strong> your personal goal titles and descriptions</li>
            <li style={{ marginBottom: '8px' }}><strong>Vault letters:</strong> private letters you write to your future self</li>
            <li><strong>Usage data:</strong> login times, feature usage (no personal content)</li>
          </ul>
        </PolicySection>

        <PolicySection title="3. Why we collect it and our lawful basis">
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <li style={{ marginBottom: '8px' }}><strong>Account data:</strong> contract (to provide the service)</li>
            <li style={{ marginBottom: '8px' }}><strong>Mood and health data:</strong> explicit consent (Article 9(2)(a) UK GDPR)</li>
            <li style={{ marginBottom: '8px' }}><strong>Goals and vault content:</strong> explicit consent</li>
            <li><strong>Usage analytics:</strong> legitimate interests (app improvement)</li>
          </ul>
        </PolicySection>

        <PolicySection title="4. How long we keep it">
          We keep your data while your account is active.
          If you delete your account, all personal data is deleted within 30 days.
          We do not sell or share your mood logs, goals, or personal content.
        </PolicySection>

        <PolicySection title="5. Who we share it with">
          Firebase (Google) — our secure database and authentication provider.
          No other third parties. We never sell your data.<br/>
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" style={{ color: '#FF6B35' }}>Google's privacy policy</a>
        </PolicySection>

        <PolicySection title="6. Your rights under UK GDPR">
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <li style={{ marginBottom: '8px' }}><strong>Access:</strong> request a copy of your data (use the Export button in Settings)</li>
            <li style={{ marginBottom: '8px' }}><strong>Deletion:</strong> delete your account and all data (Settings → Delete account)</li>
            <li style={{ marginBottom: '8px' }}><strong>Correction:</strong> update your profile at any time</li>
            <li style={{ marginBottom: '8px' }}><strong>Portability:</strong> download your data as JSON (Settings → Export data)</li>
            <li style={{ marginBottom: '8px' }}><strong>Withdraw consent:</strong> delete your account at any time</li>
            <li><strong>Complaints:</strong> contact the ICO at <a href="https://ico.org.uk" target="_blank" rel="noreferrer" style={{ color: '#FF6B35' }}>ico.org.uk</a> if you have concerns</li>
          </ul>
        </PolicySection>

        <PolicySection title="7. Minimum age requirements">
          <ul style={{ paddingLeft: '20px', margin: 0, marginBottom: '16px' }}>
            <li style={{ marginBottom: '4px' }}><strong>United Kingdom:</strong> 16 years or older</li>
            <li style={{ marginBottom: '4px' }}><strong>Kenya:</strong> 18 years or older (or with parental consent)</li>
            <li style={{ marginBottom: '4px' }}><strong>United States:</strong> 13 years or older (users under 13 are strictly prohibited under US federal law)</li>
            <li><strong>All other countries:</strong> 16 years or older</li>
          </ul>
          <p style={{ margin: 0 }}>
            If you do not meet the minimum age requirement for your country, you may not use Chapter. We do not knowingly collect data from users under these age limits. If you believe a child has used Chapter, contact us immediately.
          </p>
        </PolicySection>

        <PolicySection title="8. Data security">
          All data is stored on Firebase (Google Cloud), encrypted at rest and
          in transit. We use industry-standard security practices.
          In the event of a data breach affecting your personal data, we will
          notify you and the ICO within 72 hours.
        </PolicySection>

        <PolicySection title="9. Changes to this policy">
          We'll notify you by email if we make material changes.
          Continued use after changes = acceptance of new policy.
        </PolicySection>

        <PolicySection title="10. Contact us">
          Email: lindamosomisagwe@gmail.com<br/>
          Response time: within 30 days (legally required)
        </PolicySection>

      </div>
    </div>
  )
}

function PolicySection({
  title, children
}) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{
        fontSize: '17px', fontWeight: '600',
        color: '#E8E0D5', letterSpacing: '-0.01em',
        marginBottom: '14px',
        paddingBottom: '10px',
        borderBottom: '1px solid rgba(232,224,213,0.07)'
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '14px', color: 'rgba(232,224,213,0.65)',
        lineHeight: '1.75'
      }}>
        {children}
      </div>
    </div>
  )
}
