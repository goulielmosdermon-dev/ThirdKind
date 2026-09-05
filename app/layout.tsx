import { Figtree, IBM_Plex_Mono } from 'next/font/google';
import localFont from 'next/font/local';

import './globals.css';

import type { Metadata } from 'next';

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  display: 'swap',
});

const plantin = localFont({
  src: './fonts/PlantinInfantMTStd-Regular.otf',
  variable: '--font-plantin',
  display: 'swap',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${plantin.variable} ${plex.variable}`}
    >
      <body className="bg-void font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
