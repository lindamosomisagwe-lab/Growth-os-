import React from 'react';

export default function Logo({ size = 40, color = 'var(--text-primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="40" r="30" stroke={color} strokeWidth="6" />
      <line x1="25" y1="85" x2="75" y2="85" stroke={color} strokeWidth="6" />
    </svg>
  );
}
