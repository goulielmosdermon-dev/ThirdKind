import { AppShell } from '@/components/AppShell';

import './globals.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Third Kind',
  description:
    'A creative agency producing films, documentaries, and commercials.',
};

export default function RootLayout({ children, sheet }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>
        <AppShell sheet={sheet}>{children}</AppShell>
      </body>
    </html>
  );
}
