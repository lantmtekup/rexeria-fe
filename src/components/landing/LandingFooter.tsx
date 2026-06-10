import Link from 'next/link';

import { Logo } from '@/components/atoms/logo';

const COLS = [
  {
    title: 'Main links',
    links: [
      { href: '/rexer/projects', label: 'Projects' },
      { href: '/rexer/about', label: 'About us' },
      { href: '/sign-in', label: 'Sign in' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/rexer/about', label: 'About us' },
      { href: '/rexer/contact', label: 'Contact' },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className='border-t border-neutral-200 bg-neutral-50'>
      <div className='mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 md:grid-cols-4'>
        <div className='sm:col-span-2 md:col-span-2'>
          <Logo size={22} />
          <p className='mt-4 max-w-xs text-sm text-neutral-500'>
            The platform that helps brands build sites, manage products, and run
            marketing campaigns — powered by AI.
          </p>
        </div>
        {COLS.map(col => (
          <div key={col.title}>
            <h3 className='text-sm font-semibold text-neutral-900'>
              {col.title}
            </h3>
            <ul className='mt-4 space-y-2'>
              {col.links.map((l, i) => (
                <li key={`${l.href}-${i}`}>
                  <Link
                    href={l.href}
                    className='text-sm text-neutral-500 transition-colors hover:text-neutral-900'
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className='border-t border-neutral-200'>
        <div className='mx-auto max-w-6xl px-6 py-6 text-sm text-neutral-400'>
          © {2026} Rexer. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
