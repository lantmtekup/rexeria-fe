'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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

// Quiet left rail for desktop — micro ticks + whisper labels.
// Scroll targets use ScrollTrigger pin starts (not raw #id offsets).
export default function StickyMenu() {
  const [activeId, setActiveId] = useState<NavId | null>(null);

  const activeIndex = useMemo(
    () => NAV_LINKS.findIndex(l => l.id === activeId),
    [activeId]
  );

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

    // Spy via ScrollTrigger + Lenis — avoid a raw window scroll listener.
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

  // Contact sits on a dark field — invert the rail so it stays legible.
  const onDark = activeId === 'contact';
  const progress =
    activeIndex < 0 ? 0 : activeIndex / Math.max(NAV_LINKS.length - 1, 1);

  return (
    <aside
      className='pointer-events-none fixed top-1/2 left-4 z-[45] hidden -translate-y-1/2 md:block lg:left-5'
      aria-label='Page sections'
    >
      <nav
        className={`group/rail pointer-events-auto relative transition-colors duration-500 ${
          onDark ? 'text-white' : 'text-[#003468]'
        }`}
      >
        {/* Track centered in the 12px marker column */}
        <span
          aria-hidden='true'
          className='pointer-events-none absolute top-2 bottom-2 left-0 w-3'
        >
          <span
            className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 ${
              onDark ? 'bg-white/20' : 'bg-[#003468]/12'
            }`}
          />
          <span
            className={`absolute top-0 left-1/2 w-px origin-top -translate-x-1/2 transition-[height,background-color] duration-500 ease-out ${
              onDark ? 'bg-[#d4af37]/80' : 'bg-[#003468]/45'
            }`}
            style={{ height: `${progress * 100}%` }}
          />
        </span>

        <ul className='relative flex flex-col gap-7'>
          {NAV_LINKS.map(({ id, label }, index) => {
            const isActive = activeId === id;
            const isPast = activeIndex >= 0 && index < activeIndex;

            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  data-cta-id={`nav-${id}`}
                  aria-label={label}
                  aria-current={isActive ? 'true' : undefined}
                  tabIndex={0}
                  onClick={e => handleNavClick(e, id)}
                  onKeyDown={e => handleKeyDown(e, id)}
                  className='group/item grid grid-cols-[12px_auto] items-center gap-3.5 outline-none focus-visible:rounded-sm focus-visible:ring-1 focus-visible:ring-current/40'
                >
                  <span
                    aria-hidden='true'
                    className='relative z-10 flex h-3 w-3 items-center justify-center'
                  >
                    <span
                      className={`block h-1.5 w-1.5 rotate-45 transition-[transform,background-color] duration-300 ease-out ${
                        isActive
                          ? onDark
                            ? 'scale-[1.35] bg-[#d4af37]'
                            : 'scale-[1.35] bg-[#003468]'
                          : isPast
                            ? onDark
                              ? 'bg-white/55'
                              : 'bg-[#003468]/40'
                            : onDark
                              ? 'bg-white/25 group-hover/item:bg-white/60'
                              : 'bg-[#003468]/20 group-hover/item:bg-[#003468]/50'
                      }`}
                    />
                  </span>

                  <span
                    className={`text-[9px] font-normal tracking-[0.22em] whitespace-nowrap uppercase transition-[opacity,transform,color] duration-300 ease-out ${
                      isActive
                        ? onDark
                          ? 'translate-x-0 text-white/90 opacity-100'
                          : 'translate-x-0 text-[#003468]/85 opacity-100'
                        : onDark
                          ? '-translate-x-1 text-white/50 opacity-0 group-hover/item:!opacity-90 group-hover/rail:translate-x-0 group-hover/rail:opacity-35'
                          : '-translate-x-1 text-[#003468]/50 opacity-0 group-hover/item:!opacity-80 group-hover/rail:translate-x-0 group-hover/rail:opacity-30'
                    }`}
                  >
                    {label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
