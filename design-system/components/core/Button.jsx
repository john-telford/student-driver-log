import React from 'react';

const SIZES = {
  sm: { padding: '4px 12px', fontSize: 'var(--text-xs)', fontWeight: 900 },
  md: { padding: '10px 16px', fontSize: 'var(--text-sm)', fontWeight: 700 },
  lg: { padding: '10px 24px', fontSize: 'var(--text-sm)', fontWeight: 700 },
};

const VARIANTS = {
  primary: { background: 'var(--primary)', color: 'var(--primary-foreground)', border: '1px solid transparent' },
  accent: { background: 'var(--accent)', color: 'var(--accent-foreground)', border: '1px solid transparent', fontWeight: 900 },
  outline: { background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)' },
  destructive: { background: 'var(--destructive)', color: '#fff', border: '1px solid transparent' },
  onGreen: { background: 'var(--accent)', color: 'var(--accent-foreground)', border: '1px solid transparent', fontWeight: 900 },
  link: { background: 'transparent', color: 'var(--primary)', border: '1px solid transparent', padding: 0, textDecoration: 'none' },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  as = 'button',
  href,
  onClick,
  type = 'button',
  style,
}) {
  const [hover, setHover] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const filled = variant === 'primary' || variant === 'accent' || variant === 'destructive' || variant === 'onGreen';
  const css = {
    display: fullWidth ? 'block' : 'inline-block',
    width: fullWidth ? '100%' : undefined,
    textAlign: 'center',
    fontFamily: 'var(--font-sans)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--tracking-widest)',
    borderRadius: 'var(--radius-control)',
    lineHeight: 1.2,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'opacity var(--duration-base) var(--ease-default), background-color var(--duration-base) var(--ease-default)',
    ...s,
    ...v,
    opacity: disabled ? 0.5 : filled && hover ? 0.9 : 1,
    background: !filled && hover && variant === 'outline' ? 'var(--muted)' : v.background,
    textDecoration: variant === 'link' && hover ? 'underline' : v.textDecoration,
    ...style,
  };
  const Tag = as === 'a' ? 'a' : 'button';
  return (
    <Tag
      href={as === 'a' ? href : undefined}
      type={Tag === 'button' ? type : undefined}
      disabled={Tag === 'button' ? disabled : undefined}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={css}
    >
      {children}
    </Tag>
  );
}
