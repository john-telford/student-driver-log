import React from 'react';

export function SignPanel({ children, style }) {
  return (
    <span
      style={{
        display: 'inline-block',
        background: 'var(--primary)', color: '#fff',
        fontFamily: 'var(--font-sans)', fontWeight: 700,
        letterSpacing: 'var(--tracking-sign)', textTransform: 'uppercase',
        border: '3px solid var(--green-rule)', borderRadius: 'var(--radius-chip)',
        padding: '8px 20px', ...style,
      }}
    >
      {children}
    </span>
  );
}
