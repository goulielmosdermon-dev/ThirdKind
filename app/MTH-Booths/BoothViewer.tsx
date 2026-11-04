'use client';

import { useEffect, useRef, useState } from 'react';
import type { BoothSceneControls } from './booth-scene';

export function BoothViewer() {
  const host = useRef<HTMLDivElement>(null);
  const enterButton = useRef<HTMLButtonElement>(null);
  const controls = useRef<BoothSceneControls | null>(null);
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [walking, setWalking] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!started || !host.current) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    import('./booth-scene')
      .then(async ({ createBoothScene }) => {
        if (cancelled || !host.current) return;
        const scene = await createBoothScene(host.current, setProgress);
        if (cancelled) {
          scene.dispose();
          return;
        }
        controls.current = scene;
        dispose = scene.dispose;
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
      dispose?.();
      controls.current = null;
    };
  }, [started, attempt]);

  return (
    <section className="booth-explore" aria-label="Interactive 3D booth">
      <div className="booth-viewer" ref={host}>
        {!ready && (
          <div className="booth-viewer-cover">
            {!started ? (
              <button
                className="booth-enter"
                ref={enterButton}
                onClick={() => setStarted(true)}
              >
                Enter 3D Scene <span aria-hidden="true">↗</span>
              </button>
            ) : error ? (
              <>
                <p>We couldn’t open the 3D scene.</p>
                <button
                  onClick={() => {
                    setError(false);
                    setProgress(0);
                    setAttempt((a) => a + 1);
                  }}
                >
                  Try again
                </button>
              </>
            ) : (
              <div role="status">
                <p>
                  {progress < 100
                    ? `Loading scene · ${progress}%`
                    : 'Preparing your view…'}
                </p>
                <div className="booth-load-track">
                  <span style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
        )}
        {started && (
          <button
            className="booth-back"
            onClick={async () => {
              if (document.fullscreenElement) await document.exitFullscreen();
              setStarted(false);
              setReady(false);
              setWalking(false);
              setError(false);
              setProgress(0);
              requestAnimationFrame(() =>
                enterButton.current?.focus({ preventScroll: true }),
              );
            }}
          >
            Back to Presentation
          </button>
        )}
        {ready && (
          <>
            <div className="booth-viewer-tools" aria-label="Scene controls">
              <button
                aria-pressed={!walking}
                onClick={() => {
                  controls.current?.setWalking(false);
                  setWalking(false);
                }}
              >
                Rotate
              </button>
              <button
                aria-pressed={walking}
                onClick={() => {
                  controls.current?.setWalking(true);
                  setWalking(true);
                }}
              >
                Walk
              </button>
              <button
                onClick={() => {
                  controls.current?.reset();
                  setWalking(false);
                }}
              >
                Reset view
              </button>
              <button
                onClick={() => {
                  if (document.fullscreenElement)
                    void document.exitFullscreen();
                  else void host.current?.requestFullscreen();
                }}
              >
                Full screen
              </button>
            </div>
            <p className="booth-viewer-hint">
              {walking
                ? 'Drag to look · W A S D or arrow keys to move'
                : 'Drag to rotate · Scroll to zoom · Right-drag to pan'}
            </p>
            {walking && (
              <div className="booth-walk-pad" aria-label="Walk controls">
                {[
                  ['forward', '↑'],
                  ['left', '←'],
                  ['back', '↓'],
                  ['right', '→'],
                ].map(([direction, label]) => (
                  <button
                    key={direction}
                    aria-label={`Move ${direction}`}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      controls.current?.move(direction!, true);
                    }}
                    onPointerUp={() =>
                      controls.current?.move(direction!, false)
                    }
                    onPointerCancel={() =>
                      controls.current?.move(direction!, false)
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
