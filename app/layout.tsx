import { Figtree, IBM_Plex_Mono } from 'next/font/google';
import localFont from 'next/font/local';

import './globals.css';

import type { Metadata } from 'next';

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  display: 'swap',
});

// Nib Pro carries the display voice: Regular for the smaller settings — index
// lines, précis, sheet copy — and SemiBold for the headers proper, which is
// what `font-semibold` reaches for.
const nib = localFont({
  src: [
    { path: './fonts/NibPro-Regular.ttf', weight: '400', style: 'normal' },
    { path: './fonts/NibPro-SemiBold.ttf', weight: '600', style: 'normal' },
  ],
  variable: '--font-nib',
  display: 'swap',
});

// Ford's own condensed ultra, used on the Ford deck's closing line and
// nowhere else.
const ford = localFont({
  src: './fonts/FranklinCondITCPro-Ultra.otf',
  variable: '--font-ford-face',
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
      className={`${figtree.variable} ${nib.variable} ${ford.variable} ${plex.variable}`}
    >
      <body className="bg-void font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
