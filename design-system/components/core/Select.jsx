import React from 'react';

export function Select({ options = [], value, defaultValue, placeholder = 'Select…', name, id, disabled, invalid, onGreen = false, onChange, style }) {
  const [focus, setFocus] = React.useState(false);
  const skin = onGreen
    ? { background: 'oklch(1 0 0 / 10%)', color: '#fff', border: '1px solid ' + (focus ? 'var(--accent)' : 'var(--on-green-rule)') }
    : { background: 'transparent', color: 'var(--foreground)', border: '1px solid ' + (invalid ? 'var(--destructive)' : focus ? 'var(--primary)' : 'var(--input)') };
  return (
    <select
      name={name} id={id} value={value} defaultValue={defaultValue} disabled={disabled} onChange={onChange}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{
        display: 'block', width: '100%', boxSizing: 'border-box',
        fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
        padding: '8px 12px', borderRadius: 'var(--radius-control)', outline: 'none',
        opacity: disabled ? 0.5 : 1, ...skin, ...style,
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
