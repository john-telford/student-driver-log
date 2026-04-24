import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#006B3C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="white" strokeWidth="10" />
          <line x1="50" y1="6" x2="50" y2="34" stroke="white" strokeWidth="8" strokeLinecap="round" />
          <line x1="50" y1="66" x2="50" y2="94" stroke="white" strokeWidth="8" strokeLinecap="round" />
          <line x1="6" y1="50" x2="34" y2="50" stroke="white" strokeWidth="8" strokeLinecap="round" />
          <line x1="66" y1="50" x2="94" y2="50" stroke="white" strokeWidth="8" strokeLinecap="round" />
          <circle cx="50" cy="50" r="10" fill="white" />
        </svg>
      </div>
    ),
    { width: 32, height: 32 },
  );
}
