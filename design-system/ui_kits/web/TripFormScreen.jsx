const { Card, Button, Input, Label, Select, Textarea } = window.StudentDriverLogDesignSystem_97c292;

function TripFormScreen({ onSave, onGo }) {
  const [saved, setSaved] = React.useState(false);
  const [form, setForm] = React.useState({ date: '2026-08-24', location: '', weather: '', day: '0', night: '0' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (saved) {
    return (
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 24, padding: '16px 0' }}>
        <div>
          <p style={{ margin: 0, fontSize: 36 }}>✓</p>
          <h2 style={{ margin: '8px 0 0', fontSize: 'var(--text-xl)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>Trip Logged</h2>
          <p style={{ margin: '8px 0 0', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>The driving session has been saved.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button variant="primary" size="lg" onClick={() => onGo('Dashboard')}>Go to Dashboard</Button>
          <Button variant="outline" size="lg" onClick={() => setSaved(false)}>Log Another Trip</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 520 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>Log a Trip</h1>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>Jimmy Telford</p>
      </div>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={form.date} onChange={set('date')} />
          </div>
          <div>
            <Label htmlFor="loc">Location</Label>
            <Select id="loc" options={window.LOCATIONS} value={form.location} onChange={set('location')} />
          </div>
          <div>
            <Label htmlFor="wx">Weather</Label>
            <Select id="wx" options={window.WEATHER} value={form.weather} onChange={set('weather')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <Label htmlFor="day">Daytime (min)</Label>
              <Input id="day" type="number" value={form.day} onChange={set('day')} />
            </div>
            <div>
              <Label htmlFor="night">Nighttime (min)</Label>
              <Input id="night" type="number" value={form.night} onChange={set('night')} />
            </div>
          </div>
          <div>
            <Label htmlFor="notes" hint="(optional)">Notes</Label>
            <Textarea id="notes" rows={3} maxLength={500} placeholder="Any notes about the session…" />
          </div>
          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <Button
              variant="primary" size="md" style={{ flex: 1 }}
              onClick={() => { onSave({ date: form.date, location: form.location || 'Highway', weather: form.weather || 'Clear', day: Number(form.day), night: Number(form.night) }); setSaved(true); }}
            >
              Log Trip
            </Button>
            <Button variant="outline" size="md" onClick={() => onGo('Trips')}>Cancel</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
window.TripFormScreen = TripFormScreen;
