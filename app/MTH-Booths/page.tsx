import localFont from 'next/font/local';
import Image from 'next/image';

import { BoothViewer } from './BoothViewer';
import { BoothDrawings } from './BoothDrawings';
import { ReferenceGallery } from '../Collab/ReferenceGallery';
import finals from './finals.json';
import '../Collab/collab.css';
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
      <header className="booths-hero">
        <Image
          src="/MTH-Booths/front.png"
          alt="Mind The Hack booth with green architectural elements and visitors"
          fill
          priority
          unoptimized
          sizes="100vw"
        />
        <h1>Booths</h1>
        <a
          className="booths-scroll-cue"
          href="#booth-drawings"
          aria-label="Scroll to booth drawings"
        >
          <svg viewBox="0 0 32 40" fill="none" aria-hidden="true">
            <path
              d="M5 15l11 11 11-11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </header>
      <div id="booth-drawings">
        <BoothDrawings />
      </div>
      <section className="booth-finals" aria-labelledby="booth-finals-title">
        <ReferenceGallery
          images={finals}
          headingId="booth-finals-title"
          heading="Booth renders"
        />
      </section>
      <BoothViewer />
    </main>
  );
}
