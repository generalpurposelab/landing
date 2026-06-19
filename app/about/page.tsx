import Nav from '@/components/Nav';
import AboutClient from './AboutClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About — General Purpose' };

export default function AboutPage() {
  return (
    <>
      <Nav variant="static" />
      <AboutClient />
    </>
  );
}
