'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';

import { FilmPlayer } from '@/components/sheet/FilmPlayer';
import { isUnoptimizedAsset } from '@/lib/content/mediaSrc';
import { VIMEO_LOOP_FILE, vimeoPlayerSrc } from '@/lib/content/vimeo';
import type { ImageAsset, WorkBeat } from '@/types/content';

function SilentLoop({ vimeoId }: { vimeoId: string }) {
  const fileSrc = VIMEO_LOOP_FILE[vimeoId];

  if (fileSrc) {
    return (
      <div data-surface="dark" className="overflow-hidden bg-black">
        <video autoPlay muted loop playsInline className="h-auto w-full">
          <source src={fileSrc} type="video/mp4" />
        </video>
      </div>
    );
  }

  return (
    <div
      data-surface="dark"
      className="relative aspect-video overflow-hidden rounded-md bg-black"
    >
      <iframe
        title="Silent film loop"
        src={vimeoPlayerSrc(vimeoId, {
          background: '1',
          autoplay: '1',
          muted: '1',
          loop: '1',
          autopause: '0',
        })}
        className="pointer-events-none h-full w-full"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}

function Still({ image }: { image: ImageAsset }) {
  return (
    <figure>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes="(min-width: 1100px) 1100px, 88vw"
        unoptimized={isUnoptimizedAsset(image)}
        className="h-auto w-full rounded-md"
        style={{ aspectRatio: 'auto' }}
      />
    </figure>
  );
}

/** A single vertical loop cell in the reel strip. */
function ReelCell({ vimeoId }: { vimeoId: string }) {
  const fileSrc = VIMEO_LOOP_FILE[vimeoId];

  return (
    <li
      data-surface="dark"
      className="relative aspect-[9/16] overflow-hidden rounded-md bg-black"
    >
      {fileSrc ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={fileSrc} type="video/mp4" />
        </video>
      ) : (
        <iframe
          title="Silent film loop"
          src={vimeoPlayerSrc(vimeoId, {
            background: '1',
            autoplay: '1',
            muted: '1',
            loop: '1',
            autopause: '0',
          })}
          className="pointer-events-none absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen"
        />
      )}
    </li>
  );
}

/** Four vertical loops across, closing the page above the services list. */
export function WorkReel({ vimeoIds }: { vimeoIds: string[] }) {
  if (vimeoIds.length === 0) {
    return null;
  }

  return (
    <ul className="grid grid-cols-4 gap-1.5">
      {vimeoIds.map((vimeoId) => (
        <ReelCell key={vimeoId} vimeoId={vimeoId} />
      ))}
    </ul>
  );
}

export function WorkStory({
  beats,
  density = 'editorial',
}: {
  beats: WorkBeat[];
  density?: 'compact' | 'editorial';
}) {
  const copyClass =
    density === 'editorial'
      ? 'max-w-[38rem] text-[1.05rem] leading-[1.8] text-ink'
      : 'max-w-[38rem] text-body leading-relaxed text-ink';

  const blocks: Array<{ key: string; node: ReactNode }> = [];
  let index = 0;
  while (index < beats.length) {
    const beat = beats[index];
    if (!beat) {
      break;
    }
    if (beat._type === 'copy') {
      blocks.push({
        key: `copy-${index}`,
        node: <p className={copyClass}>{beat.text}</p>,
      });
      index += 1;
      continue;
    }
    if (beat._type === 'image') {
      blocks.push({
        key: beat.image.src,
        node: <Still image={beat.image} />,
      });
      index += 1;
      continue;
    }
    if (beat._type === 'silentVideo') {
      blocks.push({
        key: beat.vimeoId,
        node: <SilentLoop vimeoId={beat.vimeoId} />,
      });
      index += 1;
      continue;
    }
    blocks.push({
      key: beat.vimeoId,
      node: (
        <FilmPlayer vimeoId={beat.vimeoId} title="Film" poster={beat.poster} />
      ),
    });
    index += 1;
  }

  return (
    <div className="flex flex-col gap-14 @md:gap-16">
      {blocks.map((block) => (
        <div key={block.key}>{block.node}</div>
      ))}
    </div>
  );
}

export function HeroFilm({
  vimeoId,
  title,
}: {
  vimeoId: string;
  title: string;
}) {
  return <FilmPlayer vimeoId={vimeoId} title={title} />;
}
