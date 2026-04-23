import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { Trip } from '@/db/schema';

const locationLabels: Record<string, string> = {
  highway: 'Highway', residential: 'Residential', rural: 'Rural',
  urban: 'Urban', parking_lot: 'Parking Lot', race_track: 'Race Track',
};
const weatherLabels: Record<string, string> = {
  clear: 'Clear', rain: 'Rain', snow: 'Snow', fog: 'Fog', ice: 'Ice',
};

function formatHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

// Pantone 342 in hex for PDF
const GREEN = '#1a5c2e';
const LIGHT_GREEN = '#e8f2eb';

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 7, padding: 32, backgroundColor: '#ffffff' },

  // Header
  headerCenter: { alignItems: 'center', marginBottom: 10 },
  headerSub:    { fontSize: 7, color: '#555555', marginBottom: 2 },
  headerTitle:  { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  headerMeta:   { flexDirection: 'row', gap: 24, fontSize: 7 },
  headerLabel:  { fontFamily: 'Helvetica-Bold' },

  // Table
  table:     { width: '100%' },
  headerRow: { flexDirection: 'row', backgroundColor: GREEN },
  row:       { flexDirection: 'row' },
  rowAlt:    { flexDirection: 'row', backgroundColor: LIGHT_GREEN },
  totalsRow: { flexDirection: 'row', backgroundColor: '#d4e8da' },

  // Cells
  cell:       { borderRight: '0.5px solid #999', borderBottom: '0.5px solid #999', paddingHorizontal: 3, paddingVertical: 3, justifyContent: 'center' },
  cellHeader: { borderRight: '0.5px solid rgba(255,255,255,0.4)', paddingHorizontal: 3, paddingVertical: 4, justifyContent: 'center', alignItems: 'center' },
  cellText:   { color: '#111111' },
  cellHeaderText: { color: '#ffffff', fontFamily: 'Helvetica-Bold', fontSize: 6, textAlign: 'center' },
  cellCenter: { textAlign: 'center' },
  cellBold:   { fontFamily: 'Helvetica-Bold' },

  // Signature
  sigRow:   { flexDirection: 'row', marginTop: 24, gap: 40 },
  sigBlock: { flex: 1 },
  sigLine:  { borderBottom: '0.5px solid #333', marginBottom: 3 },
  sigLabel: { fontSize: 6, color: '#555555' },
});

// Column definitions: [label, flex, align]
const COLS: [string, number, 'left' | 'center'][] = [
  ['Date',                  7,  'center'],
  ['Location of Practice', 13,  'left'],
  ['Weather Conditions',   10,  'left'],
  ['Daytime',               6,  'center'],
  ['Daytime Total',         7,  'center'],
  ['Nighttime',             6,  'center'],
  ['Nighttime Total',       8,  'center'],
  ['Grand Total',           7,  'center'],
  ['Initials',              5,  'center'],
];

type Row = Trip & { runningDay: number; runningNight: number; grandTotal: number };

export function ReportDocument({
  rows,
  studentName,
  parentName,
  totalDay,
  totalNight,
  printedDate,
}: {
  rows: Row[];
  studentName: string | null;
  parentName: string | null;
  totalDay: number;
  totalNight: number;
  printedDate: string;
}) {
  return (
    <Document>
      <Page size="LETTER" orientation="landscape" style={s.page}>

        {/* Header */}
        <View style={s.headerCenter}>
          <Text style={s.headerSub}>Illinois Secretary of State — DSD X 152.4</Text>
          <Text style={s.headerTitle}>Behind-the-Wheel Driving Log</Text>
          <View style={s.headerMeta}>
            {studentName && <Text><Text style={s.headerLabel}>Student: </Text>{studentName}</Text>}
            {parentName  && <Text><Text style={s.headerLabel}>Parent/Guardian: </Text>{parentName}</Text>}
            <Text><Text style={s.headerLabel}>Printed: </Text>{printedDate}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={s.table}>
          {/* Header row */}
          <View style={s.headerRow}>
            {COLS.map(([label, flex]) => (
              <View key={label} style={[s.cellHeader, { flex }]}>
                <Text style={s.cellHeaderText}>{label.toUpperCase()}</Text>
              </View>
            ))}
          </View>

          {/* Data rows */}
          {rows.map((row, i) => (
            <View key={row.id} style={i % 2 === 1 ? s.rowAlt : s.row}>
              <View style={[s.cell, { flex: COLS[0][1] }]}><Text style={[s.cellText, s.cellCenter]}>{row.tripDate}</Text></View>
              <View style={[s.cell, { flex: COLS[1][1] }]}><Text style={s.cellText}>{locationLabels[row.locationType] ?? row.locationType}</Text></View>
              <View style={[s.cell, { flex: COLS[2][1] }]}><Text style={s.cellText}>{weatherLabels[row.weather] ?? row.weather}</Text></View>
              <View style={[s.cell, { flex: COLS[3][1] }]}><Text style={[s.cellText, s.cellCenter]}>{formatHMM(row.daytimeMinutes)}</Text></View>
              <View style={[s.cell, { flex: COLS[4][1] }]}><Text style={[s.cellText, s.cellCenter, s.cellBold]}>{formatHMM(row.runningDay)}</Text></View>
              <View style={[s.cell, { flex: COLS[5][1] }]}><Text style={[s.cellText, s.cellCenter]}>{formatHMM(row.nighttimeMinutes)}</Text></View>
              <View style={[s.cell, { flex: COLS[6][1] }]}><Text style={[s.cellText, s.cellCenter, s.cellBold]}>{formatHMM(row.runningNight)}</Text></View>
              <View style={[s.cell, { flex: COLS[7][1] }]}><Text style={[s.cellText, s.cellCenter, s.cellBold]}>{formatHMM(row.grandTotal)}</Text></View>
              <View style={[s.cell, { flex: COLS[8][1] }]}><Text style={s.cellText}> </Text></View>
            </View>
          ))}

          {/* Totals row */}
          <View style={s.totalsRow}>
            <View style={[s.cell, { flex: COLS[0][1] + COLS[1][1] + COLS[2][1] }]}>
              <Text style={[s.cellText, s.cellBold, { textAlign: 'right' }]}>TOTALS</Text>
            </View>
            <View style={[s.cell, { flex: COLS[3][1] }]}><Text style={[s.cellText, s.cellCenter, s.cellBold]}>{formatHMM(totalDay)}</Text></View>
            <View style={[s.cell, { flex: COLS[4][1] }]}><Text style={s.cellText}> </Text></View>
            <View style={[s.cell, { flex: COLS[5][1] }]}><Text style={[s.cellText, s.cellCenter, s.cellBold]}>{formatHMM(totalNight)}</Text></View>
            <View style={[s.cell, { flex: COLS[6][1] }]}><Text style={s.cellText}> </Text></View>
            <View style={[s.cell, { flex: COLS[7][1] }]}><Text style={[s.cellText, s.cellCenter, s.cellBold]}>{formatHMM(totalDay + totalNight)}</Text></View>
            <View style={[s.cell, { flex: COLS[8][1] }]}><Text style={s.cellText}> </Text></View>
          </View>
        </View>

        {/* Signature block */}
        <View style={s.sigRow}>
          <View style={s.sigBlock}>
            <View style={s.sigLine}><Text> </Text></View>
            <Text style={s.sigLabel}>Student Signature</Text>
          </View>
          <View style={s.sigBlock}>
            <View style={s.sigLine}><Text> </Text></View>
            <Text style={s.sigLabel}>Parent / Guardian Signature</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
