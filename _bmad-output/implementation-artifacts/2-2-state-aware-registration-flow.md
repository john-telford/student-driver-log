# Story 2.2: State-Aware Registration Flow

Status: ready-for-dev

## Story

As a new user registering from any US state,
I want to select my state and see my state's requirements during registration,
so that I start the app with the correct hour targets, validation rules, and report format from day one.

## Acceptance Criteria

1. `/register` includes a required state dropdown listing all 51 jurisdictions alphabetically with no pre-selected default
2. Selecting a state renders a state summary card with: total hours, night hours, inclement hours (if applicable), supervisor requirements, official form name
3. A driver-ed checkbox appears only for applicable states (AL, AZ, MN, NE, NV, OR, SD, WV)
4. For AR, MS, NJ: a notice renders "Your state does not mandate logged practice hours..."
5. A legal disclaimer appears below the summary card for all states
6. On submit, `state_code` is validated server-side against `STATE_CODES` — invalid code returns field error
7. New user record is created with `state_code`, `state_confirmed = true`, `driver_ed_completed` per checkbox, `permit_issue_date` if provided
8. `permit_issue_date` if provided is validated as not in the future
9. Submitting without selecting a state returns "Please select your state" error
10. All existing registration validation rules are unchanged (email, password, name)

## Tasks / Subtasks

- [ ] Confirm shadcn select is installed (Story 2.1 installs it; if not, run `npx shadcn@latest add select`)
- [ ] Convert `src/app/(auth)/register/page.tsx` to a Server Component that passes `STATE_CONFIGS` data to a new `RegisterForm` Client Component (AC: 1, 2)
  - [ ] Extract state options list server-side from `STATE_CONFIGS` (server-only import OK in page.tsx)
  - [ ] Pass serialized state summary data as props — do NOT pass the full `StateConfig` objects to avoid over-serialization; pass a derived lookup object instead
- [ ] Create `src/app/(auth)/register/register-form.tsx` — Client Component (AC: 1-5)
  - [ ] State dropdown using shadcn Select (sorted alphabetically, no default, required)
  - [ ] State summary card rendered from selected state data (passed as prop)
  - [ ] Conditional driver-ed checkbox
  - [ ] Permit issue date field (optional date input)
  - [ ] Legal disclaimer below summary card
- [ ] Update `src/app/(auth)/register/actions.ts` — `registerAction` (AC: 6-10)
  - [ ] Read `stateCode`, `driverEdCompleted`, `permitIssueDate` from formData
  - [ ] Validate `stateCode` against `STATE_CODES`
  - [ ] Validate `permitIssueDate` is not in the future if provided
  - [ ] Insert user with all new fields: `stateCode`, `stateConfirmed: true`, `driverEdCompleted`, `permitIssueDate`

## Dev Notes

### Prerequisite

Story 1.4 must be merged (users table has the new columns). Stories 1.2/1.3 should be at least partially complete to have meaningful state options.

### Current register/page.tsx and actions.ts State

Read both files before editing:
- [src/app/(auth)/register/page.tsx](src/app/(auth)/register/page.tsx) — currently a simple form page
- [src/app/(auth)/register/actions.ts](src/app/(auth)/register/actions.ts) — `registerAction` inserts `{ email, passwordHash, name, userType: 'parent' }` only

### Server/Client Split Pattern

`register/page.tsx` can import `STATE_CONFIGS` (it's a Server Component). But the form that reacts to state selection is a Client Component. Pass the state data as serialized props:

```typescript
// page.tsx (Server Component)
import { STATE_CONFIGS, STATE_CODES } from '@/data/state-configs';

// Build a serialized lookup (not the full StateConfig — too large)
type StateSummary = {
  code: string;
  name: string;
  validationMode: string;
  totalHours: number;
  nightHours: number;
  inclementHours: number;
  supervisorRulesDisplay: string;
  officialFormName: string | null;
  tier: number;
  driverEdApplicable: boolean;
};

const stateSummaries: StateSummary[] = STATE_CODES
  .map(code => {
    const cfg = STATE_CONFIGS[code];
    return {
      code,
      name: cfg.state_name,
      validationMode: cfg.validation_mode,
      totalHours: cfg.total_hours_required,
      nightHours: cfg.nighttime_hours_required,
      inclementHours: cfg.inclement_hours_required,
      supervisorRulesDisplay: cfg.supervisor_rules_display,
      officialFormName: cfg.official_form_name,
      tier: cfg.tier,
      driverEdApplicable: cfg.hours_waived_with_driver_ed || cfg.driver_ed_hours_count_toward_total,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

return <RegisterForm stateSummaries={stateSummaries} />;
```

### State Summary Card

Show when a state is selected. Conditionally include:
- Total hours required (if `validationMode !== 'none'`)
- Night hours required (if `nightHours > 0`)
- Inclement hours (if `inclementHours > 0`)
- Supervisor rules (`supervisorRulesDisplay`)
- Official form name (if `officialFormName`)

### Legal Disclaimer Text

Below the summary card (all states):
> "Requirements shown are based on publicly available information and may not reflect recent changes. Always verify with your state's licensing agency."

### No-Requirement States (AR, MS, NJ)

When `validationMode === 'none'`, hide progress-related fields in the summary card and show:
> "Your state does not mandate logged practice hours, but tracking your practice can help you prepare and build confidence."

### Server Action Changes

Add to `RegisterState`:
```typescript
export type RegisterState = { errors: Record<string, string> } | undefined;
```

The `errors` object can now include `stateCode`, `permitIssueDate`. Add to `registerAction`:

```typescript
import { STATE_CODES } from '@/data/state-configs';

const stateCode = (formData.get('stateCode') as string)?.trim().toUpperCase();
const driverEdCompleted = formData.get('driverEdCompleted') === 'true';
const permitIssueDate = (formData.get('permitIssueDate') as string) || null;

if (!stateCode || !STATE_CODES.includes(stateCode)) {
  errors.stateCode = 'Please select your state.';
}
if (permitIssueDate && permitIssueDate > new Date().toISOString().split('T')[0]) {
  errors.permitIssueDate = 'Permit issue date cannot be in the future.';
}
```

Update the `db.insert(users)` call:
```typescript
await db.insert(users).values({
  email, passwordHash, name, userType: 'parent',
  stateCode, stateConfirmed: true, driverEdCompleted,
  permitIssueDate: permitIssueDate ?? undefined,
});
```

### `?state=[code]` Pre-fill (Story 7.1 dependency)

Story 7.1 adds a CTA on public state pages that links to `/register?state=[code]`. Read `searchParams` in `page.tsx` and pass `prefilledState` to `RegisterForm`. The form pre-selects the state and shows the summary card on load if a valid state code is in the URL.

```typescript
// page.tsx
export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  const prefilledState = state && STATE_CODES.includes(state.toUpperCase()) 
    ? state.toUpperCase() 
    : undefined;
  // ...
}
```

### References

- Register actions to extend: [src/app/(auth)/register/actions.ts](src/app/(auth)/register/actions.ts)
- Register page to extend: [src/app/(auth)/register/page.tsx](src/app/(auth)/register/page.tsx)
- shadcn select (install in 2.1): [src/components/ui/](src/components/ui/)
- Architecture Decision 2 (StateConfig server-only): [_bmad-output/planning-artifacts/architecture.md](_bmad-output/planning-artifacts/architecture.md)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
