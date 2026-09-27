const { AppHeader, PageFooter, Button, Select, Toast } = window.StudentDriverLogDesignSystem_97c292;

function App() {
  const [signedIn, setSignedIn] = React.useState(false);
  const [route, setRoute] = React.useState('Dashboard');
  const [trips, setTrips] = React.useState(window.TRIPS);
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  if (!signedIn) return <LoginScreen onSignIn={() => { setSignedIn(true); setRoute('Dashboard'); }} onRegister={() => setSignedIn(true)} />;

  const links = [{ label: 'Trips' }, { label: 'Report' }, { label: 'Settings' }, { label: 'About' }];

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <AppHeader
        links={links}
        active={route}
        onNavigate={(l) => setRoute(l.label)}
        cta={<Button variant="accent" size="sm" onClick={() => setRoute('New')}>+ Log Trip</Button>}
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Select onGreen placeholder="" style={{ width: 132, padding: '4px 8px', fontSize: 'var(--text-xs)' }}
              options={[{ value: 'j', label: 'Jimmy Telford' }, { value: 'e', label: 'Ellie Telford' }, { value: 'new', label: '+ Add student…' }]} />
            <Button variant="link" size="sm" style={{ color: 'var(--accent)', fontSize: 'var(--text-micro)' }} onClick={() => setSignedIn(false)}>Sign Out</Button>
          </div>
        }
      />

      <main style={{ flex: 1, width: '100%', maxWidth: 'var(--content-max-app)', margin: '0 auto', padding: '32px 16px', boxSizing: 'border-box' }}>
        {route === 'Dashboard' && <DashboardScreen trips={trips} onGo={setRoute} />}
        {route === 'Trips' && (
          <TripsScreen
            trips={trips}
            onGo={setRoute}
            onDelete={(id) => { setTrips(trips.filter((t) => t.id !== id)); setToast({ title: 'Trip deleted', description: 'The session was removed from the log.' }); }}
          />
        )}
        {route === 'New' && (
          <TripFormScreen
            onGo={setRoute}
            onSave={(t) => { setTrips([{ id: Date.now(), ...t }, ...trips]); setToast({ title: 'Trip Logged', description: 'The driving session has been saved.' }); }}
          />
        )}
        {route === 'Report' && <ReportScreen trips={trips} />}
        {route === 'About' && <AboutScreen />}
        {route === 'Settings' && (
          <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 32 }}>
            <h1 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', color: 'var(--primary)' }}>Settings</h1>
            <section style={{ border: '2px solid color-mix(in oklab, var(--destructive) 40%, transparent)', borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', color: 'var(--destructive)' }}>Danger Zone</h2>
                <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                  Permanently deletes your account, all student accounts, and every trip record. <strong>This cannot be undone.</strong>
                </p>
              </div>
              <Button variant="destructive" size="md" style={{ alignSelf: 'flex-start' }}>Delete Account</Button>
            </section>
          </div>
        )}
      </main>

      <PageFooter version="v1.4.2 · 9f3c1ab" />

      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 60 }}>
          <Toast tone="success" title={toast.title} description={toast.description} />
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
