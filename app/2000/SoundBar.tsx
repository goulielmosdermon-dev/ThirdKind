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
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [missing, setMissing] = useState(false);

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
    const onError = () => {
      setMissing(true);
      setPlaying(false);
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('error', onError);
    };
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
    } catch {
      // Refused, or there is nothing there to play.
      setMissing(true);
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
    <div className={`max-w-[34rem] ${className}`}>
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

      {missing ? (
        <p className="mt-[0.6em] text-[0.7em] text-mute">
          The track has not been added yet.
        </p>
      ) : null}
    </div>
  );
}
