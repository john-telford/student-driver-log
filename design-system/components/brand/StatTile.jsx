import React from 'react';

export function StatTile({ label, value, style }) {
  return (
    <div
      style={{
        border: '1px solid var(--border)', borderRadius: 'var(--radius-control)',
        padding: 16, textAlign: 'center', fontFamily: 'var(--font-sans)', ...style,
      }}
    >
      <p style={{ margin: 0, fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', color: 'var(--muted-foreground)' }}>{label}</p>
      <p style={{ margin: '4px 0 0', fontSize: 'var(--text-2xl)', fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: 'var(--foreground)' }}>{value}</p>
    </div>
  );
}
