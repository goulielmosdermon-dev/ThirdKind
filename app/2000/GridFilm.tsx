'use client';

import Player from '@vimeo/player';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { isUnoptimizedAsset } from '@/lib/content/mediaSrc';
import { VIMEO_LOOP_FILE, vimeoPlayerSrc } from '@/lib/content/vimeo';
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

function ExpandGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
      <path
        d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
      />
    </svg>
  );
}

function CollapseGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
      <path
        d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
      />
    </svg>
  );
}

function Poster({ poster, sizes }: { poster?: ImageAsset; sizes: string }) {
  const [ok, setOk] = useState(true);
  if (!poster || !ok) {
    return null;
  }
  return (
    <Image
      src={poster.src}
      alt={poster.alt}
      fill
      sizes={sizes}
      unoptimized={isUnoptimizedAsset(poster)}
      className="pointer-events-none absolute inset-0 z-[1] object-cover"
      onError={() => setOk(false)}
    />
  );
}

function Seek({
  progress,
  duration,
  onSeek,
}: {
  progress: number;
  duration: number;
  onSeek: (clientX: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!draggingRef.current) {
        return;
      }
      onSeek(event.clientX);
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
  }, [onSeek]);

  return (
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
        onSeek(event.clientX);
      }}
    >
      <span className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-white/30" />
      <span
        className="absolute top-1/2 left-0 h-px -translate-y-1/2 bg-white"
        style={{ width: `${progress * 100}%` }}
      />
      <span className="sr-only">{duration}</span>
    </div>
  );
}

function FilmBox({
  vimeoId,
  title,
  poster,
  chrome,
  frozen = false,
  onExpand,
  sizes,
}: {
  vimeoId: string;
  title: string;
  poster?: ImageAsset;
  chrome: 'cell' | 'popup';
  frozen?: boolean;
  onExpand?: () => void;
  sizes: string;
}) {
  const file = VIMEO_LOOP_FILE[vimeoId];
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<Player | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    if (file) {
      return;
    }
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
  }, [file, vimeoId]);

  useEffect(() => {
    if (!frozen) {
      return;
    }
    const video = videoRef.current;
    if (video && !video.paused) {
      video.pause();
    }
    void playerRef.current?.pause();
  }, [frozen]);

  useEffect(() => {
    const onChange = () => {
      setWide(document.fullscreenElement === boxRef.current);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  async function togglePlay() {
    if (frozen) {
      return;
    }
    const video = videoRef.current;
    if (video) {
      try {
        if (video.paused) {
          await video.play();
        } else {
          video.pause();
        }
      } catch {
        // Autoplay rejection — leave the poster up.
      }
      return;
    }
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

  function seekBar(clientX: number, bar: DOMRect) {
    const ratio = Math.min(1, Math.max(0, (clientX - bar.left) / bar.width));
    setProgress(ratio);
    const video = videoRef.current;
    if (video && duration > 0) {
      video.currentTime = ratio * duration;
      return;
    }
    if (playerRef.current && duration > 0) {
      void playerRef.current.setCurrentTime(ratio * duration);
    }
  }

  async function toggleWide() {
    const box = boxRef.current;
    if (!box) {
      return;
    }
    try {
      if (document.fullscreenElement === box) {
        await document.exitFullscreen();
      } else {
        await box.requestFullscreen();
      }
    } catch {
      onExpand?.();
    }
  }

  const bar = chrome === 'popup';

  return (
    <div
      ref={boxRef}
      data-surface="dark"
      className="group/film relative aspect-video overflow-hidden bg-black"
    >
      {file ? (
        <video
          ref={videoRef}
          title={title}
          src={file}
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
          onPlay={() => {
            setPlaying(true);
            setStarted(true);
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setStarted(false);
            setProgress(0);
          }}
          onTimeUpdate={(event) => {
            const video = event.currentTarget;
            if (video.duration > 0) {
              setDuration(video.duration);
              setProgress(video.currentTime / video.duration);
            }
          }}
        />
      ) : (
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
          className={`pointer-events-none h-full w-full ${
            poster && !started ? 'invisible' : ''
          }`}
          allow="autoplay; fullscreen"
        />
      )}
      {poster && !started ? <Poster poster={poster} sizes={sizes} /> : null}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={() => {
          void togglePlay();
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
      <div
        className={`absolute inset-x-0 bottom-0 z-10 flex items-center gap-3 px-2 pb-2 ${
          bar ? 'px-3 pb-3' : ''
        }`}
      >
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
        {bar ? (
          <Seek
            progress={progress}
            duration={duration}
            onSeek={(clientX) => {
              const node = boxRef.current?.querySelector('[role="slider"]');
              if (!node) {
                return;
              }
              seekBar(clientX, node.getBoundingClientRect());
            }}
          />
        ) : null}
        {bar ? (
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center text-white"
            aria-label={wide ? 'Exit full screen' : 'Full screen'}
            onClick={(event) => {
              event.stopPropagation();
              void toggleWide();
            }}
          >
            {wide ? <CollapseGlyph /> : <ExpandGlyph />}
          </button>
        ) : null}
      </div>
      {chrome === 'cell' && onExpand ? (
        <button
          type="button"
          className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center text-white opacity-0 transition-opacity group-hover/film:opacity-100 focus-visible:opacity-100"
          aria-label="Full screen"
          onClick={(event) => {
            event.stopPropagation();
            onExpand();
          }}
        >
          <ExpandGlyph />
        </button>
      ) : null}
    </div>
  );
}

export function GridFilm({
  vimeoId,
  title,
  poster,
}: {
  vimeoId: string;
  title: string;
  poster?: ImageAsset;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' ||
        event.key === ' ' ||
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.key === 'PageDown' ||
        event.key === 'PageUp'
      ) {
        event.preventDefault();
        event.stopPropagation();
        if (event.key === 'Escape') {
          setOpen(false);
        }
      }
    };
    window.addEventListener('keydown', onKey, true);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <FilmBox
        vimeoId={vimeoId}
        title={title}
        poster={poster}
        chrome="cell"
        frozen={open}
        sizes="(min-width: 768px) 22vw, 45vw"
        onExpand={() => setOpen(true)}
      />
      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 px-5 md:px-12"
              onClick={() => setOpen(false)}
            >
              <div
                className="w-full max-w-[72rem]"
                onClick={(event) => event.stopPropagation()}
              >
                <FilmBox
                  vimeoId={vimeoId}
                  title={title}
                  poster={poster}
                  chrome="popup"
                  sizes="90vw"
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
