import localFont from 'next/font/local';

import { BoothDrawings } from './BoothDrawings';
import './booths.css';

import type { Metadata } from 'next';

const helixa = localFont({
  src: '../MTH/Helixa-Bold.otf',
  weight: '700',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mind The Hack — Booths',
  robots: { index: false, follow: false },
};

export default function BoothsPage() {
  return (
    <main className={`booths-page ${helixa.className}`}>
      <BoothDrawings />
    </main>
  );
}
