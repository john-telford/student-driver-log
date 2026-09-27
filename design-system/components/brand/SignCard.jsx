import React from 'react';

export function SignCard({ children, width = 384, style }) {
  return (
    <div
      style={{
        width: '100%', maxWidth: width, boxSizing: 'border-box',
        padding: 6, background: '#fff',
        border: '3px solid #000', borderRadius: 'var(--radius-3xl)',
        boxShadow: 'var(--shadow-lg)', ...style,
      }}
    >
      <div
        style={{
          background: 'var(--primary)', borderRadius: 'var(--radius-panel)',
          padding: '28px 32px', color: 'var(--on-green-primary)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
