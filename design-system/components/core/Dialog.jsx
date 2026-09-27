import React from 'react';

export function Dialog({ open = true, title, description, children, footer, onClose }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{ position: 'absolute', inset: 0, background: 'oklch(0 0 0 / 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 448, background: 'var(--popover)', color: 'var(--popover-foreground)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)', padding: 24,
          display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'var(--font-sans)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {title && <h2 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>{title}</h2>}
          {description && <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', color: 'var(--muted-foreground)' }}>{description}</p>}
        </div>
        {children}
        {footer && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>{footer}</div>}
      </div>
    </div>
  );
}
