import React from 'react';

export function ProgressBar({ label, percent = 0, remaining, tooltip, tone = 'primary', caption }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-sans)' }}>
      {(label || remaining) && (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', color: 'var(--foreground)' }}>{label}</p>
          {remaining && <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{remaining}</p>}
        </div>
      )}
      <div style={{ position: 'relative' }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <div style={{ height: 16, width: '100%', borderRadius: 'var(--radius-pill)', background: 'var(--muted)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%', width: Math.max(0, Math.min(100, percent)) + '%',
              borderRadius: 'var(--radius-pill)',
              background: tone === 'accent' ? 'var(--accent)' : 'var(--primary)',
              transition: 'var(--transition-progress)',
            }}
          />
        </div>
        {tooltip && hover && (
          <div
            style={{
              position: 'absolute', left: 0, top: -32, pointerEvents: 'none',
              background: 'var(--popover)', color: 'var(--popover-foreground)',
              borderRadius: 'var(--radius-control)', padding: '4px 8px',
              fontSize: 'var(--text-xs)', boxShadow: 'var(--shadow-md)', whiteSpace: 'nowrap',
            }}
          >
            {tooltip}
          </div>
        )}
      </div>
      {caption && <p style={{ margin: 0, textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{caption}</p>}
    </div>
  );
}
