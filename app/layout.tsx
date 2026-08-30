import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Third Kind',
  description:
    'A creative agency producing films, documentaries, and commercials.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
