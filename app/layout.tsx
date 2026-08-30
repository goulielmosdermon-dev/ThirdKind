import { AppShell } from '@/components/AppShell';
import { Figtree, Fraunces, IBM_Plex_Mono } from 'next/font/google';

import './globals.css';

import type { Metadata } from 'next';

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
});

const plex = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Third Kind',
  description:
    'A creative agency producing films, documentaries, and commercials.',
};

export default function RootLayout({ children, sheet }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${fraunces.variable} ${plex.variable}`}
    >
      <body className="bg-void font-sans text-ink antialiased">
        <AppShell sheet={sheet}>{children}</AppShell>
      </body>
    </html>
  );
}
