# Student Driver Log — Design System

The design guide for **Student Driver Log** (studentdriver.site), a free web app for tracking Illinois learner's-permit behind-the-wheel practice hours. Illinois requires 50 supervised hours, 10 of them at night, before a student can take the road test; the app replaces the paper Illinois SOS form **DSD X 152.4** with a digital tracker that prints and exports as a PDF in the same format.

It is a personal project — the author built it to track his son's hours, then opened it up. Parents self-register and create student accounts; students log in separately and log their own trips.

Everything in this system was read out of the product's source, not invented.

## Sources

| Source | What was read |
|---|---|
| Local codebase `student-driver-log/` (Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui, Drizzle + libSQL, Auth.js v5) | `src/app/globals.css` (the entire colour/radius token set), `src/app/layout.tsx` (fonts), every route under `src/app/(app)`, `(auth)`, `(public)`, `src/components/ui/*`, `src/app/icon.tsx` / `opengraph-image.tsx` / `manifest.ts`, `docs/*.md`, `_bmad-output/planning-artifacts/*` |
| Live site referenced in-product | `studentdriver.site` |

No Figma file, no slide deck, no brand book was provided.

## Products

1. **Website / web app** (`ui_kits/web/`) — the whole product. Public pages (About, FAQ, Privacy, Terms), auth (login, register, forgot/reset password), and the signed-in app: dashboard, trips list, trip form, Illinois SOS report, settings.
2. **iOS** (`ui_kits/ios/`) — **not built yet.** The planning docs scope v1 as REST API enablement (`/api/v1`) for a future client; the client codebase (Expo vs SwiftUI) is an open, later decision. What runs on iPhone today is the PWA installed via Safari's *Add to Home Screen* (`manifest.ts`: standalone, portrait, `#006B3C`). The iOS kit recreates the existing mobile-width screens in a device frame and says so on the card.

---

## Content fundamentals

**The voice is a road sign: short, upper-case, factual.** Interface text is set in caps with wide tracking and heavy weight; prose is plain lowercase sentences.

- **Casing.** Every label, heading, button, nav link, table header and eyebrow is UPPERCASE. Body copy and helper text are sentence case. Nothing is title-cased in headings.
- **Person.** Product UI addresses the user in second person and stays terse: "Welcome back, John.", "Select a student to view progress.", "No trips yet. Log the first one." Marketing and About pages switch to first person singular — the author speaking: "So I built something better." "This one is mine, and now yours too if it's useful."
- **Length.** Labels are 1–3 words ("Daytime", "50-Hour Requirement", "+ Log Trip"). Empty states are one sentence plus a link. Confirmations state the consequence in full: *"Delete the 2026-08-14 trip (Highway, Clear, 1h 20m total)? This cannot be undone."*
- **Punctuation.** Ellipses use the single character and mark pending or open states: "Saving…", "Signing In…", "Select…". Em dashes separate a subject from its qualifier: "Progress — Jimmy Telford", "Illinois Secretary of State — DSD X 152.4". An em dash alone (—) is the zero value in tables. Arrows (→) bullet feature lists.
- **Numbers.** Durations are `H:MM` in totals and reports (`37:30`) and human short form in lists (`1h 20m`, `45m`). Progress is always given twice — a percentage caption and a human remainder ("12h 30m left", "Complete").
- **Legal honesty is part of the voice.** Requirements are hedged and sourced: "Based on our best understanding…", "Requirements can change. Always verify the current rules with the Illinois Secretary of State… Use this app at your own risk."
- **Free is stated plainly:** "Free — no subscriptions, no ads, no account required beyond your own login."
- **Errors** are one short sentence, sentence case, no blame, no exclamation marks.
- **No emoji, ever.** The only pictographic characters are `✓` (success), `→` (list bullet), `—` (empty value), and `+` prefixing create actions ("+ Log Trip", "+ Add a Student").
- **Wordmark** is always written "Student Driver Log" in full; "Driver Log" only as the home-screen short name.

## Visual foundations

**One idea drives everything: an Illinois highway guide sign.** Interstate green, FHWA yellow, Highway Gothic lettering, white reflective borders. Nothing decorative gets added on top.

- **Colour.** Pantone 342 interstate green `#006B3C` (`--primary`) and FHWA warning yellow `#FFCD00` (`--accent`). Green carries chrome, headers and body text (body copy is `oklch(0.38 0.15 148)` — dark green, never black). Yellow is the single attention colour: the primary CTA, the 4px rule under the header, links on green panels, the 10-hour night progress bar. Traffic-sign red `oklch(0.55 0.22 25)` is the only alert hue — there is no info blue, no warning orange, no success green beyond the primary. Dark mode is not supported.
- **Backgrounds are plain white.** No gradients, no textures, no patterns, no photography, no illustration anywhere in the product. The only large colour fields are the green header bar and the green sign panels.
- **Type.** Overpass everywhere (the open-source Highway Gothic / FHWA Series E Modified clone), Overpass Mono only for build stamps. 400 for prose, 700 for labels, 900 for titles, figures and the wordmark. Tracking does the shouting: `0.05em` on labels, `0.1em` on nav and buttons, `0.2em` on eyebrows.
- **Spacing.** Tailwind's 4px scale. 24px card padding, 16px grid gaps, 32px between page sections, 16px page gutters. 6px is the one off-scale value: the white reflective frame around a sign card. Content columns are fixed: 896px signed-in, 768px public, 384px auth.
- **Cards** are white, a 1px `--border` hairline, 4px radius, **no shadow**. Header rows are separated by another hairline. Tables sit flush inside them with no body padding. The shadcn `Card` primitive in the repo uses a larger radius and a `ring-foreground/10` — the app's own pages don't use it, so hairline-and-4px is the house style.
- **Radii.** 4px on controls (buttons, inputs, table chrome), 8px base, 17.6px on the outer sign frame with a 19.2px green panel inside, full pill on progress bars. Nothing is more rounded than that.
- **Shadows.** Essentially absent. The one real shadow is `0 8px 32px oklch(0.36 0.12 152 / 25%)` — a soft green cast beneath a sign card. Tooltips and toasts take a small neutral shadow. No inner shadows, no glows.
- **Borders carry the hierarchy.** 1px hairlines for cards, tables and inputs; 3px black keyline around a sign card; 3px light-green keyline on a sign badge; 4px yellow rule under the header; 2px 40%-red border around a danger zone; 2px 30%-white divider inside a green panel.
- **Transparency and blur.** No blur, ever — no frosted glass, no backdrop filters. Transparency is used only as white-on-green opacity tiers (100 / 80 / 60 / 30%), black-on-white at 80 / 40 / 30 / 10% on public pages, and low-percentage `--muted` fills for zebra rows (20%) and table headers (40%). Inputs on green panels are 10% white.
- **Animation is nearly absent.** One transition matters: the progress-bar fill width, 200ms `cubic-bezier(.4,0,.2,1)`. Colours and opacity fade over the same 200ms. Nothing enters, nothing bounces, nothing fades in on scroll. The mobile nav and dashboard tooltips are pure CSS (`<details>`, `group-hover`) and appear instantly.
- **Hover** dims filled buttons to 90% opacity, fills outline buttons with `--muted`, underlines text links, and moves white-on-green text from 80% to 100%. **Press** is either nothing or, on the shadcn primitive, a 1px downward nudge. No scaling, no shrinking, no colour inversion.
- **Focus** is a 1px border swap to `--primary` (or `--accent` on green) plus a 1px ring of the same colour; the shadcn primitives use a 3px 50%-opacity ring.
- **Layout rules.** Header is 56px, always green with the yellow rule. Content is a single centred column — no sidebars, no multi-pane layouts, no sticky footers. Footers are a 10%-black hairline with 10px uppercase legal links and an optional monospace version stamp. The print stylesheet strips the header and all `print:hidden` chrome and lets the report table run full width.
- **Imagery.** There is none. No photos, no stock, no illustration, no icon-driven empty states. Where a picture would go, the product puts a green sign panel or a table.

## Iconography

Deliberately, almost aggressively minimal — the product ships **four** graphics in total and no icon library.

- **No icon set, no icon font, no CDN.** Nothing from Lucide, Heroicons, Feather or Font Awesome; the repo has no icon dependency. Icons are inline SVG written by hand in the component that needs them.
- **The set** (all in `assets/`, transcribed from the source's inline SVG):
  - `steering-wheel.svg` — the favicon (`src/app/icon.tsx`), apple touch icon and OG mark. A ring plus four spokes, 7–10px stroke on a 100-unit box, round caps.
  - `app-icon.svg` — the same wheel, white on a `#006B3C` rounded square, as the home-screen tile.
  - `illinois-shield.svg` — the Illinois state route marker on the login sign: white rounded square, 5px black border, "ILLINOIS 101" set in Overpass 800/900.
  - `icon-menu.svg` / `icon-close.svg` — the mobile nav hamburger and close, 24px, 2.5px stroke, round caps, `currentColor` (from `app-nav.tsx`).
- **Stroke language.** 2.5px round-cap strokes at 24px for UI glyphs; heavier strokes for the brand wheel. No fills, no duotone, no rounded-square backplates except the app tile.
- **Unicode does the rest.** `✓` for success, `→` for list bullets, `—` for empty values, `+` prefixes on create actions. These are set in Overpass as type, not as icons.
- **No emoji.** Anywhere.
- If a new glyph is genuinely needed, draw it at 24px on a 2.5px round-cap stroke in `currentColor` and add it to `assets/` — do not import a library.

### Missing brand material

- **There is no logo.** The product signs itself with the uppercase wordmark; the steering wheel is an app icon, not a mark. Nothing here was drawn from imagination — where a logo would go, use `BrandMark variant="wordmark"`.
- **No local font binaries.** The app loads Overpass and Overpass Mono through `next/font/google`, so `tokens/fonts.css` links the same Google Fonts CDN faces (400/600/700/800/900 + mono 400/600). Self-hosted `.woff2` files can be dropped in and swapped for the `@import` at any time. Note that Tailwind's `font-black` asks for 900 while the app requests only up to 800 — 900 is included here so headings render as designed.
- **No photography or illustration** exists to copy.

---

## Index

| Path | What it is |
|---|---|
| `styles.css` | The one file consumers link — `@import`s only |
| `tokens/` | `colors.css`, `typography.css`, `spacing.css`, `radii.css`, `elevation.css`, `motion.css`, `fonts.css` |
| `assets/` | `steering-wheel.svg`, `app-icon.svg`, `illinois-shield.svg`, `icon-menu.svg`, `icon-close.svg` |
| `guidelines/` | Specimen cards (Colors, Type, Spacing, Brand) shown on the Design System tab |
| `components/` | React primitives, grouped below |
| `ui_kits/web/` | Click-through recreation of the web app — start at `index.html` |
| `ui_kits/ios/` | The installed PWA on iPhone (see its README for scope) |
| `thumbnail.html` | Homepage tile |
| `SKILL.md` | Agent-skill entry point |

### Components

**core/** — `Button`, `Input`, `Label`, `Select`, `Textarea`, `Card`, `Table`, `Dialog`, `Toast`
**brand/** — `SignCard`, `SignPanel`, `ProgressBar`, `StatTile`, `BrandMark`
**navigation/** — `AppHeader`, `PageFooter`

The source inventory is the shadcn set the repo actually installed (Button, Card, Dialog, Input, Label, Sonner→`Toast`, Table) plus the patterns the app pages build inline.

**Intentional additions** — each one exists in the product as repeated inline markup, promoted here so kits don't re-implement it:

- `Select`, `Textarea` — native controls styled to match `Input` in the trip form and student switcher; no shadcn equivalent was installed.
- `SignCard`, `SignPanel` — the `.sign-card` / `.sign-panel` utilities from `globals.css`.
- `ProgressBar`, `StatTile` — the dashboard's 50-hour and 10-hour bars and its three-up totals row.
- `AppHeader`, `PageFooter` — the app layout's header and footer, plus `AppNav`.
- `BrandMark` — a wrapper over the three existing marks, so nobody invents a logo.

Nothing else was added. No Avatar, Tabs, Tooltip-as-component, Accordion or Breadcrumb — the product has none.

Each component directory also has `<Name>.d.ts` (props contract) and `<Name>.prompt.md` (one-line what/when, a usage example, and the variants that matter).
