import React from 'react';

export function Label({ children, htmlFor, hint, onGreen = false, style }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: 'block',
        fontFamily: 'var(--font-sans)',
        fontSize: onGreen ? 'var(--text-2xs)' : 'var(--text-xs)',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: onGreen ? 'var(--tracking-widest)' : 'var(--tracking-wider)',
        color: onGreen ? 'var(--on-green-secondary)' : 'var(--foreground)',
        marginBottom: 4,
        ...style,
      }}
    >
      {children}
      {hint && (
        <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--muted-foreground)' }}> {hint}</span>
      )}
    </label>
  );
}
