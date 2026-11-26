import localFont from 'next/font/local';

import '../Collab/collab.css';
import './crediabank.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const averta = localFont({
  src: './Averta-Regular.otf',
  weight: '400',
  variable: '--font-collab',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CrediaBank, ThirdKind',
  description: 'A tennis film concept by ThirdKind for CrediaBank.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={`collab crediabank ${averta.variable}`}>
      <main>{children}</main>
    </div>
  );
}
