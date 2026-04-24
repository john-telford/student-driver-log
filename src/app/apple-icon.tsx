import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#006B3C',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <svg width="90" height="90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="white" strokeWidth="10" />
          <line x1="50" y1="6" x2="50" y2="34" stroke="white" strokeWidth="8" strokeLinecap="round" />
          <line x1="50" y1="66" x2="50" y2="94" stroke="white" strokeWidth="8" strokeLinecap="round" />
          <line x1="6" y1="50" x2="34" y2="50" stroke="white" strokeWidth="8" strokeLinecap="round" />
          <line x1="66" y1="50" x2="94" y2="50" stroke="white" strokeWidth="8" strokeLinecap="round" />
          <circle cx="50" cy="50" r="10" fill="white" />
        </svg>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            lineHeight: 1.1,
          }}
        >
          <span
            style={{
              color: '#FFCD00',
              fontSize: 17,
              fontWeight: 700,
              fontFamily: 'sans-serif',
              letterSpacing: '0.08em',
            }}
          >
            STUDENT
          </span>
          <span
            style={{
              color: '#FFCD00',
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'sans-serif',
              letterSpacing: '0.12em',
            }}
          >
            DRIVER LOG
          </span>
        </div>
      </div>
    ),
    { width: 180, height: 180 },
  );
}
