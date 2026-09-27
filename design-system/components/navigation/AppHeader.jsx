import React from 'react';

export function AppHeader({ links = [], active, cta, right, maxWidth = 896, onNavigate }) {
  return (
    <header style={{ background: 'var(--primary)', borderBottom: 'var(--border-rule) solid var(--accent)', position: 'relative' }}>
      <div
        style={{
          maxWidth, margin: '0 auto', padding: '0 16px', height: 'var(--header-height)',
          display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-sans)',
        }}
      >
        <span style={{ color: '#fff', fontWeight: 900, fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', flexShrink: 0 }}>
          Student Driver Log
        </span>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href || '#'}
              onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate(l); } }}
              style={{
                color: active === l.label ? '#fff' : 'var(--on-green-secondary)',
                fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-widest)', textDecoration: 'none',
              }}
            >
              {l.label}
            </a>
          ))}
          {cta}
          <span style={{ flex: 1 }} />
          {right}
        </nav>
      </div>
    </header>
  );
}
