function AboutScreen() {
  const p = { margin: 0, fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', color: 'oklch(0 0 0 / 80%)' };
  const h2 = { margin: 0, fontSize: 'var(--text-sm)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', color: 'var(--primary)' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', color: 'var(--primary)' }}>About</h1>
        <p style={{ margin: '8px 0 0', fontSize: 'var(--text-xs)', color: 'oklch(0 0 0 / 40%)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)' }}>Student Driver Log</p>
      </div>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={p}>Student Driver Log started as a personal itch. When my son was working toward his Illinois driver's license, we needed to log 50 hours of supervised driving — and the spreadsheet we were using wasn't cutting it. So I built something better.</p>
        <p style={p}>There are other apps that do this. This one is mine, and now yours too if it's useful. It's free, it runs in your browser, and it installs on your phone's home screen without any app store involved.</p>
      </section>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={h2}>What it does</h2>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            'Tracks daytime and nighttime driving hours for each session',
            'Supports multiple student accounts under one parent login',
            'Generates a printable report matching Illinois SOS Form DSD X 152.4',
            'Works as an installable app on iOS and Android home screens',
            'Free — no subscriptions, no ads, no account required beyond your own login',
          ].map((item) => (
            <li key={item} style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: 'var(--accent)', fontWeight: 900, flexShrink: 0 }}>→</span>
              <span style={p}>{item}</span>
            </li>
          ))}
        </ul>
      </section>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={h2}>Feedback &amp; issues</h2>
        <p style={p}>Found a bug? Have a suggestion? The project is open source. <a href="#" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 2 }}>Open an issue on GitHub</a> and I'll take a look.</p>
      </section>
    </div>
  );
}
window.AboutScreen = AboutScreen;
