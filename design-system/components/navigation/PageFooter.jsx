import React from 'react';

export function PageFooter({ links = ['About', 'Privacy', 'Terms', 'FAQ'], version, maxWidth = 896 }) {
  return (
    <footer style={{ borderTop: '1px solid oklch(0 0 0 / 10%)', padding: '16px 0', marginTop: 16, fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth, margin: '0 auto', padding: '0 16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {links.map((l) => (
            <a key={l} href="#" style={{ fontSize: 'var(--text-micro)', color: 'oklch(0 0 0 / 40%)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
        {version && (
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'oklch(0 0 0 / 30%)' }}>{version}</span>
        )}
      </div>
    </footer>
  );
}
