import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfServicePage() {
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
          Terms of Service
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
            Chapter is not a medical device. Your content belongs to you. 
            Don't use it for illegal things. We aren't liable for indirect losses.
          </div>
        </div>

        <PolicySection title="1. Acceptance & Minimum Age">
          <p style={{ marginBottom: '16px', marginTop: 0 }}>
            By using Chapter, you agree to these terms.
          </p>
          <div style={{ marginBottom: '8px' }}><strong>Minimum age requirements:</strong></div>
          <ul style={{ paddingLeft: '20px', margin: 0, marginBottom: '16px' }}>
            <li style={{ marginBottom: '4px' }}><strong>United Kingdom:</strong> 16 years or older</li>
            <li style={{ marginBottom: '4px' }}><strong>Kenya:</strong> 18 years or older (or with parental consent)</li>
            <li style={{ marginBottom: '4px' }}><strong>United States:</strong> 13 years or older (users under 13 are strictly prohibited under US federal law)</li>
            <li><strong>All other countries:</strong> 16 years or older</li>
          </ul>
          <p style={{ margin: 0 }}>
            If you do not meet the minimum age requirement for your country, you may not use Chapter.
          </p>
        </PolicySection>

        <PolicySection title="2. What Chapter is">
          Chapter is a personal productivity and wellness app.
          It is not a medical or mental health service.
          It is not a substitute for professional medical advice.
        </PolicySection>

        <PolicySection title="3. Your account">
          You are responsible for keeping your login credentials secure.
          You may only create one account per person.
          You must provide accurate information during signup.
        </PolicySection>

        <PolicySection title="4. Your content">
          You own everything you create in Chapter (goals, letters, notes).
          We do not claim any ownership over your personal content.
          We use your content only to provide the service to you.
        </PolicySection>

        <PolicySection title="5. Acceptable use">
          You may not use Chapter to store illegal content.
          You may not attempt to access other users' accounts or data.
          You may not use Chapter for any commercial purpose without permission.
        </PolicySection>

        <PolicySection title="6. Our service">
          We provide Chapter on an "as is" basis.
          We aim for 99% uptime but cannot guarantee uninterrupted service.
          We may update or change features with notice where possible.
        </PolicySection>

        <PolicySection title="7. Liability limitation">
          Chapter is not liable for any indirect or consequential losses.
          Our total liability is limited to the amount you paid us in the
          last 12 months (or £0 if you're on the free tier).
        </PolicySection>

        <PolicySection title="8. Mental health disclaimer">
          Chapter is a wellness and goal tracking tool, not a medical device.
          If you are experiencing a mental health crisis, please contact:<br/><br/>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <li style={{ marginBottom: '8px' }}><strong>Samaritans:</strong> 116 123 (free, 24/7)</li>
            <li style={{ marginBottom: '8px' }}><strong>Crisis text line:</strong> Text SHOUT to 85258</li>
            <li><strong>NHS urgent mental health:</strong> 111</li>
          </ul><br/>
          Chapter is not a substitute for professional support.
        </PolicySection>

        <PolicySection title="9. Termination">
          You may delete your account at any time.
          We may suspend accounts that violate these terms.
          On deletion, your data is removed within 30 days.
        </PolicySection>

        <PolicySection title="10. Governing law">
          <p style={{ marginBottom: '16px', marginTop: 0 }}>
            These Terms are primarily governed by the laws of England and Wales.
          </p>
          <div style={{ marginBottom: '8px' }}><strong>Additionally:</strong></div>
          <ul style={{ paddingLeft: '20px', margin: 0, marginBottom: '16px' }}>
            <li style={{ marginBottom: '4px' }}>Users in Kenya are subject to the Kenya Data Protection Act 2019 and may raise data protection complaints with the ODPC at odpc.go.ke</li>
            <li style={{ marginBottom: '4px' }}>Users in California, USA have additional rights under the California Consumer Privacy Act (CCPA/CPRA) as described in our Privacy Policy</li>
            <li style={{ marginBottom: '4px' }}>Users under 13 in the United States may not use Chapter under any circumstances (COPPA compliance)</li>
            <li>Users under 18 in Kenya require parental or guardian consent</li>
          </ul>
          <p style={{ margin: 0 }}>
            For any legal disputes, the courts of England and Wales have primary jurisdiction, without prejudice to mandatory local consumer protection rights in your country.
          </p>
        </PolicySection>

        <PolicySection title="11. Contact">
          lindamosomisagwe@gmail.com
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
