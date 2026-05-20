# Story 3.3: Trips List Conditional Columns, Filtering, and CSV Export

Status: ready-for-dev

## Story

As a user viewing my trip history,
I want to see state-relevant columns, filter by date range, and export my log as a CSV,
so that I can review my progress and share data in a format matching my state's form.

## Acceptance Criteria

1. The trips table shows a conditional inclement minutes column only for PA/SD users (`stateConfig.inclement_hours_required > 0`)
2. A conditional supervisor name column appears only when `stateConfig.supervisor_field_required = true`
3. Column order follows `stateConfig.report_columns` field order where applicable
4. A date range filter ("Last 30 days", "Last 90 days", custom range, "All time" default) filters the table
5. "Export CSV" downloads a file with column headers from `stateConfig.report_columns[].label`
6. CSV contains only state-applicable columns; filename is `driving-log-[STATE_CODE]-[YYYY-MM-DD].csv`
7. CSV export respects the active date range filter
8. `npm run build` and `npm test -- --run` pass

## Tasks / Subtasks

- [ ] Modify `src/app/(app)/trips/page.tsx` — resolve stateConfig server-side, pass to table (AC: 1-3)
- [ ] Modify `src/app/(app)/trips/trips-table.tsx` — accept stateConfig prop, conditional columns (AC: 1-3)
  - [ ] Add inclement column conditionally
  - [ ] Add supervisor name column conditionally
- [ ] Add date range filter UI to trips page (AC: 4)
  - [ ] Filter state managed client-side or via URL searchParams
  - [ ] Options: "All time", "Last 30 days", "Last 90 days", custom date range
- [ ] Add CSV export (AC: 5-7)
  - [ ] Server Action or API route that generates CSV
  - [ ] Headers from `stateConfig.report_columns[].label`
  - [ ] Respects active date filter
  - [ ] Download with correct filename

## Dev Notes

### Prerequisites

Story 1.5 (trips table with new columns), Story 1.1 (types). Story 3.2 should be complete or in parallel (same file area but different features).

### StateConfig Resolution in trips/page.tsx

Same pattern as Story 3.2 — resolve server-side and pass as prop to the Client Component:

```typescript
// trips/page.tsx
const stateConfig = STATE_CONFIGS[user.stateCode ?? 'IL'];
return <TripsTable trips={tripsData} stateConfig={stateConfig} />;
```

### Conditional Columns in trips-table.tsx

The current `trips-table.tsx` hardcodes IL columns. Replace with dynamic rendering:

```typescript
// In trips-table.tsx (Client Component)
type TripsTableProps = {
  trips: Trip[];
  stateConfig: StateConfig;
};

// Conditional column visibility:
const showInclement = stateConfig.inclement_hours_required > 0;
const showSupervisor = stateConfig.supervisor_field_required;
```

Do not try to render ALL `report_columns` from the state config in the trips list — the trips list is a summary view, not the official form. Show: date, location, weather, daytime, nighttime, total, plus conditional inclement and supervisor columns.

### Date Range Filter

Use URL `searchParams` for the filter state so the page is server-rendered with the correct data. The filter is a Client Component that updates the URL; the page re-fetches on navigation.

```typescript
// In trips/page.tsx:
export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { range, from, to } = await searchParams;
  // Build date filter for DB query
  const today = new Date().toISOString().split('T')[0];
  let dateFrom: string | undefined;
  if (range === '30') dateFrom = subtractDays(today, 30);
  else if (range === '90') dateFrom = subtractDays(today, 90);
  else if (range === 'custom' && from) dateFrom = from;
  // Pass to DB query: .where(and(eq(...), gte(trips.tripDate, dateFrom)))
}
```

### CSV Export

Generate CSV server-side. Options:
1. **Server Action** that returns the CSV as a string, with the Client Component triggering a `Blob` download — simplest approach, no API route needed
2. **API route** (`/api/trips/export`) — cleaner for large datasets but adds an API route

**Recommended: Server Action returning CSV string**, then client-side `Blob` download. Example:

```typescript
// Server Action
export async function exportTripsCSVAction(dateFrom?: string, dateTo?: string): Promise<string> {
  // fetch trips with date filter
  // build CSV using stateConfig.report_columns for headers
  const headers = stateConfig.report_columns.map(col => col.label).join(',');
  // ... build rows
  return [headers, ...rows].join('\n');
}

// Client Component
const csv = await exportTripsCSVAction(dateFrom, dateTo);
const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `driving-log-${stateCode}-${today}.csv`;
a.click();
```

### CSV Column Mapping

Use `stateConfig.report_columns` for headers. For row data, map `field_key` to trip fields:

```typescript
function getTripValue(trip: Trip, fieldKey: string): string {
  switch (fieldKey) {
    case 'tripDate': return trip.tripDate;
    case 'locationType': return trip.locationType;
    case 'weather': return trip.weather;
    case 'daytimeMinutes': return String(trip.daytimeMinutes);
    case 'nighttimeMinutes': return String(trip.nighttimeMinutes);
    case 'inclementMinutes': return String(trip.inclementMinutes ?? 0);
    case 'supervisorName': return trip.supervisorName ?? '';
    case 'supervisorLicense': return trip.supervisorLicense ?? '';
    case 'initials': return '';
    case 'signature': return '';
    // cumulative columns: compute running totals before this call
    default: return '';
  }
}
```

Wrap values containing commas in double quotes when generating CSV.

### Parallelization Note

This story is independent of Story 3.2 (different feature on the same page area). It can be worked in parallel if Story 3.2 blocks.

### References

- trips-table.tsx: [src/app/(app)/trips/trips-table.tsx](src/app/(app)/trips/trips-table.tsx)
- trips/page.tsx: [src/app/(app)/trips/page.tsx](src/app/(app)/trips/page.tsx)
- Architecture Pattern 2 (StateConfig prop threading)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
