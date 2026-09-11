'use client';

import { useEffect, useRef, useState } from 'react';

function PlayGlyph() {
  return (
    <svg viewBox="0 0 12 14" className="h-[0.7em] w-[0.6em]" aria-hidden>
      <path d="M0 0v14l12-7z" fill="currentColor" />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg viewBox="0 0 12 14" className="h-[0.7em] w-[0.6em]" aria-hidden>
      <rect x="0" y="0" width="4" height="14" fill="currentColor" />
      <rect x="8" y="0" width="4" height="14" fill="currentColor" />
    </svg>
  );
}

/**
 * A piece of music, named and playable, read the way a title card is: the
 * mark, the track, whose it is, and a line under it that fills as it runs.
 *
 * Nothing is loaded until it is asked for — a deck is read, not listened to,
 * and a track that fetches itself on arrival is a download nobody asked for.
 *
 * Once the reader has scrolled past it the control follows them down the
 * page, held to the corner, so the music can be stopped from wherever they
 * have got to rather than by scrolling back to find it.
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
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [past, setPast] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) {
      return;
    }
    const onTime = () => {
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  /* Followed only once it is behind them: a control in the corner while the
     thing it controls is on screen is the same button twice. */
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }
        setPast(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

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
      setStarted(true);
    } catch {
      // Refused by the browser; the control stays as it was.
      setPlaying(false);
    }
  }

  function seekTo(clientX: number) {
    const audio = ref.current;
    const track = trackRef.current;
    if (!audio || !track || !audio.duration) {
      return;
    }
    const box = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  }

  return (
    <div ref={barRef} className={`max-w-[34rem] ${className}`}>
      <audio ref={ref} src={src} preload="none" />

      <button
        type="button"
        onClick={() => void toggle()}
        aria-label={playing ? `Pause ${title}` : `Play ${title}`}
        className="flex cursor-pointer items-center gap-[0.7em] border-0 bg-transparent p-0 text-left text-ink transition-opacity duration-300 hover:opacity-70"
      >
        {playing ? <PauseGlyph /> : <PlayGlyph />}
        <span className="tracking-[0.06em] uppercase">{title}</span>
      </button>

      <p className="mt-[0.5em] text-mute">{artist}</p>

      {/* The line under it, which fills as the track runs and can be taken
          hold of to move through it. */}
      <div
        ref={trackRef}
        role="presentation"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          seekTo(event.clientX);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            seekTo(event.clientX);
          }
        }}
        className="mt-[1.2em] h-4 cursor-pointer"
      >
        <div className="relative h-px w-full bg-hairline">
          <div
            className="absolute inset-y-0 left-0 bg-ink"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* The same control, kept to the corner once the track is behind the
          reader. It is only worth showing while there is something to stop. */}
      <button
        type="button"
        onClick={() => void toggle()}
        aria-label={playing ? `Pause ${title}` : `Play ${title}`}
        aria-hidden={!past || !started}
        tabIndex={past && started ? undefined : -1}
        className="fixed right-6 bottom-6 z-50 flex h-11 items-center gap-2 rounded-full border border-hairline bg-paper/90 px-4 text-[0.7rem] tracking-[0.06em] text-ink uppercase shadow-[0_10px_30px_rgb(28_26_22/0.08)] backdrop-blur transition-all duration-500 hover:opacity-80"
        style={{
          opacity: past && started ? 1 : 0,
          transform: past && started ? 'none' : 'translateY(0.75rem)',
          pointerEvents: past && started ? 'auto' : 'none',
        }}
      >
        {playing ? <PauseGlyph /> : <PlayGlyph />}
        <span className="max-w-[15rem] truncate">{title}</span>
      </button>
    </div>
  );
}
