import React from 'react';

export function Card({ children, title, action, padded = true, style }) {
  return (
    <div
      style={{
        background: 'var(--card)',
        color: 'var(--card-foreground)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-control)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16, padding: padded ? '16px 24px' : '16px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <h2 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', color: 'var(--foreground)' }}>{title}</h2>
          {action}
        </div>
      )}
      <div style={{ padding: padded ? 24 : 0 }}>{children}</div>
    </div>
  );
}
