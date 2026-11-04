'use client';

import { useEffect, useRef, type ReactNode } from 'react';

function DrawingSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          section.dataset.visible = 'true';
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  return (
    <section
      ref={ref}
      className={`booth-section booth-section-${number}`}
      aria-labelledby={`booth-${number}`}
    >
      <header className="booth-section-header">
        <span>Mind The Hack / Booth studies</span>
        <h1 id={`booth-${number}`}>
          <span>{number}</span> {title}
        </h1>
      </header>
      <div className="booth-drawing">{children}</div>
      <footer className="booth-section-footer">
        <span>{number} / 03</span>
        <span>
          {number === '01' ? 'Brand mark' : 'Schematic view · not to scale'}
        </span>
      </footer>
    </section>
  );
}

export function BoothDrawings() {
  return (
    <>
      <DrawingSection number="01" title="The mark">
        <svg
          viewBox="0 0 1040 960"
          role="img"
          aria-label="Mind The Hack geometric mark"
          className="booth-mark"
        >
          <g
            className="booth-mark-shapes"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path
              pathLength="1"
              className="booth-fill booth-outline"
              d="M190 224H438V349H314V747H190Z"
            />
            <path
              pathLength="1"
              className="booth-fill booth-outline"
              d="M438 349H568V474H438Z"
            />
            <path
              pathLength="1"
              className="booth-fill booth-outline"
              d="M568 224H692V349H568Z"
            />
            <path
              pathLength="1"
              className="booth-fill booth-outline"
              d="M692 349H818V747H692Z"
            />
            <path
              pathLength="1"
              className="booth-fill booth-outline"
              d="M438 574H568V699H438Z"
            />
          </g>
        </svg>
      </DrawingSection>

      <DrawingSection number="02" title="Top view">
        <svg
          viewBox="0 0 1260 780"
          role="img"
          aria-label="Top-down booth plan with counter, display, laptop and storage"
          className="booth-plan"
        >
          <g className="booth-panel booth-fill">
            <path d="M110 110H1130V620H110Z" />
            <path d="M110 110H1130V312H110Z" />
          </g>
          <g className="booth-lines">
            <path
              className="booth-outline"
              pathLength="1"
              d="M110 110H1130V620H110Z"
            />
            <path
              className="booth-outline"
              pathLength="1"
              d="M110 312H1130M110 312H198V620M110 416H198M110 518H198M1043 312V620M995 312V442H1043"
            />
            <path
              className="booth-outline booth-fine"
              pathLength="1"
              d="M115 115H1125V615M110 110L115 115M1130 110L1125 115M1130 620L1125 615"
            />
          </g>
          <g className="booth-equipment booth-lines">
            <path
              className="booth-panel booth-fill"
              d="M298 473H389V579H289V492Z"
            />
            <path
              className="booth-outline"
              pathLength="1"
              d="M298 473H389V579H289V492ZM289 579L298 572H389M298 473V572M298 490L341 496V548L298 542Z"
            />
            <path
              className="booth-outline"
              pathLength="1"
              d="M327 443Q303 518 327 601L332 602Q317 518 332 443Z"
            />
            <path
              className="booth-outline booth-fine"
              pathLength="1"
              d="M310 521L318 520V527L310 528ZM354 508H378V565H354Z"
            />
            {Array.from({ length: 11 }, (_, i) => (
              <path
                key={i}
                className="booth-outline booth-fine"
                pathLength="1"
                d={`M357 ${512 + i * 4.5}H375`}
              />
            ))}
            {Array.from({ length: 4 }, (_, i) => (
              <path
                key={i}
                className="booth-outline booth-fine"
                pathLength="1"
                d={`M${358 + i * 5} 510V563`}
              />
            ))}
            <ellipse
              className="booth-outline"
              pathLength="1"
              cx="355"
              cy="487"
              rx="9"
              ry="7"
            />
            <path
              className="booth-outline booth-fine"
              pathLength="1"
              d="M351 484H359M355 481V486"
            />
          </g>
        </svg>
      </DrawingSection>

      <DrawingSection number="03" title="Side view">
        <svg
          viewBox="0 0 1270 655"
          role="img"
          aria-label="Side elevation of the booth with display screen and counter"
          className="booth-elevation"
        >
          <g className="booth-panel booth-fill">
            <path d="M120 140H1136V574H120Z" />
            <path d="M120 140H207V574H120ZM1050 140H1136V574H1050Z" />
          </g>
          <g className="booth-lines">
            <path
              className="booth-outline"
              pathLength="1"
              d="M120 140H1136V574H120ZM207 140V574M1050 140V574M1072 140V574M120 246H207M120 348H207"
            />
            <path
              className="booth-outline booth-fine"
              pathLength="1"
              d="M125 146H1131V568H125M120 140L125 146M1136 140L1131 146"
            />
            <path
              className="booth-outline"
              pathLength="1"
              d="M1002 368H1045V375H1002ZM1024 568H1072"
            />
          </g>
          <g className="booth-equipment booth-lines">
            <path
              className="booth-panel booth-fill"
              d="M296 388H397V574H296Z"
            />
            <path
              className="booth-outline"
              pathLength="1"
              d="M296 388H397V574H296ZM296 395H397M305 312L315 311L320 387M308 314L312 387M326 298H344V366H326ZM326 298L330 295H345V364L344 366M330 298V364"
            />
            <path
              className="booth-outline booth-fine"
              pathLength="1"
              d="M338 385Q350 377 360 385M341 384H358M373 382H384V387H373Z"
            />
          </g>
        </svg>
      </DrawingSection>
    </>
  );
}
