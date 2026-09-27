const { SignCard, BrandMark, Input, Label, Button } = window.StudentDriverLogDesignSystem_97c292;

function LoginScreen({ onSignIn, onRegister }) {
  return (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '48px 16px' }}>
      <SignCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12, borderBottom: '2px solid var(--on-green-rule)', paddingBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <BrandMark variant="shield" size={80} assetBase="../../assets" />
            </div>
            <BrandMark variant="wordmark" size={24} color="#fff" />
            <span style={{ fontSize: 'var(--text-micro)', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', color: 'var(--on-green-tertiary)' }}>
              Learner Permit Hour Tracker
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <Label htmlFor="email" onGreen>Email</Label>
              <Input id="email" type="email" onGreen defaultValue="john@example.com" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <Label htmlFor="password" onGreen style={{ marginBottom: 0 }}>Password</Label>
                <a href="#" style={{ fontSize: 'var(--text-micro)', color: 'color-mix(in oklab, var(--accent) 80%, transparent)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', textDecoration: 'none' }}>Forgot?</a>
              </div>
              <Input id="password" type="password" onGreen defaultValue="••••••••" />
            </div>
            <Button variant="onGreen" fullWidth onClick={onSignIn}>Sign In</Button>
          </div>

          <div style={{ borderTop: '1px solid oklch(1 0 0 / 20%)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ margin: 0, textAlign: 'center', fontSize: 'var(--text-micro)', color: 'oklch(1 0 0 / 50%)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)' }}>
              Need an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); onRegister && onRegister(); }} style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Register</a>
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 'var(--text-micro)', color: 'var(--on-green-faint)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)' }}>
              {['About', 'Privacy', 'Terms', 'FAQ'].map((l) => <a key={l} href="#" style={{ color: 'inherit', textDecoration: 'none' }}>{l}</a>)}
            </div>
          </div>
        </div>
      </SignCard>
    </div>
  );
}
window.LoginScreen = LoginScreen;
