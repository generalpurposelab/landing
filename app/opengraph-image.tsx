import { ImageResponse } from 'next/og';

export const alt = 'General Purpose — A venture studio for what matters.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#303030',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        {/* GP coin */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: '#fd7804',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            color: '#eeeeee',
            fontFamily: 'Georgia, serif',
            letterSpacing: '-0.01em',
          }}
        >
          GP
        </div>

        <div
          style={{
            fontSize: 52,
            color: '#eeeeee',
            fontFamily: 'Georgia, serif',
            letterSpacing: '-0.02em',
            fontWeight: 400,
          }}
        >
          General Purpose
        </div>

      </div>
    ),
    { ...size }
  );
}
