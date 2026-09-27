# iOS UI Kit — Student Driver Log on iPhone

**Status: the iOS app is not built yet.** `_bmad-output/planning-artifacts/architecture.md` scopes v1 as *API enablement* — REST endpoints under `/api/v1` for a future client — and explicitly defers "the iOS client codebase itself" to a separate effort (Expo vs SwiftUI undecided). Parent-on-iOS is future scope; the first client logs in as the student.

What exists on iPhone today is the PWA: `src/app/manifest.ts` declares `display: standalone`, `orientation: portrait`, `theme_color: #006B3C`, `start_url: /dashboard`, and the FAQ walks families through Share → Add to Home Screen in Safari.

This kit therefore recreates the **phone-width layout of the existing screens** inside a device frame — the app's own mobile nav (`app-nav.tsx` `<details>` panel), stacked dashboard, full-width form buttons. Nothing here is a new design. When a real client is built, replace this kit with a recreation of it.

- `MobileApp.jsx` — mobile shell + all four routes
- `ios-frame.jsx` — generic device bezel (not brand material)
- Data comes from `../web/data.jsx`
