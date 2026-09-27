// Reads colour tokens straight out of globals.css so the /brand page can't
// drift from what the app actually renders.

export function parseRootTokens(css: string): Record<string, string> {
  const root = css.match(/:root\s*\{([^}]*)\}/)?.[1] ?? '';
  const tokens: Record<string, string> = {};
  for (const [, name, value] of root.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    tokens[name] = value.trim();
  }
  return tokens;
}

// OKLCH → sRGB hex (Björn Ottosson's OKLab matrices). Returns null for
// anything that isn't a plain `oklch(L C H)` value.
export function oklchToHex(value: string): string | null {
  const m = value.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/);
  if (!m) return null;
  const [L, C, H] = m.slice(1).map(Number);
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const linear = [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ];

  return (
    '#' +
    linear
      .map((x) => {
        const c = Math.min(1, Math.max(0, x));
        const srgb = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
        return Math.round(srgb * 255).toString(16).padStart(2, '0');
      })
      .join('')
      .toUpperCase()
  );
}
