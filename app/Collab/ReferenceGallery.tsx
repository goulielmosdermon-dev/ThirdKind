'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import type { Plate } from '../2000/deck';

type ReferenceImage = Plate & { cropScale?: number };

export function ReferenceGallery({
  images,
  headingId,
  heading = 'References',
}: {
  images: ReferenceImage[];
  headingId: string;
  heading?: string;
}) {
  const [view, setView] = useState<'grid' | 'stack'>('grid');
  const [selected, setSelected] = useState<ReferenceImage | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!selected || !element) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = previous;
    };
  }, [selected]);

  return (
    <>
      <div className="collab-reference-heading">
        <h2 id={headingId}>{heading}</h2>
        <div
          className="collab-view-controls"
          role="group"
          aria-label="Reference layout"
        >
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
            onClick={() => setView('grid')}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              {[3, 10, 17].flatMap((y) =>
                [3, 10, 17].map((x) => (
                  <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" />
                )),
              )}
            </svg>
          </button>
          <button
            type="button"
            aria-label="Full-width stacked view"
            aria-pressed={view === 'stack'}
            onClick={() => setView('stack')}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="7" />
              <rect x="3" y="14" width="18" height="7" />
            </svg>
          </button>
        </div>
      </div>
      <div className="collab-reference-grid" data-view={view}>
        {images.map((image) => (
          <figure key={image.src}>
            <button
              type="button"
              className="collab-reference-item"
              onClick={() => setSelected(image)}
              aria-label={`Preview ${image.alt}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                style={
                  image.cropScale
                    ? { transform: `scale(${image.cropScale})` }
                    : undefined
                }
                width={image.w}
                height={image.h}
                unoptimized
                loading="lazy"
                sizes={
                  view === 'stack' ? '100vw' : '(max-width: 640px) 100vw, 33vw'
                }
              />
            </button>
          </figure>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="collab-image-preview"
        aria-label="Full-screen image preview"
        onCancel={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setSelected(null);
        }}
      >
        <button
          type="button"
          className="collab-preview-close"
          aria-label="Close image preview"
          onClick={() => setSelected(null)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
        {selected ? (
          <div
            className="collab-preview-frame"
            style={{
              width: `min(100%, calc((100dvh - 104px) * ${selected.w / selected.h}))`,
              aspectRatio: `${selected.w} / ${selected.h}`,
            }}
          >
            <Image
              className="collab-preview-image"
              src={selected.src}
              alt={selected.alt}
              width={selected.w}
              height={selected.h}
              unoptimized
              sizes="100vw"
              style={
                selected.cropScale
                  ? { transform: `scale(${selected.cropScale})` }
                  : undefined
              }
            />
          </div>
        ) : null}
      </dialog>
    </>
  );
}
