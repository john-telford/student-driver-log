# Story 4.1: Dynamic Progress Bars and Completion Checklist

Status: ready-for-dev

## Story

As a user on the dashboard,
I want to see progress bars that reflect my state's actual hour requirements — or cumulative stats if my state has no requirement — and a completion checklist when I've hit all my targets,
so that I always know exactly where I stand relative to what my state requires.

## Acceptance Criteria

1. Progress bars use `stateConfig.total_hours_required` and `stateConfig.nighttime_hours_required` as targets
2. For PA/SD (`stateConfig.inclement_hours_required > 0`): a third progress bar for inclement hours
3. Progress bar labels show "[current] of [target] hours"; bars have `role="progressbar"` with correct ARIA attributes
4. For `validation_mode === 'none'` states (AR, MS, NJ): no progress bars; cumulative stat cards with header "Your state does not require logged practice hours. Here is your practice summary."
5. For `driver_ed_completed = true` + `hours_waived_with_driver_ed = true`: green banner; progress bars show cumulative only (no targets)
6. When all hour requirements are met (and hold period elapsed if `permit_issue_date` set): green completion card with state-specific next steps
7. Completion card suppressed if hold period not yet elapsed
8. Dashboard data fetch branches on `stateConfig.validation_mode`, never on `total_hours_required === 0`
9. `npm run build` and `npm test -- --run` pass

## Tasks / Subtasks

- [ ] Install shadcn progress component: `npx shadcn@latest add progress`
- [ ] Modify `src/app/(app)/dashboard/page.tsx` — replace hardcoded IL constants with stateConfig (AC: 1-8)
  - [ ] Resolve stateConfig from `STATE_CONFIGS[user.stateCode]` (need to fetch `stateCode`, `driverEdCompleted`, `permitIssueDate` from users table)
  - [ ] Branch display mode on `stateConfig.validation_mode`
  - [ ] Replace `TOTAL_REQUIRED_MIN` / `NIGHT_REQUIRED_MIN` constants with stateConfig values
  - [ ] Add inclement aggregate query for PA/SD
  - [ ] Add driver-ed waived banner
  - [ ] Add completion checklist card
  - [ ] Add ARIA attributes to progress bars

## Dev Notes

### Prerequisites

Stories 1.4 (users schema — stateCode, driverEdCompleted, permitIssueDate), 1.5 (trips schema — inclementMinutes). Story 4.2 also modifies this file — coordinate or do sequentially (4.1 first).

### Current dashboard/page.tsx State

[src/app/(app)/dashboard/page.tsx](src/app/(app)/dashboard/page.tsx) currently:
- Hardcodes `TOTAL_REQUIRED_MIN = 50 * 60` and `NIGHT_REQUIRED_MIN = 10 * 60`
- Queries `sum(trips.daytimeMinutes)` and `sum(trips.nighttimeMinutes)`
- Renders two div-based progress bars (not shadcn) with `style={{ width: '${pct}%' }}`
- Shows recent trips table

### Key Changes to dashboard/page.tsx

**1. Fetch user state fields:**
```typescript
const [userRecord] = await db
  .select({
    stateCode: users.stateCode,
    driverEdCompleted: users.driverEdCompleted,
    permitIssueDate: users.permitIssueDate,
  })
  .from(users)
  .where(eq(users.id, userId));
const stateConfig = STATE_CONFIGS[userRecord?.stateCode ?? 'IL'];
```

**2. Branch on validation_mode (never on total_hours_required === 0):**
```typescript
const isNoneMode = stateConfig.validation_mode === 'none';
const isWaived = userRecord.driverEdCompleted && stateConfig.hours_waived_with_driver_ed;
```

**3. Add inclement aggregate (conditional):**
```typescript
let totalInclement = 0;
if (stateConfig.inclement_hours_required > 0 && selectedStudentId) {
  const [inc] = await db
    .select({ inclement: sum(trips.inclementMinutes) })
    .from(trips)
    .where(eq(trips.studentId, selectedStudentId));
  totalInclement = Number(inc?.inclement ?? 0);
}
```

**4. Completion card logic:**
```typescript
const totalReqMin = stateConfig.total_hours_required * 60;
const nightReqMin = stateConfig.nighttime_hours_required * 60;
const inclReqMin = stateConfig.inclement_hours_required * 60;
const hoursComplete =
  grandTotal >= totalReqMin &&
  totalNighttime >= nightReqMin &&
  totalInclement >= inclReqMin;

// Hold period check
let holdComplete = true;
if (stateConfig.hold_period_days > 0 && userRecord.permitIssueDate) {
  const eligible = new Date(userRecord.permitIssueDate);
  eligible.setDate(eligible.getDate() + stateConfig.hold_period_days);
  holdComplete = new Date() >= eligible;
}

const showCompletion = hoursComplete && holdComplete && !isNoneMode && !isWaived;
```

### Progress Bar ARIA Attributes

Replace raw `<div style={{ width: '${pct}%' }}>` with shadcn `<Progress>` or add ARIA attributes to the existing pattern:

```tsx
<div
  role="progressbar"
  aria-valuenow={grandTotal}
  aria-valuemin={0}
  aria-valuemax={totalReqMin}
  aria-label={`Total hours: ${formatHMM(grandTotal)} of ${stateConfig.total_hours_required}:00`}
  className="h-4 w-full rounded-full bg-muted overflow-hidden"
>
  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${totalPct}%` }} />
</div>
```

### Completion Card State-Specific Next Steps

```tsx
{showCompletion && (
  <div className="rounded border-2 border-primary bg-primary/5 p-6 space-y-2">
    <p className="font-black uppercase tracking-wide text-primary">All Requirements Met!</p>
    {stateConfig.log_submission_required && stateConfig.official_form_url && (
      <p>Print your log and bring it to {stateConfig.state_agency}. 
        <a href={stateConfig.official_form_url}>Download official form</a>.</p>
    )}
    {stateConfig.log_notarization_required && (
      <p>Your state requires your log to be notarized before submission.</p>
    )}
    <p>Generate your <a href="/report">Driving Log Report</a> to print or download.</p>
  </div>
)}
```

### Driver-Ed Waived Banner

```tsx
{isWaived && (
  <div className="rounded border border-primary bg-primary/10 p-4 text-sm">
    Your state waives the {stateConfig.total_hours_required}-hour practice requirement 
    because you completed driver education. Your logged hours are shown below for your records.
  </div>
)}
```

### Note: Story 4.2 Also Modifies This File

Story 4.2 adds the hold period tracker card and state info card to the same `dashboard/page.tsx`. Complete 4.1 first, then 4.2 adds cards below the progress section. Do NOT merge 4.1 and 4.2 changes in the same PR.

### References

- Dashboard to modify: [src/app/(app)/dashboard/page.tsx](src/app/(app)/dashboard/page.tsx)
- Architecture Pattern 5 (validation_mode branching), Cross-Cutting Concern #3
- shadcn progress: `npx shadcn@latest add progress`

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
