'use client';

import Player from '@vimeo/player';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import { isUnoptimizedAsset } from '@/lib/content/mediaSrc';
import { vimeoPlayerSrc } from '@/lib/content/vimeo';
import type { ImageAsset } from '@/types/content';

function PlayGlyph() {
  return (
    <svg viewBox="0 0 12 14" className="h-3.5 w-3" aria-hidden>
      <path d="M0 0v14l12-7z" fill="currentColor" />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg viewBox="0 0 12 14" className="h-3.5 w-3" aria-hidden>
      <rect x="0" y="0" width="4" height="14" fill="currentColor" />
      <rect x="8" y="0" width="4" height="14" fill="currentColor" />
    </svg>
  );
}

export function FilmPlayer({
  vimeoId,
  title,
  poster,
}: {
  vimeoId: string;
  title: string;
  /** Shown in place of Vimeo's own thumbnail until the film first plays. */
  poster?: ImageAsset;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<Player | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const player = playerRef.current;
      const track = trackRef.current;
      if (!player || !track || duration <= 0) {
        return;
      }
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(
        1,
        Math.max(0, (clientX - rect.left) / rect.width),
      );
      setProgress(ratio);
      void player.setCurrentTime(ratio * duration);
    },
    [duration],
  );

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }
    const player = new Player(iframe);
    playerRef.current = player;

    void player.getDuration().then((value) => {
      if (Number.isFinite(value) && value > 0) {
        setDuration(value);
      }
    });

    const onPlay = () => {
      setPlaying(true);
      setStarted(true);
    };
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
    };
    const onTime = (data: { seconds: number; duration: number }) => {
      if (draggingRef.current) {
        return;
      }
      if (data.duration > 0) {
        setDuration(data.duration);
        setProgress(data.seconds / data.duration);
      }
    };

    player.on('play', onPlay);
    player.on('pause', onPause);
    player.on('ended', onEnded);
    player.on('timeupdate', onTime);

    return () => {
      player.off('play', onPlay);
      player.off('pause', onPause);
      player.off('ended', onEnded);
      player.off('timeupdate', onTime);
      playerRef.current = null;
    };
  }, [vimeoId]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!draggingRef.current) {
        return;
      }
      seekFromClientX(event.clientX);
    };
    const onUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [seekFromClientX]);

  async function togglePlay() {
    const player = playerRef.current;
    if (!player) {
      return;
    }
    try {
      await player.ready();
      const paused = await player.getPaused();
      if (paused) {
        await player.play();
      } else {
        await player.pause();
      }
    } catch {
      // Privacy or autoplay rejection — leave controls as they are.
    }
  }

  return (
    <div
      data-surface="dark"
      className="relative aspect-video overflow-hidden bg-black"
    >
      <iframe
        ref={iframeRef}
        title={title}
        src={vimeoPlayerSrc(vimeoId, {
          controls: '0',
          title: '0',
          byline: '0',
          portrait: '0',
          pip: '0',
          dnt: '1',
          playsinline: '1',
          keyboard: '0',
        })}
        className="pointer-events-none h-full w-full"
        allow="autoplay; fullscreen"
      />
      {poster && !started ? (
        <Image
          src={poster.src}
          alt={poster.alt}
          fill
          sizes="(min-width: 1100px) 1100px, 88vw"
          unoptimized={isUnoptimizedAsset(poster)}
          className="pointer-events-none absolute inset-0 object-cover"
        />
      ) : null}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={() => {
          void togglePlay();
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-3 px-3 pb-3 pt-2">
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center text-white"
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={(event) => {
            event.stopPropagation();
            void togglePlay();
          }}
        >
          {playing ? <PauseGlyph /> : <PlayGlyph />}
        </button>
        <div
          ref={trackRef}
          className="relative h-8 flex-1 cursor-pointer"
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          tabIndex={0}
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            draggingRef.current = true;
            seekFromClientX(event.clientX);
          }}
          onKeyDown={(event) => {
            if (duration <= 0 || !playerRef.current) {
              return;
            }
            const step = 0.02;
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
              event.preventDefault();
              const next = Math.min(
                1,
                Math.max(
                  0,
                  progress + (event.key === 'ArrowRight' ? step : -step),
                ),
              );
              setProgress(next);
              void playerRef.current.setCurrentTime(next * duration);
            }
          }}
        >
          <span className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-white/30" />
          <span
            className="absolute top-1/2 left-0 h-px -translate-y-1/2 bg-white"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
