import React from 'react';

const TONES = {
  success: { border: 'var(--primary)', bar: 'var(--primary)' },
  error: { border: 'var(--destructive)', bar: 'var(--destructive)' },
  info: { border: 'var(--border)', bar: 'var(--accent)' },
};

export function Toast({ title, description, tone = 'success' }) {
  const t = TONES[tone] || TONES.success;
  return (
    <div
      style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        minWidth: 260, maxWidth: 360, padding: '12px 14px',
        background: 'var(--popover)', color: 'var(--popover-foreground)',
        border: '1px solid ' + t.border, borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)', fontFamily: 'var(--font-sans)',
      }}
    >
      <span style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, background: t.bar, flexShrink: 0 }} />
      <div>
        <p style={{ margin: 0, fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)' }}>{title}</p>
        {description && <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>{description}</p>}
      </div>
    </div>
  );
}
