'use client';

import Image from 'next/image';

import { PortableBody } from '@/components/sheet/PortableBody';
import { Sheet } from '@/components/sheet/Sheet';
import { siteContent } from '@/lib/fixtures/content';
import type { AboutSection } from '@/types/content';

export function AboutSheet({ section }: { section: AboutSection }) {
  return (
    <Sheet title={section.title}>
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <PortableBody value={section.body} />

        {section.key === 'team' ? (
          <ul className="grid gap-6 sm:grid-cols-2">
            {section.teamMembers.map((member) => (
              <li key={member.name} className="flex flex-col gap-3">
                <div className="relative aspect-square overflow-hidden bg-neutral-900">
                  <Image
                    src={member.portrait.src}
                    alt={member.portrait.alt}
                    fill
                    sizes="300px"
                    unoptimized={member.portrait.src.endsWith('.svg')}
                    className="object-cover"
                  />
                </div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-neutral-400">{member.role}</p>
              </li>
            ))}
          </ul>
        ) : null}

        {section.key === 'process' ? (
          <ol className="space-y-6">
            {section.processSteps
              .slice()
              .sort((a, b) => a.step - b.step)
              .map((step) => (
                <li key={step.step} className="flex gap-4">
                  <span className="font-mono text-sm text-neutral-500">
                    {String(step.step).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="mt-1 text-neutral-300">{step.description}</p>
                  </div>
                </li>
              ))}
          </ol>
        ) : null}

        {section.key === 'why' ? (
          <PortableBody value={siteContent.settings.poem} />
        ) : null}

        {section.key === 'services' ? (
          <ul className="space-y-6">
            {section.services.map((service) => (
              <li key={service.slug.current}>
                <p className="font-semibold">{service.title}</p>
                <p className="mt-1 text-neutral-300">{service.description}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Sheet>
  );
}
