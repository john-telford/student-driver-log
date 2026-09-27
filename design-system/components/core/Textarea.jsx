import React from 'react';

export function Textarea({ rows = 3, value, defaultValue, placeholder, name, id, maxLength, disabled, invalid, onChange, style }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <textarea
      rows={rows} name={name} id={id} value={value} defaultValue={defaultValue}
      placeholder={placeholder} maxLength={maxLength} disabled={disabled} onChange={onChange}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{
        display: 'block', width: '100%', boxSizing: 'border-box', resize: 'none',
        fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
        padding: '8px 12px', borderRadius: 'var(--radius-control)', outline: 'none',
        background: 'transparent', color: 'var(--foreground)',
        border: '1px solid ' + (invalid ? 'var(--destructive)' : focus ? 'var(--primary)' : 'var(--input)'),
        opacity: disabled ? 0.5 : 1, ...style,
      }}
    />
  );
}
