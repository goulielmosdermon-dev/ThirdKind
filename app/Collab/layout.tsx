import localFont from 'next/font/local';

import { CollabNav } from './CollabNav';
import './collab.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const helixa = localFont({
  src: '../MTH/Helixa-Bold.otf',
  weight: '700',
  variable: '--font-collab',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ThirdKind — Collaborations',
  robots: { index: false, follow: false },
};

export default function CollabLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`collab ${helixa.variable}`}>
      <CollabNav />
      <main>{children}</main>
    </div>
  );
}
