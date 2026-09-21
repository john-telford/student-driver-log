import { describe, it, expect, beforeAll, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { fileURLToPath } from 'node:url';

// Regression for #73: the report screen and the PDF must show identical
// Daytime Total / Nighttime Total / Grand Total per trip. Both paths run for
// real against an in-memory SQLite DB (so each path's own orderBy is
// exercised); only auth, navigation and PDF byte-rendering are stubbed.
vi.hoisted(() => {
  process.env.DATABASE_URL = ':memory:';
});
vi.mock('@/auth', () => ({ auth: async () => ({ user: { id: '1', userType: 'student' } }) }));
vi.mock('next/navigation', () => ({ redirect: () => { throw new Error('redirect'); } }));
vi.mock('../actions', () => ({ resolveSelectedStudentId: vi.fn() }));
const { renderToBufferMock } = vi.hoisted(() => ({
  renderToBufferMock: vi.fn(async () => Buffer.from('pdf')),
}));
vi.mock('@react-pdf/renderer', () => ({ renderToBuffer: renderToBufferMock }));
vi.mock('@/app/api/report/pdf/document', () => ({ ReportDocument: () => null }));

import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from '@/db';
import { trips, users } from '@/db/schema';
import { formatHMM } from '@/lib/utils';
import { buildReportPdf } from '@/app/api/report/pdf/build';
import ReportPage from './page';

type Totals = { day: string; night: string; grand: string };

// Inserted out of chronological order on purpose, so a wrong orderBy shows up.
const seed = [
  { tripDate: '2026-08-02', daytimeMinutes: 30, nighttimeMinutes: 0 },
  { tripDate: '2026-08-01', daytimeMinutes: 60, nighttimeMinutes: 15 },
  { tripDate: '2026-08-03', daytimeMinutes: 0, nighttimeMinutes: 45 },
  { tripDate: '2026-08-03', daytimeMinutes: 20, nighttimeMinutes: 10 }, // same date: id tiebreak
];

beforeAll(async () => {
  await migrate(db, { migrationsFolder: fileURLToPath(new URL('../../../../drizzle', import.meta.url)) });
  await db.insert(users).values({ id: 1, email: 's@example.com', passwordHash: 'x', name: 'Jimmy', userType: 'student' });
  for (const t of seed) {
    await db.insert(trips).values({ studentId: 1, createdBy: 1, locationType: 'residential', weather: 'clear', ...t });
  }
});

async function screenTotals(): Promise<Record<string, Totals>> {
  const html = renderToStaticMarkup(await ReportPage());
  const out: Record<string, Totals> = {};
  for (const [, row] of html.matchAll(/<tr[^>]*>(.*?)<\/tr>/g)) {
    const cells = [...row.matchAll(/<td[^>]*>(.*?)<\/td>/g)].map((m) => m[1]);
    if (cells.length === 9 && /^\d{4}-\d{2}-\d{2}$/.test(cells[0])) {
      // Key by date + daily minutes so same-date trips stay distinct.
      out[`${cells[0]}|${cells[3]}|${cells[5]}`] = { day: cells[4], night: cells[6], grand: cells[7] };
    }
  }
  return out;
}

async function pdfTotals(): Promise<Record<string, Totals>> {
  renderToBufferMock.mockClear();
  await buildReportPdf(1, 'Jimmy', null);
  const element = renderToBufferMock.mock.calls[0] as unknown as [{ props: { rows: Array<Record<string, number | string>> } }];
  const out: Record<string, Totals> = {};
  for (const r of element[0].props.rows) {
    out[`${r.tripDate}|${formatHMM(r.daytimeMinutes as number)}|${formatHMM(r.nighttimeMinutes as number)}`] = {
      day: formatHMM(r.runningDay as number),
      night: formatHMM(r.runningNight as number),
      grand: formatHMM(r.grandTotal as number),
    };
  }
  return out;
}

describe('report screen vs PDF running totals (#73)', () => {
  it('shows identical Daytime/Nighttime/Grand totals for every trip', async () => {
    const screen = await screenTotals();
    const pdf = await pdfTotals();
    expect(Object.keys(pdf)).toHaveLength(seed.length);
    expect(screen).toEqual(pdf);
  });

  it('accrues forward in time (oldest trip = its own minutes, newest = grand total)', async () => {
    const screen = await screenTotals();
    expect(screen['2026-08-01|1:00|0:15']).toEqual({ day: '1:00', night: '0:15', grand: '1:15' });
    expect(screen['2026-08-03|0:20|0:10']).toEqual({ day: '1:50', night: '1:10', grand: '3:00' });
  });
});
