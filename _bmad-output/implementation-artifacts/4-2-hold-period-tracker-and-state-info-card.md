# Story 4.2: Hold Period Tracker and State Info Card

Status: ready-for-dev

## Story

As a user on the dashboard,
I want to see how many days remain on my mandatory holding period and a summary of my state's requirements,
so that I know when I'm eligible to take my road test and can quickly reference my state's rules.

## Acceptance Criteria

1. Hold period card appears when `stateConfig.hold_period_days > 0` AND `permitIssueDate` is set; shows permit date, required hold, earliest eligible date, days remaining (or "Eligible!" if elapsed)
2. When `hold_period_days > 0` but `permitIssueDate` not set: card shows "Add your permit issue date in Settings to track your holding period"
3. When `hold_period_days === 0`: no hold period card renders at all
4. Collapsible state info card (collapsed by default) titled "[State Name] Requirements" shows all required fields
5. State info card footer shows "Verify these requirements with [state agency]. Data effective: [stateConfig.effective_date]."
6. For Tier 2 states: additional "Data source: IIHS (publicly available)" badge visible on collapsed state
7. "Change state" link in state info card navigates to `/settings`
8. `npm run build` and `npm test -- --run` pass

## Tasks / Subtasks

- [ ] Modify `src/app/(app)/dashboard/page.tsx` — add hold period and state info sections (AC: 1-7)
  - [ ] Hold period tracker card (AC: 1-3)
  - [ ] Collapsible state info card (AC: 4-7)
- [ ] Optionally extract hold period and state info into sub-components for readability

## Dev Notes

### Prerequisite

Story 4.1 must be complete — it fetches `permitIssueDate`, `stateCode`, and the stateConfig already. This story adds two new card sections to `dashboard/page.tsx` below the progress section.

### Hold Period Card

```tsx
{stateConfig.hold_period_days > 0 && (
  <div className="rounded border border-border bg-card p-6 space-y-3">
    <h2 className="text-sm font-black uppercase tracking-wide">Hold Period</h2>
    {userRecord.permitIssueDate ? (
      <>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Permit Date</p>
            <p className="font-semibold">{userRecord.permitIssueDate}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Required Hold</p>
            <p className="font-semibold">{stateConfig.hold_period_days} days</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Eligible Date</p>
            <p className="font-semibold">{earliestEligibleDate}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
            <p className={holdComplete ? 'font-bold text-primary' : 'font-semibold'}>
              {holdComplete ? 'Eligible!' : `${daysRemaining} days remaining`}
            </p>
          </div>
        </div>
      </>
    ) : (
      <p className="text-sm text-muted-foreground">
        Add your permit issue date in{' '}
        <a href="/settings" className="text-primary underline">Settings</a>{' '}
        to track your holding period.
      </p>
    )}
  </div>
)}
```

**Date computation (server-side):**
```typescript
let earliestEligibleDate = '';
let daysRemaining = 0;
let holdComplete = false;
if (stateConfig.hold_period_days > 0 && userRecord.permitIssueDate) {
  const eligible = new Date(userRecord.permitIssueDate);
  eligible.setDate(eligible.getDate() + stateConfig.hold_period_days);
  earliestEligibleDate = eligible.toISOString().split('T')[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  holdComplete = today >= eligible;
  daysRemaining = holdComplete ? 0 : Math.ceil((eligible.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
```

### State Info Card (Collapsible)

Use a `<details>`/`<summary>` HTML element for collapsibility — no JavaScript needed, no shadcn component required:

```tsx
<details className="rounded border border-border bg-card">
  <summary className="px-6 py-4 cursor-pointer flex items-center justify-between">
    <span className="text-sm font-black uppercase tracking-wide">
      {stateConfig.state_name} Requirements
    </span>
    {stateConfig.tier === 2 && (
      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
        IIHS Data
      </span>
    )}
  </summary>
  <div className="px-6 pb-6 space-y-3 text-sm border-t border-border pt-4">
    <div className="grid grid-cols-2 gap-3">
      {stateConfig.validation_mode !== 'none' && (
        <>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Hours</p>
            <p className="font-semibold">{stateConfig.total_hours_required}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Night Hours</p>
            <p className="font-semibold">{stateConfig.nighttime_hours_required}</p>
          </div>
          {stateConfig.inclement_hours_required > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Inclement Hours</p>
              <p className="font-semibold">{stateConfig.inclement_hours_required}</p>
            </div>
          )}
        </>
      )}
      {stateConfig.hold_period_days > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Hold Period</p>
          <p className="font-semibold">{stateConfig.hold_period_days} days</p>
        </div>
      )}
    </div>
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">Supervisor Rules</p>
      <p>{stateConfig.supervisor_rules_display}</p>
    </div>
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">Night Driving</p>
      <p>{stateConfig.night_driving_definition}</p>
    </div>
    {stateConfig.official_form_name && (
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Official Form</p>
        <p>
          {stateConfig.official_form_url
            ? <a href={stateConfig.official_form_url} target="_blank" rel="noopener" className="text-primary underline">{stateConfig.official_form_name}</a>
            : stateConfig.official_form_name}
        </p>
      </div>
    )}
    <p className="text-xs text-muted-foreground border-t border-border pt-3">
      Verify these requirements with {stateConfig.state_agency}. Data effective: {stateConfig.effective_date}.
      {stateConfig.tier === 2 && ' Requirements shown are based on publicly available information (IIHS).'}
      {' '}<a href="/settings" className="text-primary underline">Change state</a>
    </p>
  </div>
</details>
```

### Placement in dashboard/page.tsx

Insert both cards after the progress bars section (from Story 4.1) and before the "Recent Trips" table:

```
[Progress section — Story 4.1]
[Hold Period card — Story 4.2]
[State Info card — Story 4.2]
[Recent Trips table — existing]
[Students list — existing parent-only section]
```

### References

- Dashboard to modify: [src/app/(app)/dashboard/page.tsx](src/app/(app)/dashboard/page.tsx)
- Settings page for "Change state" link: [src/app/(app)/settings/page.tsx](src/app/(app)/settings/page.tsx)
- State info card footer copy from epics: [_bmad-output/planning-artifacts/epics.md](_bmad-output/planning-artifacts/epics.md) — Story 4.2 ACs

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
