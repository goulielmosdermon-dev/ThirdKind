import Image from 'next/image';

import { SlideUp } from './SlideUp';
import { ReferenceGallery } from './ReferenceGallery';
import { AgTeamGrid } from './AgTeamGrid';
import headers from './headers.json';
import type { Company } from './companies';

export function CompanyPage({ company }: { company: Company }) {
  const hero = headers[company.id as keyof typeof headers];
  const cleanCopy = (copy: string) => copy.replace(/\s*[—–]\s*/g, ', ');
  return (
    <SlideUp id={company.id}>
      <header
        className={`collab-header ${company.id === 'abek' ? 'collab-header-abek' : ''}`}
      >
        {company.id === 'abek' ? (
          <Image
            className="collab-hero-art"
            src={hero.src}
            alt={hero.alt}
            width={hero.w}
            height={hero.h}
            priority
            unoptimized
          />
        ) : (
          <Image
            className="collab-hero-image"
            src={hero.src}
            alt={hero.alt}
            fill
            priority
            unoptimized
            sizes="100vw"
          />
        )}
        <h1>{company.name}</h1>
      </header>
      <section
        className="collab-section collab-proposal"
        aria-label="Our proposal"
      >
        <blockquote>
          <span className="collab-quote-mark" aria-hidden="true">
            “
          </span>
          {company.quote.map((paragraph) => (
            <p key={paragraph}>{cleanCopy(paragraph)}</p>
          ))}
          <span
            className="collab-quote-mark collab-quote-close"
            aria-hidden="true"
          >
            ”
          </span>
        </blockquote>
        {company.id === 'ag-design' ? <AgTeamGrid /> : null}
      </section>
      <section
        className="collab-section"
        aria-labelledby={`${company.id}-observations`}
      >
        <h2 id={`${company.id}-observations`}>Observations</h2>
        <ul className="collab-observations collab-copy">
          {company.observations.map((observation) => (
            <li key={observation}>{cleanCopy(observation)}</li>
          ))}
        </ul>
      </section>
      {company.stories?.length ? (
        <section
          className="collab-section collab-stories"
          aria-labelledby={`${company.id}-story`}
        >
          <h2 id={`${company.id}-story`}>The story</h2>
          {company.stories.map((story) => (
            <section key={story.title} className="collab-story">
              <div className="collab-story-heading">
                <h3>{story.title}</h3>
                {story.tag ? (
                  <p className="collab-story-tag">{story.tag}</p>
                ) : null}
              </div>
              <div className="collab-copy">
                {story.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{cleanCopy(paragraph)}</p>
                ))}
              </div>
            </section>
          ))}
        </section>
      ) : null}
      {company.references.length ? (
        <section
          className="collab-reference-section"
          aria-labelledby={`${company.id}-references`}
        >
          <ReferenceGallery
            key={company.id}
            images={company.references}
            headingId={`${company.id}-references`}
          />
        </section>
      ) : null}
    </SlideUp>
  );
}
