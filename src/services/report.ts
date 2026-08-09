import { eq, sum } from 'drizzle-orm';
import { db } from '@/db';
import { trips } from '@/db/schema';

// Illinois learner permit requirements — the single source of truth, shared by
// the web dashboard and the `/api/v1/report` endpoint (architecture §6).
export const TOTAL_REQUIRED_MIN = 50 * 60; // 3000 min
export const NIGHT_REQUIRED_MIN = 10 * 60; // 600 min

export type Report = {
  daytimeMinutes: number;
  nighttimeMinutes: number;
  totalMinutes: number;
  totalRequiredMinutes: number;
  nightRequiredMinutes: number;
  totalPercent: number;
  nightPercent: number;
};

export async function getReport(studentId: number): Promise<Report> {
  const [totals] = await db
    .select({ daytime: sum(trips.daytimeMinutes), nighttime: sum(trips.nighttimeMinutes) })
    .from(trips)
    .where(eq(trips.studentId, studentId));

  const daytimeMinutes = Number(totals?.daytime ?? 0);
  const nighttimeMinutes = Number(totals?.nighttime ?? 0);
  const totalMinutes = daytimeMinutes + nighttimeMinutes;

  return {
    daytimeMinutes,
    nighttimeMinutes,
    totalMinutes,
    totalRequiredMinutes: TOTAL_REQUIRED_MIN,
    nightRequiredMinutes: NIGHT_REQUIRED_MIN,
    totalPercent: Math.min(100, Math.round((totalMinutes / TOTAL_REQUIRED_MIN) * 100)),
    nightPercent: Math.min(100, Math.round((nighttimeMinutes / NIGHT_REQUIRED_MIN) * 100)),
  };
}
