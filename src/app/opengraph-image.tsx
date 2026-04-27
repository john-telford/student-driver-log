import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#006B3C',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          padding: 60,
        }}
      >
        {/* Steering wheel */}
        <svg width="160" height="160" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="white" strokeWidth="8" />
          <line x1="50" y1="6" x2="50" y2="34" stroke="white" strokeWidth="7" strokeLinecap="round" />
          <line x1="50" y1="66" x2="50" y2="94" stroke="white" strokeWidth="7" strokeLinecap="round" />
          <line x1="6" y1="50" x2="34" y2="50" stroke="white" strokeWidth="7" strokeLinecap="round" />
          <line x1="66" y1="50" x2="94" y2="50" stroke="white" strokeWidth="7" strokeLinecap="round" />
          <circle cx="50" cy="50" r="9" fill="white" />
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              color: '#ffffff',
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: '-0.01em',
              textAlign: 'center',
              lineHeight: 1,
            }}
          >
            Student Driver Log
          </div>
          <div
            style={{
              color: '#FFCD00',
              fontSize: 32,
              fontWeight: 600,
              textAlign: 'center',
              letterSpacing: '0.02em',
            }}
          >
            Track Illinois learner's permit practice hours
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
