'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { SlideState } from './SwapRun';

function PlayGlyph({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 12 14" className={className} aria-hidden>
      <path d="M0 0v14l12-7z" fill="currentColor" />
    </svg>
  );
}

function PauseGlyph({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 12 14" className={className} aria-hidden>
      <rect x="0" y="0" width="4" height="14" fill="currentColor" />
      <rect x="8" y="0" width="4" height="14" fill="currentColor" />
    </svg>
  );
}

/**
 * A piece of music: the mark, the track, and whose it is, held to the middle
 * of the slide.
 *
 * Nothing is loaded until it is asked for — a deck is read, not listened to,
 * and a track that fetches itself on arrival is a download nobody asked for.
 *
 * Once the reader is past it the control follows them down the page, held to
 * the corner, so the music can be started or stopped from wherever they have
 * got to rather than by going back to find it.
 */
export function SoundBar({
  src,
  title,
  artist,
  className,
}: {
  src: string;
  title: string;
  artist: string;
  className: string;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [past, setPast] = useState(false);

  /*
    On a deck that swaps, the bar never leaves the screen — the slide it sits
    on is faded out in place — so there is nothing for an observer to see and
    the run it belongs to says where it stands instead.
  */
  const slide = useContext(SlideState);
  const away = slide === null ? past : slide === 'above';

  useEffect(() => {
    const audio = ref.current;
    if (!audio) {
      return;
    }
    const onEnd = () => setPlaying(false);
    audio.addEventListener('ended', onEnd);
    return () => audio.removeEventListener('ended', onEnd);
  }, []);

  /* Followed only once it is behind them: a control in the corner while the
     thing it controls is on screen is the same button twice. */
  useEffect(() => {
    const bar = barRef.current;
    if (!bar || slide !== null) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setPast(!entry.isIntersecting && entry.boundingClientRect.top < 0);
        }
      },
      { threshold: 0 },
    );
    observer.observe(bar);
    return () => observer.disconnect();
  }, [slide]);

  async function toggle() {
    const audio = ref.current;
    if (!audio) {
      return;
    }
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      // Refused by the browser; the control stays as it was.
      setPlaying(false);
    }
  }

  return (
    <div ref={barRef} className={`text-center ${className}`}>
      <audio ref={ref} src={src} preload="none" />

      <button
        type="button"
        onClick={() => void toggle()}
        aria-label={playing ? `Pause ${title}` : `Play ${title}`}
        className="mx-auto flex cursor-pointer items-center gap-[0.7em] border-0 bg-transparent p-0 text-ink transition-opacity duration-300 hover:opacity-70"
      >
        {playing ? (
          <PauseGlyph className="h-[0.8em] w-auto" />
        ) : (
          <PlayGlyph className="h-[0.8em] w-auto" />
        )}
        <span className="tracking-[0.06em] uppercase">{title}</span>
      </button>

      <p className="mt-[0.5em] text-mute">{artist}</p>

      {/* The same control, kept to the corner once the track is behind the
          reader — whether or not it was ever started, since starting it is
          one of the two things it is for.

          Portalled, so it is out from under whatever the slide it belongs to
          is doing: on a deck that swaps, that slide is faded out and deaf to
          the pointer by the time this is wanted. `away` starts false, so the
          server and the first client render agree on nothing being here. */}
      {typeof document !== 'undefined' && away
        ? createPortal(
            <button
              type="button"
              onClick={() => void toggle()}
              aria-label={playing ? `Pause ${title}` : `Play ${title}`}
              className="fixed right-8 bottom-8 z-50 cursor-pointer border-0 bg-transparent p-0 text-ink transition-opacity duration-500 hover:opacity-60"
            >
              {playing ? (
                <PauseGlyph className="h-7 w-auto" />
              ) : (
                <PlayGlyph className="h-7 w-auto" />
              )}
            </button>,
            document.body,
          )
        : null}
    </div>
  );
}
