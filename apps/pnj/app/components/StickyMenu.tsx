'use client';

import { useCallback, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const NAV_LINKS = [
  { id: 'discover', label: 'Discover' },
  { id: 'description', label: 'Description' },
  { id: 'information', label: 'Information' },
  { id: 'contact', label: 'Contact' },
] as const;

type NavId = (typeof NAV_LINKS)[number]['id'];

type LenisLike = {
  scroll: number;
  scrollTo: (
    target: number | string | HTMLElement,
    opts?: { duration?: number; immediate?: boolean }
  ) => void;
  on: (event: string, cb: () => void) => void;
  off: (event: string, cb: () => void) => void;
};

const getLenis = (): LenisLike | undefined =>
  (window as unknown as { __lenis?: LenisLike }).__lenis;

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Resolve scroll Y for a section — prefer pinned ScrollTrigger.start. */
const getSectionScrollY = (id: string): number | null => {
  const el = document.getElementById(id);
  if (!el) return null;

  const matches = ScrollTrigger.getAll().filter(t => {
    const trigger = t.trigger;
    if (!trigger || !(trigger instanceof Element)) return false;
    return trigger === el || el.contains(trigger);
  });

  const pinned = matches.find(t => Boolean(t.pin));
  if (pinned) return pinned.start;

  const topTop = matches.find(t => {
    const start = t.vars?.start;
    return typeof start === 'string' && start.trim().startsWith('top top');
  });
  if (topTop) return topTop.start;

  return el.getBoundingClientRect().top + window.scrollY;
};

const getSectionRange = (id: string): { start: number; end: number } | null => {
  const el = document.getElementById(id);
  if (!el) return null;

  const matches = ScrollTrigger.getAll().filter(t => {
    const trigger = t.trigger;
    if (!trigger || !(trigger instanceof Element)) return false;
    return trigger === el || el.contains(trigger);
  });

  const pinned = matches.find(t => Boolean(t.pin));
  if (pinned) return { start: pinned.start, end: pinned.end };

  const topTop = matches.find(t => {
    const start = t.vars?.start;
    return typeof start === 'string' && start.trim().startsWith('top top');
  });
  if (topTop) return { start: topTop.start, end: topTop.end };

  const start = el.getBoundingClientRect().top + window.scrollY;
  return { start, end: start + el.offsetHeight };
};

const getScrollY = (): number => {
  const lenis = getLenis();
  if (lenis && typeof lenis.scroll === 'number') return lenis.scroll;
  return window.scrollY;
};

const scrollToY = (y: number) => {
  const reduced = prefersReducedMotion();
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(y, reduced ? { immediate: true } : { duration: 1.2 });
    return;
  }
  window.scrollTo({
    top: y,
    behavior: reduced ? 'auto' : 'smooth',
  });
};

export default function StickyMenu() {
  const [activeId, setActiveId] = useState<NavId | null>(null);

  const updateActive = useCallback(() => {
    const y = getScrollY();
    let next: NavId | null = null;

    for (const { id } of NAV_LINKS) {
      const range = getSectionRange(id);
      if (!range) continue;
      if (y >= range.start - 2) next = id;
    }

    setActiveId(prev => (prev === next ? prev : next));
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    updateActive();

    const onScroll = () => updateActive();
    const onRefresh = () => updateActive();

    const spy = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: onScroll,
      onRefresh: onRefresh,
    });
    ScrollTrigger.addEventListener('refresh', onRefresh);

    let lenis: LenisLike | undefined;
    let tries = 0;
    let retryId = 0;
    const bindLenis = () => {
      lenis = getLenis();
      if (lenis) {
        lenis.on('scroll', onScroll);
        return;
      }
      if (tries < 20) {
        tries += 1;
        retryId = window.setTimeout(bindLenis, 50);
      }
    };
    bindLenis();

    return () => {
      spy.kill();
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      lenis?.off('scroll', onScroll);
      window.clearTimeout(retryId);
    };
  }, [updateActive]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: NavId
  ) => {
    e.preventDefault();
    const y = getSectionScrollY(id);
    if (y === null) return;
    scrollToY(y);
    setActiveId(id);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLAnchorElement>,
    id: NavId
  ) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    const y = getSectionScrollY(id);
    if (y === null) return;
    scrollToY(y);
    setActiveId(id);
  };

  const handleBuyNow = () => {
    const y = getSectionScrollY('contact');
    if (y === null) return;
    scrollToY(y);
  };

  return (
    <aside
      className='pointer-events-none fixed inset-x-0 bottom-0 z-[45] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:pb-4 md:px-6'
      aria-label='Page sections'
    >
      <nav className='pointer-events-auto mx-auto flex w-fit max-w-full items-center gap-3 bg-white py-1.5 pr-1.5 pl-3 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] sm:gap-6 sm:py-2 sm:pr-2 sm:pl-6'>
        <ul className='flex min-w-0 [scrollbar-width:none] items-center gap-3 overflow-x-auto [-ms-overflow-style:none] sm:gap-6 [&::-webkit-scrollbar]:hidden'>
          {NAV_LINKS.map(({ id, label }) => {
            const isActive = activeId === id;

            return (
              <li key={id} className='shrink-0'>
                <a
                  href={`#${id}`}
                  data-cta-id={`nav-${id}`}
                  aria-label={label}
                  aria-current={isActive ? 'true' : undefined}
                  tabIndex={0}
                  onClick={e => handleNavClick(e, id)}
                  onKeyDown={e => handleKeyDown(e, id)}
                  className={`text-xs whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 sm:text-sm ${
                    isActive
                      ? 'text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>

        <button
          type='button'
          data-cta-id='nav-buy-now'
          aria-label='Buy now'
          tabIndex={0}
          onClick={handleBuyNow}
          onKeyDown={e => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            handleBuyNow();
          }}
          className='shrink-0 bg-black px-3.5 py-2.5 text-[10px] font-medium tracking-[0.12em] text-white uppercase transition-colors duration-200 outline-none hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 sm:px-7 sm:py-3.5 sm:text-sm'
        >
          Buy now
        </button>
      </nav>
    </aside>
  );
}
