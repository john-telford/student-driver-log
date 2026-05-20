# Story 7.1: Public State Information Pages

Status: ready-for-dev

## Story

As a prospective user researching learner's permit requirements,
I want to browse a list of all states and view detailed requirements for my state without logging in,
so that I can confirm the app meets my needs before creating an account.

## Acceptance Criteria

1. `/states` renders a grid of all 51 jurisdictions without auth — each card shows: state name, total hours, night hours, permit age, whether log submission is required
2. Grid is sortable by hours required and filterable by "log required" / "no log required" / "no hour requirement"
3. `/states/[code]` renders full requirements for a valid state code; invalid code returns `notFound()`
4. State detail page includes: hours, supervisor rules, hold period, driver-ed impact, night driving definition, official form with link, source URL, "Start tracking" CTA linking to `/register?state=[code]`
5. Tier 2 state detail pages show IIHS disclaimer inline
6. Middleware matcher excludes `/states` and `/states/[code]` from auth guard
7. `/register` page reads `?state=[code]` query param and pre-selects that state (Story 2.2 dependency — coordinate at PR time)
8. `npm run build` and `npm test -- --run` pass

## Tasks / Subtasks

- [ ] Update `middleware.ts` matcher to exclude `/states` paths (AC: 6) — **coordinate with Story 2.1** which also modifies this file
- [ ] Create `src/app/(public)/states/page.tsx` — state list grid (AC: 1, 2)
- [ ] Create `src/app/(public)/states/[code]/page.tsx` — state detail (AC: 3-5)
- [ ] Verify `src/app/(public)/layout.tsx` already exists and requires no changes for states pages

## Dev Notes

### Prerequisites

Stories 1.2/1.3 must be complete — need the full STATE_CONFIGS populated.

### Middleware — Critical Note

`middleware.ts` is at the **project root** (not `src/`) at [middleware.ts](middleware.ts). The current matcher regex is:

```
'/((?!api/auth|_next/static|_next/image|favicon.ico|icon|apple-icon|login|register|forgot-password|reset-password|about|privacy|terms|faq).*)'
```

Add `states` to the exclusion list:

```
'/((?!api/auth|_next/static|_next/image|favicon.ico|icon|apple-icon|login|register|forgot-password|reset-password|about|privacy|terms|faq|states).*)'
```

**Story 2.1 also modifies this file** to add `/states` exclusions. Whoever merges second must rebase and resolve the conflict. Both stories add the same change — just ensure it's included once.

### (public) Route Group — Already Exists

`src/app/(public)/layout.tsx` already exists and provides the public header/footer (About, Privacy, Terms, FAQ). The states pages will automatically use this layout — no new layout file needed.

The existing public layout has `max-w-3xl` container. The states grid may need `max-w-5xl` — override in the page itself if needed.

### states/page.tsx — Server Component

```tsx
// src/app/(public)/states/page.tsx
import { STATE_CONFIGS, STATE_CODES } from '@/data/state-configs';
import Link from 'next/link';

// Build serialized list for the Client Component filter/sort
const stateList = STATE_CODES.map(code => {
  const cfg = STATE_CONFIGS[code];
  return {
    code,
    name: cfg.state_name,
    totalHours: cfg.total_hours_required,
    nightHours: cfg.nighttime_hours_required,
    validationMode: cfg.validation_mode,
    permitMinAge: cfg.permit_min_age,
    logSubmissionRequired: cfg.log_submission_required,
  };
}).sort((a, b) => a.name.localeCompare(b.name));

export default function StatesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-widest text-primary">State Requirements</h1>
        <p className="text-sm text-muted-foreground mt-1">Learner's permit practice hour requirements by state.</p>
      </div>
      <StatesGrid states={stateList} />
    </div>
  );
}
```

Extract `<StatesGrid>` as a Client Component to handle sort/filter state (URL searchParams or local state). Each card links to `/states/[code]`.

### states/[code]/page.tsx — Server Component

```tsx
// src/app/(public)/states/[code]/page.tsx
import { STATE_CONFIGS } from '@/data/state-configs';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function StateDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const cfg = STATE_CONFIGS[code.toUpperCase()];
  if (!cfg) notFound();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-widest text-primary">{cfg.state_name}</h1>
        <p className="text-sm text-muted-foreground">{cfg.state_agency}</p>
      </div>

      {/* Requirements */}
      <section className="rounded border border-border p-6 space-y-4">
        {cfg.validation_mode === 'none' ? (
          <p className="text-sm text-muted-foreground">
            {cfg.state_name} does not mandate logged practice hours. Tracking your practice is still encouraged.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Total Hours</p><p className="font-semibold">{cfg.total_hours_required}</p></div>
            <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Night Hours</p><p className="font-semibold">{cfg.nighttime_hours_required}</p></div>
            {cfg.inclement_hours_required > 0 && <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Inclement Hours</p><p className="font-semibold">{cfg.inclement_hours_required}</p></div>}
            {cfg.hold_period_days > 0 && <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Hold Period</p><p className="font-semibold">{cfg.hold_period_days} days</p></div>}
            <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Permit Age</p><p className="font-semibold">{cfg.permit_min_age}</p></div>
          </div>
        )}
        <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Supervisor Rules</p><p className="text-sm">{cfg.supervisor_rules_display}</p></div>
        <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Night Driving</p><p className="text-sm">{cfg.night_driving_definition}</p></div>
        {cfg.official_form_name && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Official Form</p>
            <p className="text-sm">{cfg.official_form_url
              ? <a href={cfg.official_form_url} target="_blank" rel="noopener" className="text-primary underline">{cfg.official_form_name}</a>
              : cfg.official_form_name}
            </p>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          <a href={cfg.source_url} target="_blank" rel="noopener" className="underline">View source</a>
        </p>
      </section>

      {/* Tier 2 disclaimer */}
      {cfg.tier === 2 && (
        <p className="text-xs text-muted-foreground border border-border rounded p-3">
          Requirements shown are based on publicly available information (IIHS) and may not reflect recent changes. 
          Always verify with your state's licensing agency.
        </p>
      )}

      {/* CTA */}
      <Link
        href={`/register?state=${cfg.state_code}`}
        className="inline-block rounded bg-primary px-6 py-3 text-sm font-bold text-white uppercase tracking-widest hover:opacity-90"
      >
        Start tracking your hours
      </Link>
    </div>
  );
}
```

### generateStaticParams (Optional)

For performance, add `generateStaticParams` to pre-render all 51 state pages at build time:

```typescript
export function generateStaticParams() {
  return STATE_CODES.map(code => ({ code: code.toLowerCase() }));
}
```

Note: `STATE_CONFIGS` is `server-only` — `generateStaticParams` runs at build time (server context), so this import is fine.

### /register?state=[code] Pre-fill

Story 2.2 page.tsx reads `searchParams.state` and passes `prefilledState` to `<RegisterForm>`. The CTA link `/register?state=${cfg.state_code}` triggers this pre-fill. Ensure Story 2.2 includes this before this story merges, or coordinate at PR time.

### References

- Middleware: [middleware.ts](middleware.ts) (project root)
- Existing public layout: [src/app/(public)/layout.tsx](src/app/(public)/layout.tsx)
- Architecture Decision 5 (route placement), Structural Constraint ((public) route group)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
