import Image from 'next/image';

import { CompanyPage } from '../Collab/CompanyPage';
import { company } from './company';

const characterImages = [
  {
    file: 'shoes',
    alt: 'Blue trainers with white stripes',
    width: 1080,
    height: 702,
  },
  { file: 'shorts', alt: 'White tennis shorts', width: 1284, height: 1252 },
  {
    file: 'racket',
    alt: 'Close-up of a vintage tennis racket',
    width: 1067,
    height: 1600,
  },
  {
    file: 'socks',
    alt: 'Blue socks with cream stripes',
    width: 1192,
    height: 1478,
  },
  {
    file: 'shirt',
    alt: 'White tennis club T-shirt with a 1986 graphic',
    width: 1194,
    height: 1396,
  },
  {
    file: 'tennis-player',
    alt: 'Tennis player mid-swing in a red headband and retro whites',
    width: 920,
    height: 1600,
  },
];

export default function Page() {
  return (
    <CompanyPage
      company={company}
      beforeReferences={
        <section
          className="collab-character"
          aria-labelledby="crediabank-character"
        >
          <div className="collab-section">
            <h2 id="crediabank-character">Character</h2>
            <p className="collab-copy">
              He looks like someone you might see at your local tennis court.
              The retro kit, the raised eyebrow and the way he celebrates one
              good shot like he’s won Wimbledon give him a quiet comic edge.
              He’s an ordinary guy with enough odd little details to make you
              curious about him.
            </p>
          </div>
          <div
            className="grid"
            style={{
              gridTemplateColumns: characterImages
                .map(({ width, height }) => `minmax(0, ${width / height}fr)`)
                .join(' '),
            }}
          >
            {characterImages.map(({ file, alt, width, height }) => (
              <Image
                key={file}
                className="block h-auto w-full"
                src={`/crediabank/character/${file}.webp`}
                alt={alt}
                width={width}
                height={height}
                unoptimized
              />
            ))}
          </div>
        </section>
      }
    />
  );
}
