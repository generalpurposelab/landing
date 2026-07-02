import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'General Purpose';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const [sphereSvg, wordmarkSvg] = await Promise.all([
    readFile(join(process.cwd(), 'public/assets/icon-sphere.svg')),
    readFile(join(process.cwd(), 'public/assets/Union.svg')),
  ]);

  const sphereUri = `data:image/svg+xml;base64,${sphereSvg.toString('base64')}`;
  const wordmarkUri = `data:image/svg+xml;base64,${wordmarkSvg.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#eeeeee',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sphereUri} width={260} height={260} alt="" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={wordmarkUri} width={480} height={160} alt="General Purpose" style={{ opacity: 0.85 }} />
      </div>
    ),
    { ...size }
  );
}
