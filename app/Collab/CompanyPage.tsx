import Image from 'next/image';
import type { ReactNode } from 'react';

import { SlideUp } from './SlideUp';
import { ReferenceGallery } from './ReferenceGallery';
import { AgTeamGrid } from './AgTeamGrid';
import headers from './headers.json';
import type { Company } from './companies';

export function CompanyPage({
  company,
  beforeReferences,
}: {
  company: Company;
  beforeReferences?: ReactNode;
}) {
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
          {company.quote.map((paragraph, index) => (
            <p key={index}>{cleanCopy(paragraph)}</p>
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
      {company.proposalImage ? (
        <Image
          className="block h-auto w-full"
          src={company.proposalImage.src}
          alt={company.proposalImage.alt}
          width={company.proposalImage.w}
          height={company.proposalImage.h}
          sizes="100vw"
          unoptimized
        />
      ) : null}
      {company.observations.length ? (
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
      ) : null}
      {company.stories?.length ? (
        <section
          className="collab-section collab-stories"
          aria-labelledby={`${company.id}-story`}
        >
          <h2 id={`${company.id}-story`}>The story</h2>
          {company.stories.map((story) => (
            <section
              key={story.title || story.paragraphs[0]}
              className="collab-story"
            >
              {story.title || story.tag ? (
                <div className="collab-story-heading">
                  {story.title ? <h3>{story.title}</h3> : null}
                  {story.tag ? (
                    <p className="collab-story-tag">
                      {story.tagHref ? (
                        <a href={story.tagHref}>{story.tag}</a>
                      ) : (
                        story.tag
                      )}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div className="collab-copy">
                {story.paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className={
                      story.screenplay ? 'whitespace-pre-line' : undefined
                    }
                  >
                    {story.screenplay
                      ? paragraph
                          .split('**')
                          .map((part, position) =>
                            position % 2 === 0 ? (
                              part
                            ) : (
                              <strong key={position}>{part}</strong>
                            ),
                          )
                      : cleanCopy(paragraph)}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </section>
      ) : null}
      {company.why ? (
        <section
          className="collab-section collab-why"
          aria-labelledby={`${company.id}-why`}
        >
          <h2 id={`${company.id}-why`}>WHY</h2>
          <p className="collab-copy">{company.why}</p>
        </section>
      ) : null}
      {beforeReferences}
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
      {company.process?.length ? (
        <section
          className="collab-section"
          aria-labelledby={`${company.id}-process`}
        >
          <h2 id={`${company.id}-process`}>Process</h2>
          <ul className="collab-observations collab-copy">
            {company.process.map((step, index) => (
              <li key={index}>{cleanCopy(step)}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {company.costBook?.length ? (
        <CostBook
          id={`${company.id}-cost-book`}
          groups={company.costBook}
          title={company.costBookTitle}
        />
      ) : null}
      {company.results?.length ? (
        <section
          className="collab-section"
          aria-labelledby={`${company.id}-results`}
        >
          <h2 id={`${company.id}-results`}>Results</h2>
          <ul className="collab-observations collab-copy">
            {company.results.map((result, index) => (
              <li key={index}>{cleanCopy(result)}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <footer className="collab-section collab-footer">
        <a
          className="collab-copy"
          href="https://thirdkindcreative.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          thirdkindcreative.com
        </a>
      </footer>
    </SlideUp>
  );
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function CostBook({
  id,
  groups,
  title = 'Cost Book',
}: {
  id: string;
  groups: NonNullable<Company['costBook']>;
  title?: string;
}) {
  const showGroups = groups.length > 1;
  const total = groups.reduce(
    (sum, group) =>
      sum + group.lines.reduce((groupSum, line) => groupSum + line.amount, 0),
    0,
  );

  return (
    <section className="collab-section collab-cost-book" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <div className="collab-cost-book-list">
        {groups.map((group) => {
          const subtotal = group.lines.reduce(
            (sum, line) => sum + line.amount,
            0,
          );
          return (
            <div key={group.title} className="collab-cost-group">
              {showGroups ? <h3>{group.title}</h3> : null}
              <ul>
                {group.lines.map((line) => (
                  <li key={line.label}>
                    <span>{line.label}</span>
                    <span>{formatMoney(line.amount)}</span>
                  </li>
                ))}
                {showGroups ? (
                  <li className="collab-cost-subtotal">
                    <span>Subtotal</span>
                    <span>{formatMoney(subtotal)}</span>
                  </li>
                ) : null}
              </ul>
            </div>
          );
        })}
        <div className="collab-cost-total">
          <span>Total</span>
          <span>{formatMoney(total)}</span>
        </div>
      </div>
    </section>
  );
}
