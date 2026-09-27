import React from 'react';

export function BrandMark({ variant = 'wordmark', size = 32, color = 'currentColor', assetBase = '../../assets' }) {
  if (variant === 'wheel') {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ color }} aria-label="Student Driver Log">
        <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="8" />
        <line x1="50" y1="6" x2="50" y2="34" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
        <line x1="50" y1="66" x2="50" y2="94" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
        <line x1="6" y1="50" x2="34" y2="50" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
        <line x1="66" y1="50" x2="94" y2="50" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
        <circle cx="50" cy="50" r="9" fill="currentColor" />
      </svg>
    );
  }
  if (variant === 'shield') {
    return <img src={assetBase + '/illinois-shield.svg'} width={size} height={size} alt="Illinois Route 101" style={{ filter: 'drop-shadow(0 2px 3px oklch(0 0 0 / 25%))' }} />;
  }
  return (
    <span
      style={{
        fontFamily: 'var(--font-sans)', fontWeight: 900, textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-widest)', fontSize: size, lineHeight: 1.2, color,
      }}
    >
      Student Driver Log
    </span>
  );
}
