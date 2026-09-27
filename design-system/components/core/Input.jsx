import React from 'react';

export function Input({ type = 'text', value, defaultValue, placeholder, name, id, disabled, invalid, onGreen = false, onChange, style }) {
  const [focus, setFocus] = React.useState(false);
  const base = {
    display: 'block', width: '100%', boxSizing: 'border-box',
    fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
    padding: '8px 12px', borderRadius: 'var(--radius-control)', outline: 'none',
    transition: 'var(--transition-color)',
  };
  const skin = onGreen
    ? { background: 'oklch(1 0 0 / 10%)', color: '#fff', border: '1px solid ' + (focus ? 'var(--accent)' : 'var(--on-green-rule)'), boxShadow: focus ? '0 0 0 1px var(--accent)' : 'none' }
    : { background: 'transparent', color: 'var(--foreground)', border: '1px solid ' + (invalid ? 'var(--destructive)' : focus ? 'var(--primary)' : 'var(--input)'), boxShadow: focus ? '0 0 0 1px var(--primary)' : 'none' };
  return (
    <input
      type={type} name={name} id={id} value={value} defaultValue={defaultValue}
      placeholder={placeholder} disabled={disabled} onChange={onChange}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{ ...base, ...skin, opacity: disabled ? 0.5 : 1, ...style }}
    />
  );
}
