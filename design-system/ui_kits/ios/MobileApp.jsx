const { SignCard, BrandMark, Card, Table, Button, Input, Label, Select, Textarea, ProgressBar, StatTile, Toast } = window.StudentDriverLogDesignSystem_97c292;

function MobileHeader({ route, onGo }) {
  const [open, setOpen] = React.useState(false);
  const link = { color: '#fff', fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', textDecoration: 'none' };
  return (
    <div style={{ position: 'relative', zIndex: 20 }}>
      <div style={{ background: 'var(--primary)', borderBottom: 'var(--border-rule) solid var(--accent)', height: 'var(--header-height)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12 }}>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)' }}>Student Driver Log</span>
        <button onClick={() => setOpen(!open)} style={{ marginLeft: 'auto', background: 'none', border: 0, padding: 12, marginRight: -12, cursor: 'pointer', lineHeight: 0 }}>
          <img src={open ? '../../assets/icon-close.svg' : '../../assets/icon-menu.svg'} width="24" height="24" alt={open ? 'Close' : 'Menu'} style={{ filter: 'brightness(0) invert(1)' }} />
        </button>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--primary)', borderBottom: 'var(--border-rule) solid var(--accent)', boxShadow: 'var(--shadow-lg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['Dashboard', 'Trips', 'Report'].map((l) => (
            <a key={l} href="#" style={link} onClick={(e) => { e.preventDefault(); onGo(l); setOpen(false); }}>{l}</a>
          ))}
          <Button variant="accent" size="sm" style={{ alignSelf: 'flex-start' }} onClick={() => { onGo('New'); setOpen(false); }}>+ Log Trip</Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: 'var(--on-green-tertiary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)' }}>Student</span>
            <Select onGreen placeholder="" style={{ width: 150, padding: '4px 8px', fontSize: 'var(--text-xs)' }}
              options={[{ value: 'j', label: 'Jimmy Telford' }, { value: 'e', label: 'Ellie Telford' }]} />
          </div>
          <a href="#" style={{ ...link, color: 'var(--accent)', fontSize: 'var(--text-xs)' }} onClick={(e) => { e.preventDefault(); onGo('SignOut'); }}>Sign Out</a>
        </div>
      )}
    </div>
  );
}

function MobileApp() {
  const [signedIn, setSignedIn] = React.useState(false);
  const [route, setRoute] = React.useState('Dashboard');
  const [trips, setTrips] = React.useState(window.TRIPS);
  const [toast, setToast] = React.useState(null);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2400); return () => clearTimeout(t); }, [toast]);

  const go = (r) => { if (r === 'SignOut') { setSignedIn(false); return; } setSaved(false); setRoute(r); };
  const t = window.totals(trips);
  const totalPct = Math.round((t.total / 3000) * 100);
  const nightPct = Math.round((t.night / 600) * 100);
  const title = (s, sub) => (
    <div>
      <h1 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>{s}</h1>
      {sub && <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>{sub}</p>}
    </div>
  );

  if (!signedIn) {
    return (
      <div style={{ height: '100%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }}>
        <SignCard width={340}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '2px solid var(--on-green-rule)', paddingBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}><BrandMark variant="shield" size={72} assetBase="../../assets" /></div>
              <BrandMark variant="wordmark" size={20} color="#fff" />
              <span style={{ fontSize: 'var(--text-micro)', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', color: 'var(--on-green-tertiary)' }}>Learner Permit Hour Tracker</span>
            </div>
            <div><Label htmlFor="me" onGreen>Email</Label><Input id="me" onGreen defaultValue="jimmy@example.com" /></div>
            <div><Label htmlFor="mp" onGreen>Password</Label><Input id="mp" type="password" onGreen defaultValue="••••••••" /></div>
            <Button variant="onGreen" fullWidth onClick={() => { setSignedIn(true); setRoute('Dashboard'); }}>Sign In</Button>
          </div>
        </SignCard>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden', position: 'relative' }}>
      <MobileHeader route={route} onGo={go} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {route === 'Dashboard' && <>
          {title('Dashboard', 'Welcome back, Jimmy.')}
          <Card title="Progress" style={{ }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                <StatTile label="Day" value={window.fmtHMM(t.day)} style={{ padding: 10 }} />
                <StatTile label="Night" value={window.fmtHMM(t.night)} style={{ padding: 10 }} />
                <StatTile label="Total" value={window.fmtHMM(t.total)} style={{ padding: 10 }} />
              </div>
              <ProgressBar label="50-Hour" percent={totalPct} remaining={window.remaining(t.total, 3000)} caption={totalPct + '% of 50:00'} />
              <ProgressBar label="10-Hour Night" tone="accent" percent={nightPct} remaining={window.remaining(t.night, 600)} caption={nightPct + '% of 10:00'} />
            </div>
          </Card>
          <Card title="Recent Trips" padded={false}>
            <Table dense zebra columns={[{ key: 'date', label: 'Date', numeric: true }, { key: 'location', label: 'Location' }, { key: 'day', label: 'Day', align: 'right', numeric: true }, { key: 'night', label: 'Night', align: 'right', numeric: true }]}
              rows={trips.slice(0, 4).map((tr) => ({ ...tr, day: window.fmtShort(tr.day), night: window.fmtShort(tr.night) }))} />
          </Card>
          <Button variant="accent" size="md" fullWidth onClick={() => go('New')}>+ Log Trip</Button>
        </>}

        {route === 'Trips' && <>
          {title('Trips', trips.length + ' sessions logged')}
          <Card padded={false}>
            <Table columns={[{ key: 'date', label: 'Date', numeric: true }, { key: 'location', label: 'Location' }, { key: 'day', label: 'Day', align: 'right', numeric: true }, { key: 'night', label: 'Night', align: 'right', numeric: true }]}
              rows={trips.map((tr) => ({ ...tr, day: window.fmtShort(tr.day), night: window.fmtShort(tr.night) }))} />
          </Card>
        </>}

        {route === 'Report' && <>
          {title('Report', 'Illinois SOS DSD X 152.4')}
          <Card>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', lineHeight: 'var(--leading-relaxed)' }}>
              The full nine-column log is a landscape document. On phones the app hands it straight to the PDF route.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              <Button variant="primary" size="md" fullWidth>Download PDF</Button>
              <Button variant="outline" size="md" fullWidth>Print</Button>
            </div>
          </Card>
        </>}

        {route === 'New' && (saved ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 24 }}>
            <div>
              <p style={{ margin: 0, fontSize: 36 }}>✓</p>
              <h2 style={{ margin: '8px 0 0', fontSize: 'var(--text-xl)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>Trip Logged</h2>
              <p style={{ margin: '8px 0 0', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>The driving session has been saved.</p>
            </div>
            <Button variant="primary" size="md" fullWidth onClick={() => go('Dashboard')}>Go to Dashboard</Button>
            <Button variant="outline" size="md" fullWidth onClick={() => setSaved(false)}>Log Another Trip</Button>
          </div>
        ) : <>
          {title('Log a Trip')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><Label htmlFor="d">Date</Label><Input id="d" type="date" defaultValue="2026-08-24" /></div>
            <div><Label htmlFor="l">Location</Label><Select id="l" options={window.LOCATIONS} /></div>
            <div><Label htmlFor="w">Weather</Label><Select id="w" options={window.WEATHER} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><Label htmlFor="dm">Daytime (min)</Label><Input id="dm" type="number" defaultValue="0" /></div>
              <div><Label htmlFor="nm">Nighttime (min)</Label><Input id="nm" type="number" defaultValue="0" /></div>
            </div>
            <div><Label htmlFor="n" hint="(optional)">Notes</Label><Textarea id="n" rows={3} placeholder="Any notes about the session…" /></div>
            <Button variant="primary" size="md" fullWidth onClick={() => { setTrips([{ id: Date.now(), date: '2026-08-24', location: 'Highway', weather: 'Clear', day: 60, night: 0 }, ...trips]); setSaved(true); setToast({ title: 'Trip Logged', description: 'The driving session has been saved.' }); }}>Log Trip</Button>
            <Button variant="outline" size="md" fullWidth onClick={() => go('Dashboard')}>Cancel</Button>
          </div>
        </>)}
      </div>
      {toast && (
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 30 }}>
          <Toast tone="success" title={toast.title} description={toast.description} />
        </div>
      )}
    </div>
  );
}
window.MobileApp = MobileApp;
