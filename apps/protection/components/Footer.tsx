'use client';

import { FOOTER, NAV } from '../app/site';

/**
 * Footer: newsletter + nav + legal + social + copyright. Mirror gốc.
 */
export function Footer() {
  return (
    <footer className='relative z-10 border-t border-black/10 bg-white px-6 py-16 md:px-12'>
      <div className='mx-auto grid max-w-6xl gap-12 md:grid-cols-2'>
        <div>
          <h3 className='dot text-3xl font-semibold text-[var(--grey)] md:text-4xl'>
            {FOOTER.newsletter.title}
          </h3>
          <form
            className='mt-6 flex max-w-md items-center border-b border-[var(--grey)]/40 pb-2'
            onSubmit={e => e.preventDefault()}
          >
            <input
              type='email'
              placeholder='Your email'
              className='w-full bg-transparent text-sm outline-none placeholder:text-[var(--grey)]/50'
            />
            <button
              type='submit'
              className='shrink-0 text-sm font-semibold text-[var(--yellow)] uppercase'
            >
              Subscribe
            </button>
          </form>
          <p className='mt-4 max-w-md text-xs leading-relaxed text-[var(--grey)]/60'>
            {FOOTER.newsletter.note}
          </p>
        </div>

        <div className='flex flex-col items-start gap-8 md:items-end'>
          <nav className='flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold lowercase md:justify-end'>
            {NAV.map(item => (
              <a
                key={item.href}
                href={item.href}
                className='dot transition-colors hover:text-[var(--yellow)]'
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className='flex gap-4 text-xs font-semibold tracking-[0.16em] text-[var(--grey)]/70'>
            {FOOTER.social.map(s => (
              <a key={s} href='#' className='hover:text-[var(--yellow)]'>
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className='mx-auto mt-14 flex max-w-6xl flex-col gap-3 border-t border-black/10 pt-6 text-xs tracking-[0.12em] text-[var(--grey)]/60 uppercase md:flex-row md:items-center md:justify-between'>
        <span>{FOOTER.copyright}</span>
        <div className='flex flex-wrap gap-x-6 gap-y-1'>
          {FOOTER.legal.map(l => (
            <a key={l} href='#' className='hover:text-[var(--yellow)]'>
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
