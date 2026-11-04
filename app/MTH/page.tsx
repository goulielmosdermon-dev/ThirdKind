import Image from 'next/image';
import localFont from 'next/font/local';

import images from './images.json';
import { ScriptBody } from './ScriptBody';
import './mdh.css';

import type { Metadata } from 'next';

const helixa = localFont({
  src: './Helixa-Bold.otf',
  weight: '700',
  variable: '--font-mdh-helixa',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mind The Hack — Product Video',
  robots: { index: false, follow: false },
};

const speakers = [
  {
    name: 'Speaker 1 / CEO',
    paragraphs: [
      'Security teams are drowning in thousands of vulnerability alerts every week. But a long list of theoretical risks does not tell you if your critical assets are safe.',
      'At Mind The Hack we have developed a completely unique technology.',
      "It's an AI engine called Omnial that thinks and acts like a hacker…",
      'It allows us to see every weakness, every open door, anyplace across systems.',
      'And that sort of visibility was unavailable before.',
    ],
  },
  {
    name: 'Speaker 2 / CTO',
    paragraphs: [
      "You simply cannot allow the ability to miss what's going on… and finding an open door is only part of the battle.",
      'How do you know what attackers can exploit, and which of those flaws connect to form a clear path straight to your most critical assets?',
      "Omnial is a security system, guaranteed to find the weak points, regardless of what's happening on the network by prioritizing the exact path an attacker would take.",
      'The security team then targets the fix that matters, and the moment a patch goes live, automatic retesting verifies that the threat is completely neutralized.',
    ],
  },
  {
    name: 'Speaker 3 / Ethical Hacker',
    paragraphs: [
      "Omnials AI is backed by ethical hackers. People who break into systems for a living are now bringing available what's called continuous penetration testing.",
      'We can have hundreds of systems being tested every 12, every 8, every 4, 5, 6 hours. And we can get that picture to us continuously.',
      'So that every day you can get a repeating test on the same systems with the ability to do this weak-point detection on an every 24-hour basis.',
    ],
  },
  {
    name: 'Speaker 1 / CEO',
    paragraphs: [
      "If you go from checking annually to hourly, you're enabling for the first time the potential of stopping breaches, data leaks, stopping ransomware, stopping attacks before they happen.",
      "It's a new way to protect life online because it's the first time that really we can reach anywhere at any time.",
    ],
  },
];

export default function MdhPage() {
  return (
    <main className={`mdh-page ${helixa.className} ${helixa.variable}`}>
      <header className="mdh-hero">
        <video
          src="https://player.vimeo.com/progressive_redirect/playback/1242979369/rendition/1440p/file.mp4%20%281440p%29.mp4?loc=external&log_user=0&signature=8adac79842b28599288bacbfa67ddfffad7f9332dbca1c8f863c14ef38d2d4eb#t=1"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Mind The Hack product video"
        />
        <p className="mdh-video-label">Product video</p>
        <a
          className="mdh-scroll-cue"
          href="#mdh-script-title"
          aria-label="Scroll to script"
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

      <section className="mdh-quote-section" aria-label="Our goal">
        <blockquote className="mdh-animation-quote">
          <span className="mdh-quote-mark" aria-hidden="true">
            “
          </span>
          <p>
            Our goal is to create an engaging brand video for Mind The Hack that
            steers away from corporate dullness and approaches a problem →
            solution structure, while allowing the viewer to clearly understand
            the platform and core features without getting overly technical.
          </p>
          <span className="mdh-quote-mark mdh-quote-close" aria-hidden="true">
            ”
          </span>
        </blockquote>
      </section>

      <section className="mdh-script" aria-labelledby="mdh-script-title">
        <h1 id="mdh-script-title">Script</h1>
        <ScriptBody speakers={speakers} />
      </section>

      <section className="mdh-images" aria-label="Brand video image references">
        {images.map((image) => (
          <figure key={image.src}>
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              unoptimized
              loading="lazy"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          </figure>
        ))}
      </section>
      <section
        className="mdh-animation-heading"
        aria-labelledby="mdh-animation-title"
      >
        <h2 id="mdh-animation-title">
          Some animation styles we thing are a good fit
        </h2>
      </section>
      <section className="mdh-animations" aria-labelledby="mdh-animation-title">
        {[1, 2, 3].map((number) => (
          <div key={number} className="mdh-animation-frame">
            <video
              src={`/MDH/animations/example-${number}.mp4`}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={`Animation example ${number}`}
            />
          </div>
        ))}
      </section>
      <section className="mdh-thank-you">
        <h2>Thank you for considering this project!</h2>
      </section>
    </main>
  );
}
