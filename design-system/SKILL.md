---
name: student-driver-log-design
description: Use this skill to generate well-branded interfaces and assets for Student Driver Log, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for protoyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Where things are

- `readme.md` — the design guide: brand context, content fundamentals, visual foundations, iconography, index. Read this first.
- `styles.css` — link this one file to get every token; it is `@import`s only.
- `tokens/` — colors, typography, spacing, radii, elevation, motion, fonts.
- `assets/` — the four real brand graphics. There is no logo; use the wordmark in type.
- `components/core|brand|navigation/` — React primitives, each with a `.d.ts` and a `.prompt.md`.
- `ui_kits/web/` and `ui_kits/ios/` — full-screen recreations; open their `index.html`.
- `guidelines/*.card.html` — specimen cards you can open to see any foundation rendered.

## Non-negotiables

Interstate green `#006B3C` and highway yellow `#FFCD00` only; white backgrounds; Overpass; UPPERCASE labels with wide tracking; 4px radius on controls; hairline borders instead of shadows; no gradients, no blur, no imagery, no emoji, no icon library.
