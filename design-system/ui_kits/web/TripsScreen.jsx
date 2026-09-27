const { Card, Table, Button, Dialog } = window.StudentDriverLogDesignSystem_97c292;

function TripsScreen({ trips, onDelete, onGo }) {
  const [target, setTarget] = React.useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>Trips</h1>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>{trips.length} sessions logged</p>
        </div>
        <Button variant="accent" size="sm" onClick={() => onGo('New')}>+ Log Trip</Button>
      </div>

      <Card padded={false}>
        <Table
          columns={[
            { key: 'date', label: 'Date', numeric: true },
            { key: 'location', label: 'Location' },
            { key: 'weather', label: 'Weather' },
            { key: 'day', label: 'Daytime', align: 'right', numeric: true },
            { key: 'night', label: 'Nighttime', align: 'right', numeric: true },
            { key: 'actions', label: 'Actions', align: 'right' },
          ]}
          rows={trips.map((tr) => ({
            ...tr,
            day: window.fmtShort(tr.day),
            night: window.fmtShort(tr.night),
            actions: (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <Button variant="link" size="sm">Edit</Button>
                <Button variant="link" size="sm" style={{ color: 'var(--destructive)' }} onClick={() => setTarget(tr)}>Delete</Button>
              </div>
            ),
          }))}
        />
      </Card>

      <Dialog
        open={!!target}
        title="Delete Trip"
        description={target ? 'Delete the ' + target.date + ' trip (' + target.location + ', ' + target.weather + ', ' + window.fmtShort(target.day + target.night) + ' total)? This cannot be undone.' : ''}
        onClose={() => setTarget(null)}
        footer={<>
          <Button variant="outline" size="md" onClick={() => setTarget(null)}>Cancel</Button>
          <Button variant="destructive" size="md" onClick={() => { onDelete(target.id); setTarget(null); }}>Delete</Button>
        </>}
      />
    </div>
  );
}
window.TripsScreen = TripsScreen;
