import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseRootTokens, oklchToHex } from './tokens';

describe('parseRootTokens', () => {
  it('reads custom properties from the :root block only', () => {
    const css = `
      @theme inline { --color-primary: var(--primary); }
      :root {
        --primary: oklch(0.44 0.16 148); /* green */
        --radius:  0.5rem;
      }
      .dark { --primary: red; }
    `;
    expect(parseRootTokens(css)).toEqual({
      primary: 'oklch(0.44 0.16 148)',
      radius: '0.5rem',
    });
  });

  it('finds the brand tokens in the real globals.css', () => {
    const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
    const tokens = parseRootTokens(css);
    for (const name of ['primary', 'accent', 'foreground', 'destructive']) {
      expect(oklchToHex(tokens[name])).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it('renders interstate green exactly, not an approximation', () => {
    const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
    expect(oklchToHex(parseRootTokens(css).primary)).toBe('#006B3C');
  });

  it('keeps the whole green ramp on the interstate-green hue', () => {
    const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
    const greens = Object.entries(parseRootTokens(css)).filter(([, value]) => {
      const m = value.match(/^oklch\(\s*[\d.]+\s+([\d.]+)\s+([\d.]+)\s*\)$/);
      return m && Number(m[1]) >= 0.05 && Number(m[2]) >= 120;
    });
    // 7 aliases + the chart ramp + sidebar greens: if the filter silently
    // stopped matching, the loop below would pass on an empty list.
    expect(greens.length).toBeGreaterThanOrEqual(10);
    for (const [name, value] of greens) {
      expect(value, name).toMatch(/^oklch\([\d.]+ [\d.]+ 155\.4\)$/);
    }
  });
});

describe('oklchToHex', () => {
  it('converts known values', () => {
    expect(oklchToHex('oklch(1 0 0)')).toBe('#FFFFFF');
    expect(oklchToHex('oklch(0 0 0)')).toBe('#000000');
    expect(oklchToHex('oklch(0.88 0.18 89)')).toBe('#FFCF00');
  });

  it('returns null for non-oklch values', () => {
    expect(oklchToHex('0.5rem')).toBeNull();
    expect(oklchToHex('oklch(0.36 0.12 152 / 25%)')).toBeNull();
    expect(oklchToHex('#006B3C')).toBeNull();
  });
});
