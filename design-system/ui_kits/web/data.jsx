const TRIPS = [
  { id: 7, date: '2026-08-20', location: 'Highway',     weather: 'Clear', day: 95,  night: 0 },
  { id: 6, date: '2026-08-17', location: 'Residential', weather: 'Rain',  day: 45,  night: 30 },
  { id: 5, date: '2026-08-14', location: 'Urban',       weather: 'Clear', day: 0,   night: 75 },
  { id: 4, date: '2026-08-09', location: 'Rural',       weather: 'Clear', day: 120, night: 0 },
  { id: 3, date: '2026-08-05', location: 'Parking Lot', weather: 'Snow',  day: 40,  night: 0 },
  { id: 2, date: '2026-07-30', location: 'Residential', weather: 'Fog',   day: 0,   night: 55 },
  { id: 1, date: '2026-07-26', location: 'Highway',     weather: 'Clear', day: 110, night: 0 },
];

const LOCATIONS = ['Highway','Residential','Rural','Urban','Parking Lot','Race Track'].map((l) => ({ value: l, label: l }));
const WEATHER = ['Clear','Rain','Snow','Fog','Ice'].map((w) => ({ value: w, label: w }));

function fmtHMM(min) {
  const h = Math.floor(min / 60);
  return h + ':' + String(min % 60).padStart(2, '0');
}
function fmtShort(min) {
  if (min === 0) return '—';
  const h = Math.floor(min / 60), m = min % 60;
  if (h === 0) return m + 'm';
  if (m === 0) return h + 'h';
  return h + 'h ' + m + 'm';
}
function remaining(cur, req) {
  const rem = Math.max(0, req - cur);
  if (rem === 0) return 'Complete';
  const h = Math.floor(rem / 60), m = rem % 60;
  if (h === 0) return m + 'm left';
  if (m === 0) return h + 'h left';
  return h + 'h ' + m + 'm left';
}
function totals(trips) {
  const day = trips.reduce((a, t) => a + t.day, 0);
  const night = trips.reduce((a, t) => a + t.night, 0);
  return { day, night, total: day + night };
}

Object.assign(window, { TRIPS, LOCATIONS, WEATHER, fmtHMM, fmtShort, remaining, totals });
