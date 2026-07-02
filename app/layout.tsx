import type { Metadata } from 'next';
import './globals.css';
import MouseTrail from '@/components/MouseTrail';

export const metadata: Metadata = {
  title: 'General Purpose',
  description: 'A venture studio for what matters.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.fontshare.com" />
      </head>
      <body>
        <MouseTrail />
        {children}
      </body>
    </html>
  );
}
