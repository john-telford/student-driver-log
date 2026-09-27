const { Card, Table, Button, ProgressBar, StatTile } = window.StudentDriverLogDesignSystem_97c292;

function DashboardScreen({ trips, onGo }) {
  const t = window.totals(trips);
  const totalPct = Math.round((t.total / 3000) * 100);
  const nightPct = Math.round((t.night / 600) * 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>Dashboard</h1>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>Welcome back, John.</p>
      </div>

      <Card title="Progress — Jimmy Telford">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            <StatTile label="Daytime" value={window.fmtHMM(t.day)} />
            <StatTile label="Nighttime" value={window.fmtHMM(t.night)} />
            <StatTile label="Total" value={window.fmtHMM(t.total)} />
          </div>
          <ProgressBar
            label="50-Hour Requirement" percent={totalPct}
            remaining={window.remaining(t.total, 3000)} caption={totalPct + '% of 50:00'}
            tooltip={window.fmtHMM(t.total) + ' total (' + window.fmtHMM(t.day) + ' day + ' + window.fmtHMM(t.night) + ' night)'}
          />
          <ProgressBar
            label="10-Hour Night Requirement" tone="accent" percent={nightPct}
            remaining={window.remaining(t.night, 600)} caption={nightPct + '% of 10:00'}
            tooltip={window.fmtHMM(t.night) + ' nighttime'}
          />
        </div>
      </Card>

      <Card title="Recent Trips" padded={false} action={<Button variant="link" size="sm" onClick={() => onGo('Trips')}>View All</Button>}>
        <Table
          dense
          columns={[
            { key: 'date', label: 'Date', numeric: true },
            { key: 'location', label: 'Location' },
            { key: 'day', label: 'Daytime', align: 'right', numeric: true },
            { key: 'night', label: 'Nighttime', align: 'right', numeric: true },
          ]}
          rows={trips.slice(0, 5).map((tr) => ({ ...tr, day: window.fmtShort(tr.day), night: window.fmtShort(tr.night) }))}
        />
      </Card>

      <Card title="Students" action={<Button variant="link" size="sm">+ Add a Student</Button>}>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[['Jimmy Telford', 'jimmy@example.com'], ['Ellie Telford', 'ellie@example.com']].map(([n, e]) => (
            <li key={e} style={{ display: 'flex', gap: 12, fontSize: 'var(--text-sm)' }}>
              <span style={{ fontWeight: 600 }}>{n}</span>
              <span style={{ color: 'var(--muted-foreground)' }}>{e}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
window.DashboardScreen = DashboardScreen;
