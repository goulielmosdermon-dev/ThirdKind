'use client';

import { BookCallButton } from '@/components/inquiry/BookCallButton';
import { AppLink } from '@/components/mobile/MobileChrome';

const NAV = [
  { label: 'Work', href: '/' },
  { label: 'About', href: '/about/team' },
  // Process is hidden for now; restore this entry to bring the section back.
  // { label: 'Process', href: '/about/process' },
  { label: 'Why', href: '/about/why' },
  { label: 'Services', href: '/about/services' },
  { label: 'Contact', href: '/contact' },
] as const;

const LEGAL = [
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Cookie Notice', href: '/legal/cookies' },
  { label: 'Terms of Service', href: '/legal/terms' },
] as const;

const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/thirdkindcreative',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/goulielmos-dermon-64a8ba18a',
  },
] as const;

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer
      data-chrome
      data-surface="dark"
      className={
        compact
          ? 'bg-black px-5 pt-12 pb-40 text-white'
          : 'bg-black px-[8vw] pt-16 pb-32 text-white'
      }
    >
      <div
        className={
          compact
            ? 'flex flex-col items-start gap-10'
            : 'flex flex-col gap-12 md:flex-row md:items-start md:justify-between'
        }
      >
        <div className={compact ? 'flex gap-10' : 'flex gap-12 md:gap-20'}>
          <nav aria-label="Footer">
            <ul className="flex flex-col gap-2">
              {NAV.map((item) => (
                <li key={item.href}>
                  <AppLink
                    href={item.href}
                    className="text-[1.05rem] leading-snug text-white/80 transition-colors hover:text-white"
                  >
                    {item.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Legal">
            <ul className="flex flex-col gap-2">
              {LEGAL.map((item) => (
                <li key={item.href}>
                  <AppLink
                    href={item.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {item.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div
          className={
            compact
              ? 'flex flex-col items-start gap-8'
              : 'flex flex-col gap-8 md:items-end'
          }
        >
          <BookCallButton tone="paper" />
          <ul
            className={
              compact
                ? 'flex flex-col gap-2'
                : 'flex flex-col gap-2 md:items-end'
            }
          >
            {SOCIALS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={compact ? 'mt-12' : 'mt-16 flex sm:justify-end'}>
        <p className="text-sm text-white/40">© 2026 Third Kind</p>
      </div>
    </footer>
  );
}
