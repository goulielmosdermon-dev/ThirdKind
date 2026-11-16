import localFont from 'next/font/local';

import '../Collab/collab.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const helixa = localFont({
  src: '../MTH/Helixa-Bold.otf',
  weight: '700',
  variable: '--font-collab',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Has Scytàles Car Safety — ThirdKind',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={`collab ${helixa.variable}`}>
      <main>{children}</main>
    </div>
  );
}
