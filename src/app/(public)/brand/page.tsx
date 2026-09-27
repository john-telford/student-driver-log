import type { Metadata } from 'next';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { marked } from 'marked';
import { parseRootTokens, oklchToHex } from './tokens';

// Machine-readable brand page for tools that ingest a URL (e.g. ElevenLabs
// brand kits). Everything is read from the repo at build time — the guide from
// design-system/readme.md, colours from globals.css — so there is no copy to drift.

export const metadata: Metadata = {
  title: 'Brand — Student Driver Log',
  description:
    'Design system for Student Driver Log: colours, type, graphics, voice and visual rules.',
  robots: { index: false, follow: false },
};

const SWATCHES = [
  { token: 'primary', name: 'Interstate Green', role: 'Primary. Header, sign panels, headings.' },
  { token: 'accent', name: 'Highway Yellow', role: 'The one attention colour. Primary CTA, header rule.' },
  { token: 'foreground', name: 'Body Green', role: 'Body text. Dark green, never black.' },
  { token: 'secondary', name: 'Deep Green', role: 'Nav surfaces.' },
  { token: 'destructive', name: 'Traffic Red', role: 'The only alert hue.' },
  { token: 'muted', name: 'Panel Gray', role: 'Panel fills, zebra rows.' },
  { token: 'border', name: 'Hairline', role: 'Card, table and input borders.' },
  { token: 'background', name: 'White', role: 'Every background.' },
];

const GRAPHICS = [
  { file: 'app-icon.svg', name: 'App icon' },
  { file: 'steering-wheel.svg', name: 'Steering wheel' },
  { file: 'illinois-shield.svg', name: 'Illinois shield' },
  { file: 'icon-menu.svg', name: 'Menu' },
  { file: 'icon-close.svg', name: 'Close' },
];

const DS = join(process.cwd(), 'design-system');

export default async function BrandPage() {
  const [css, readme, svgs] = await Promise.all([
    readFile(join(process.cwd(), 'src/app/globals.css'), 'utf8'),
    readFile(join(DS, 'readme.md'), 'utf8'),
    Promise.all(GRAPHICS.map((g) => readFile(join(DS, 'assets', g.file), 'utf8'))),
  ]);
  const tokens = parseRootTokens(css);
  // Drop the readme's own H1; this page supplies the title.
  const guideHtml = await marked.parse(readme.replace(/^# .*\n/, ''));

  return (
    <div className="space-y-12 text-sm leading-relaxed text-black/80">
      <div className="space-y-2">
        <h1 className="text-2xl font-black uppercase tracking-widest text-primary">Brand</h1>
        <p className="text-black/40 text-xs uppercase tracking-widest">
          Student Driver Log — Design System
        </p>
        <p>
          An Illinois highway guide sign: interstate green, highway yellow, Overpass lettering,
          white backgrounds. Nothing decorative on top. Source files live in the{' '}
          <a
            href="https://github.com/john-telford/student-driver-log/tree/main/design-system"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-bold underline underline-offset-2 hover:opacity-70"
          >
            design-system folder on GitHub
          </a>
          .
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="font-black uppercase tracking-widest text-primary">Colour</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SWATCHES.map(({ token, name, role }) => (
            <li key={token} className="space-y-2">
              <div
                className="h-16 rounded border border-border"
                style={{ backgroundColor: `var(--${token})` }}
              />
              <p className="font-bold uppercase tracking-wide text-primary text-xs">{name}</p>
              <p className="font-mono text-xs">{oklchToHex(tokens[token] ?? '') ?? tokens[token]}</p>
              <p className="text-xs text-black/60">{role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-black uppercase tracking-widest text-primary">Type — Overpass</h2>
        <div className="space-y-3 text-primary">
          <p className="text-3xl font-black uppercase tracking-widest">Student Driver Log</p>
          <p className="text-base font-bold uppercase tracking-wider">50-Hour Requirement</p>
          <p className="text-base text-foreground">
            Body copy is sentence case at 400. Labels are uppercase at 700 with wide tracking;
            titles and figures are 900.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-black uppercase tracking-widest text-primary">Graphics</h2>
        <ul className="flex flex-wrap gap-8 text-primary">
          {GRAPHICS.map((g, i) => (
            <li key={g.file} className="space-y-2 text-center">
              {/* Trusted SVGs from design-system/assets, inlined at build time. */}
              <div
                className="size-14 mx-auto [&_svg]:size-full"
                dangerouslySetInnerHTML={{ __html: svgs[i] }}
              />
              <p className="text-xs uppercase tracking-wide text-black/60">{g.name}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-black uppercase tracking-widest text-primary">Design guide</h2>
        {/* Rendered from design-system/readme.md at build time; repo-controlled content. */}
        <div
          className="space-y-4
            [&_h2]:pt-4 [&_h2]:font-black [&_h2]:uppercase [&_h2]:tracking-widest [&_h2]:text-primary
            [&_h3]:pt-2 [&_h3]:font-bold [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:text-primary
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5
            [&_strong]:text-primary [&_hr]:border-border
            [&_code]:font-mono [&_code]:text-xs [&_code]:bg-muted/40 [&_code]:px-1 [&_code]:rounded
            [&_table]:w-full [&_table]:text-xs [&_th]:text-left [&_th]:uppercase [&_th]:tracking-wide
            [&_th]:bg-muted/40 [&_th]:p-2 [&_td]:p-2 [&_td]:align-top [&_tr]:border-b [&_tr]:border-border"
          dangerouslySetInnerHTML={{ __html: guideHtml }}
        />
      </section>
    </div>
  );
}
