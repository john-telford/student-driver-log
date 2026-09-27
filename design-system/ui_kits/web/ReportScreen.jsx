const { Button } = window.StudentDriverLogDesignSystem_97c292;

function ReportScreen({ trips }) {
  let day = 0, night = 0;
  const rows = trips.slice().reverse().map((t) => {
    day += t.day; night += t.night;
    return { ...t, runDay: day, runNight: night, grand: day + night };
  });
  const cell = { border: '1px solid var(--border)', padding: '6px 8px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>Driving Log Report</h1>
          <p style={{ margin: '2px 0 0', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>Jimmy Telford</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="primary" size="md">Download PDF</Button>
          <Button variant="outline" size="md">Print</Button>
        </div>
      </div>

      <div>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', color: 'var(--muted-foreground)' }}>
            Illinois Secretary of State — DSD X 152.4
          </p>
          <h2 style={{ margin: '4px 0 0', fontSize: 'var(--text-lg)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
            Behind-the-Wheel Driving Log
          </h2>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 32, fontSize: 'var(--text-sm)' }}>
            <span><span style={{ fontWeight: 600 }}>Student:</span> Jimmy Telford</span>
            <span><span style={{ fontWeight: 600 }}>Parent/Guardian:</span> John Telford</span>
            <span><span style={{ fontWeight: 600 }}>Printed:</span> August 24, 2026</span>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: '#fff' }}>
              {['Date','Location of Practice','Weather Conditions','Daytime','Daytime Total','Nighttime','Nighttime Total','Grand Total','Initials'].map((h) => (
                <th key={h} style={{ border: '1px solid color-mix(in oklab, var(--primary) 30%, transparent)', padding: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} style={{ background: i % 2 === 1 ? 'color-mix(in oklab, var(--muted) 30%, transparent)' : 'transparent' }}>
                <td style={cell}>{r.date}</td>
                <td style={{ ...cell, textAlign: 'left' }}>{r.location}</td>
                <td style={{ ...cell, textAlign: 'left' }}>{r.weather}</td>
                <td style={cell}>{window.fmtHMM(r.day)}</td>
                <td style={{ ...cell, fontWeight: 600 }}>{window.fmtHMM(r.runDay)}</td>
                <td style={cell}>{window.fmtHMM(r.night)}</td>
                <td style={{ ...cell, fontWeight: 600 }}>{window.fmtHMM(r.runNight)}</td>
                <td style={{ ...cell, fontWeight: 700 }}>{window.fmtHMM(r.grand)}</td>
                <td style={cell}>&nbsp;</td>
              </tr>
            ))}
            <tr style={{ background: 'color-mix(in oklab, var(--primary) 10%, transparent)', fontWeight: 700 }}>
              <td colSpan={3} style={{ ...cell, textAlign: 'right', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)' }}>Totals</td>
              <td style={cell}>{window.fmtHMM(day)}</td>
              <td style={cell} />
              <td style={cell}>{window.fmtHMM(night)}</td>
              <td style={cell} />
              <td style={cell}>{window.fmtHMM(day + night)}</td>
              <td style={cell} />
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, fontSize: 'var(--text-sm)' }}>
          {['Student Signature', 'Parent / Guardian Signature'].map((l) => (
            <div key={l}>
              <div style={{ borderBottom: '1px solid color-mix(in oklab, var(--foreground) 40%, transparent)', paddingBottom: 4 }}>&nbsp;</div>
              <p style={{ margin: '4px 0 0', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)' }}>{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
window.ReportScreen = ReportScreen;
