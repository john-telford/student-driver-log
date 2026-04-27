'use client';

// global-error replaces the root layout entirely — must include html+body,
// and cannot use Tailwind design tokens. Inline styles are intentional here.
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: '#ffffff',
          fontFamily: 'sans-serif',
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            padding: 6,
            background: '#ffffff',
            borderRadius: 24,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            border: '3px solid #111111',
            width: '100%',
            maxWidth: 380,
          }}
        >
          <div
            style={{
              background: '#006B3C',
              borderRadius: '1.1rem',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              alignItems: 'center',
            }}
          >
            <div>
              <p style={{ color: '#FFCD00', fontSize: 72, fontWeight: 900, margin: 0, lineHeight: 1 }}>
                500
              </p>
              <h1
                style={{
                  color: '#ffffff',
                  fontSize: 18,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  margin: '0.5rem 0',
                }}
              >
                Unexpected Detour
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: 0 }}>
                Something went wrong on our end.
              </p>
              {error.digest && (
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'monospace', marginTop: '0.5rem' }}>
                  ref: {error.digest}
                </p>
              )}
            </div>
            <button
              onClick={unstable_retry}
              style={{
                background: '#FFCD00',
                color: '#111111',
                border: 'none',
                borderRadius: 6,
                padding: '10px 24px',
                fontSize: 13,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
