# Story 5.1: Dynamic HTML Report Renderer

Status: ready-for-dev

## Story

As a user on the report page,
I want to see a practice log table formatted to my state's official column structure with the correct attestation language and disclaimer,
so that I can print or review a report that matches what my state's DMV expects.

## Acceptance Criteria

1. `formatCell(trip, col, context): string` exported from `src/lib/report/format-cell.ts`, returns `string` always, never JSX
2. `formatCell` switch covers all `ReportColumnDataType` values with a `never` default compile guard
3. `src/lib/report/format-cell.test.ts` tests each `data_type` variant and the never-branch
4. `<ReportTableHTML>` at `src/app/(app)/report/report-table.html.tsx` renders a semantic HTML table driven by `stateConfig.report_columns`
5. `report/page.tsx` resolves stateConfig server-side and passes `report_columns` as prop to `<ReportTableHTML>`
6. Report header reads "[State Name] Practice Driving Log" with "Reference: [form name]" if applicable
7. Attestation block below table uses `stateConfig.attestation_language` plus signature line
8. Notarization block renders when `stateConfig.log_notarization_required = true`
9. Disclaimer footer appears on every render; Tier 2 states get additional IIHS line
10. No `@react-pdf/renderer` import in this file or its dependencies
11. `npm run build` and `npm test -- --run` pass

## Tasks / Subtasks

- [ ] Create `src/lib/report/` directory
- [ ] Create `src/lib/report/format-cell.ts` (AC: 1, 2)
- [ ] Create `src/lib/report/format-cell.test.ts` (AC: 3)
- [ ] Create `src/app/(app)/report/report-table.html.tsx` (AC: 4)
- [ ] Modify `src/app/(app)/report/page.tsx` — resolve stateConfig, pass to `<ReportTableHTML>` (AC: 5-9)

## Dev Notes

### Prerequisites

Story 1.1 (types — `ReportColumn`, `ReportColumnDataType`), Story 1.5 (trips schema with inclement/supervisor fields).

### format-cell.ts — Exact Contract

```typescript
// src/lib/report/format-cell.ts
import type { ReportColumn } from '@/lib/types/state-config';
import type { Trip } from '@/db/schema';
import { formatHMM } from '@/lib/utils';

export type FormatCellContext = {
  cumulativeDay: number;    // running daytime total in minutes
  cumulativeNight: number;  // running nighttime total in minutes
  cumulativeTotal: number;  // running grand total in minutes
};

export function formatCell(
  trip: Trip,
  col: ReportColumn,
  context: FormatCellContext
): string {
  switch (col.data_type) {
    case 'date':
      return trip.tripDate;
    case 'text':
      return String((trip as Record<string, unknown>)[col.field_key] ?? '');
    case 'minutes_hhmm':
      return formatHMM(Number((trip as Record<string, unknown>)[col.field_key] ?? 0));
    case 'minutes_raw':
      return String(Number((trip as Record<string, unknown>)[col.field_key] ?? 0));
    case 'cumulative_minutes':
      if (col.field_key === 'cumulativeDay') return formatHMM(context.cumulativeDay);
      if (col.field_key === 'cumulativeNight') return formatHMM(context.cumulativeNight);
      if (col.field_key === 'cumulativeTotal') return formatHMM(context.cumulativeTotal);
      return '';
    case 'initials':
      return '';
    case 'signature':
      return '';
    case 'custom':
      return String((trip as Record<string, unknown>)[col.custom_field_name ?? ''] ?? '');
    default: {
      const _exhaustive: never = col.data_type;
      return '';
    }
  }
}
```

**Critical:** The `never` default branch MUST be a block with a `never` typed variable assignment. TypeScript will error if a new `ReportColumnDataType` is added without a handler. This is the compile guard required by the architecture.

### format-cell.test.ts

Test every `data_type` variant. Use the fixtures from Story 1.1:

```typescript
import { describe, it, expect } from 'vitest';
import { formatCell } from './format-cell';
import { validILTrip } from '@/lib/validation.fixtures';
import type { ReportColumn } from '@/lib/types/state-config';
import type { Trip } from '@/db/schema';

const baseTripAsTrip = { ...validILTrip, id: 1, studentId: 1, createdBy: 1, createdAt: '2026-01-01' } as unknown as Trip;
const ctx = { cumulativeDay: 120, cumulativeNight: 30, cumulativeTotal: 150 };

describe('formatCell', () => {
  it('date: returns tripDate', () => {
    const col: ReportColumn = { label: 'Date', field_key: 'tripDate', data_type: 'date' };
    expect(formatCell(baseTripAsTrip, col, ctx)).toBe('2026-04-30');
  });
  it('text: returns string field value', () => {
    const col: ReportColumn = { label: 'Location', field_key: 'locationType', data_type: 'text' };
    expect(formatCell(baseTripAsTrip, col, ctx)).toBe('residential');
  });
  it('minutes_hhmm: formats minutes as H:MM', () => {
    const col: ReportColumn = { label: 'Daytime', field_key: 'daytimeMinutes', data_type: 'minutes_hhmm' };
    expect(formatCell(baseTripAsTrip, col, ctx)).toBe('1:00');
  });
  it('minutes_raw: returns raw number string', () => {
    const col: ReportColumn = { label: 'Daytime', field_key: 'daytimeMinutes', data_type: 'minutes_raw' };
    expect(formatCell(baseTripAsTrip, col, ctx)).toBe('60');
  });
  it('cumulative_minutes cumulativeDay: uses context', () => {
    const col: ReportColumn = { label: 'Day Total', field_key: 'cumulativeDay', data_type: 'cumulative_minutes' };
    expect(formatCell(baseTripAsTrip, col, ctx)).toBe('2:00');
  });
  it('cumulative_minutes cumulativeNight: uses context', () => {
    const col: ReportColumn = { label: 'Night Total', field_key: 'cumulativeNight', data_type: 'cumulative_minutes' };
    expect(formatCell(baseTripAsTrip, col, ctx)).toBe('0:30');
  });
  it('cumulative_minutes cumulativeTotal: uses context', () => {
    const col: ReportColumn = { label: 'Grand Total', field_key: 'cumulativeTotal', data_type: 'cumulative_minutes' };
    expect(formatCell(baseTripAsTrip, col, ctx)).toBe('2:30');
  });
  it('initials: returns empty string', () => {
    const col: ReportColumn = { label: 'Initials', field_key: 'initials', data_type: 'initials' };
    expect(formatCell(baseTripAsTrip, col, ctx)).toBe('');
  });
  it('signature: returns empty string', () => {
    const col: ReportColumn = { label: 'Sig', field_key: 'signature', data_type: 'signature' };
    expect(formatCell(baseTripAsTrip, col, ctx)).toBe('');
  });
  it('custom: uses custom_field_name', () => {
    const col: ReportColumn = { label: 'Custom', field_key: 'custom', data_type: 'custom', custom_field_name: 'notes' };
    expect(formatCell({ ...baseTripAsTrip, notes: 'test note' } as unknown as Trip, col, ctx)).toBe('test note');
  });
  it('never default: TypeScript compile guard — adding a data_type without a handler causes a type error', () => {
    // This test documents the never-branch contract.
    // If you add a new ReportColumnDataType and don't handle it in the switch,
    // TypeScript will error on the `const _exhaustive: never = col.data_type` line.
    expect(true).toBe(true); // structural test — enforced at compile time, not runtime
  });
});
```

### ReportTableHTML Component

```tsx
// src/app/(app)/report/report-table.html.tsx
// Server Component (no 'use client')
import type { ReportColumn } from '@/lib/types/state-config';
import type { Trip } from '@/db/schema';
import { formatCell, type FormatCellContext } from '@/lib/report/format-cell';

type Props = {
  columns: ReportColumn[];
  trips: Trip[];
};

export function ReportTableHTML({ columns, trips }: Props) {
  // Build rows with running totals
  let cumulativeDay = 0;
  let cumulativeNight = 0;
  const rows = trips.map(trip => {
    cumulativeDay += trip.daytimeMinutes;
    cumulativeNight += trip.nighttimeMinutes;
    const ctx: FormatCellContext = { cumulativeDay, cumulativeNight, cumulativeTotal: cumulativeDay + cumulativeNight };
    return { trip, ctx };
  });

  return (
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr className="bg-primary text-white">
          {columns.map(col => (
            <th key={col.label} scope="col"
              className="border border-primary/30 px-2 py-2 text-center font-bold uppercase tracking-wider"
              style={col.html_width_pct ? { width: `${col.html_width_pct}%` } : undefined}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(({ trip, ctx }, i) => (
          <tr key={trip.id} className={i % 2 === 1 ? 'bg-muted/30' : ''}>
            {columns.map(col => (
              <td key={col.label} className="border border-border px-2 py-1.5 text-center">
                {formatCell(trip, col, ctx)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### report/page.tsx Changes

The current `report/page.tsx` has hardcoded IL column headers and labels. Replace with:

```typescript
import { STATE_CONFIGS } from '@/data/state-configs';
const stateConfig = STATE_CONFIGS[user.stateCode ?? 'IL'];
// pass stateConfig.report_columns to <ReportTableHTML>
// use stateConfig.state_name, stateConfig.official_form_name for header
// use stateConfig.attestation_language for attestation block
// use stateConfig.tier for Tier 2 disclaimer
```

The existing `rows` computation (running totals) can be removed from `report/page.tsx` — `ReportTableHTML` now computes running totals internally via `formatCell` context.

### Attestation Block

Below `<ReportTableHTML>`:

```tsx
<div className="mt-8 space-y-4 text-sm">
  <p>{stateConfig.attestation_language}</p>
  <div className="grid grid-cols-2 gap-8">
    <div>
      <div className="border-b border-foreground/40 pb-1">&nbsp;</div>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">Student Signature &amp; Date</p>
    </div>
    <div>
      <div className="border-b border-foreground/40 pb-1">&nbsp;</div>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">Parent / Guardian Signature &amp; Date</p>
    </div>
  </div>
  {stateConfig.log_notarization_required && (
    <div className="border border-border rounded p-4 space-y-2">
      <p className="font-bold text-xs uppercase tracking-wider">Notary Public</p>
      {/* Name, commission #, expiration, seal area, date fields */}
    </div>
  )}
</div>
```

### Disclaimer Footer

```tsx
<p className="mt-6 text-xs text-muted-foreground border-t border-border pt-4">
  Generated by studentdriver.site. This document is a practice driving log generated for your convenience. 
  It is not an official state document. Verify acceptance with your local licensing office before submitting.
  {stateConfig.official_form_url && (
    <> <a href={stateConfig.official_form_url} className="underline">Download the official {stateConfig.state_name} form</a>.</>
  )}
  {stateConfig.tier === 2 && (
    <> Requirements shown are based on publicly available information (IIHS) and may not reflect recent changes.</>
  )}
</p>
```

### No @react-pdf/renderer

`@react-pdf/renderer` must NOT be imported in `format-cell.ts`, `report-table.html.tsx`, or `report/page.tsx`. It belongs only in `src/app/api/report/pdf/` (Story 5.2).

### References

- Current report page: [src/app/(app)/report/page.tsx](src/app/(app)/report/page.tsx)
- formatHMM utility: [src/lib/utils.ts](src/lib/utils.ts)
- Architecture Decision 4 (renderer boundary), Pattern 6 (formatCell never default)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
