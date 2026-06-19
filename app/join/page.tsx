import Nav from '@/components/Nav';
import JoinClient from './JoinClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Join Us — General Purpose' };

export default function JoinPage() {
  return (
    <>
      <Nav variant="static" />
      <JoinClient />
    </>
  );
}
