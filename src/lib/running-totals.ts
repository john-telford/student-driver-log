// Running-total columns for the driving log. Rows MUST be passed oldest-first:
// each row's totals are the hours accrued up to and including that trip. Shared
// by the report screen and the PDF so the two cannot drift (issue #73).
export function withRunningTotals<
  T extends { daytimeMinutes: number; nighttimeMinutes: number },
>(tripsOldestFirst: T[]) {
  let runningDay = 0;
  let runningNight = 0;
  const rows = tripsOldestFirst.map((trip) => {
    runningDay += trip.daytimeMinutes;
    runningNight += trip.nighttimeMinutes;
    return { ...trip, runningDay, runningNight, grandTotal: runningDay + runningNight };
  });
  return { rows, totalDay: runningDay, totalNight: runningNight };
}
