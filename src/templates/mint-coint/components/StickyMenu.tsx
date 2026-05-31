'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

const NAV_LINKS = [
  { id: 'description', label: 'Description' },
  { id: 'discover', label: 'Discover' },
  { id: 'information', label: 'Information' },
] as const;

// Bottom-fixed action bar with anchor links + CTA buttons. Scroll-spies
// the three target sections via IntersectionObserver and animates an
// underline under the currently-active link. Anchor clicks route through
// Lenis (when present) so scroll easing matches the rest of the page.
export default function StickyMenu() {
  const ref = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // GSAP smooth-scroll on anchor click (unchanged from original).
  useEffect(() => {
    gsap.registerPlugin(ScrollToPlugin);
    const root = ref.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const links = root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
      links.forEach(a => {
        a.addEventListener('click', e => {
          const id = a.getAttribute('href');
          if (!id || id === '#') return;
          const target = document.querySelector(id);
          if (!target) return;
          e.preventDefault();
          const lenis = (
            window as unknown as {
              __lenis?: { scrollTo: (t: Element, o?: object) => void };
            }
          ).__lenis;
          if (lenis) {
            lenis.scrollTo(target, { offset: -80, duration: 1.4 });
          } else {
            gsap.to(window, {
              scrollTo: { y: target as Element, offsetY: 80 },
              duration: 1.2,
            });
          }
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  // Scroll-spy via IntersectionObserver. Active zone = middle 50% of
  // viewport (rootMargin -25% top + bottom). Whichever tracked section
  // has the highest intersection ratio inside that band wins.
  useEffect(() => {
    const targets = NAV_LINKS.map(({ id }) =>
      document.getElementById(id)
    ).filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-25% 0px -25% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    targets.forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      // Mobile (<md): only the 2 black CTAs. Anchors hidden — section
      // context is obvious from scroll position. Desktop shows the full
      // set including anchors with the scroll-spy underline.
      className='fixed bottom-4 left-1/2 z-50 max-w-[calc(100vw-1rem)] -translate-x-1/2 rounded-full border border-black/5 bg-white shadow-lg md:bottom-6'
    >
      <ul className='flex items-center gap-2 px-2 py-2 text-sm md:gap-6 md:px-6 md:py-3'>
        {NAV_LINKS.map(({ id, label }) => {
          const isActive = activeId === id;
          return (
            <li key={id} className='hidden md:block'>
              <a
                href={`#${id}`}
                data-rexer-cta={`nav-${id}`}
                className={`relative inline-block pb-1 transition-colors duration-300 ${
                  isActive
                    ? 'font-medium text-black'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                {label}
                {/* Underline — scale-x transform for smooth slide-in animation */}
                <span
                  aria-hidden='true'
                  className={`absolute right-0 -bottom-0.5 left-0 h-[1.5px] origin-left bg-black transition-transform duration-300 ease-out ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </a>
            </li>
          );
        })}
        <li>
          <a
            href='https://www.mint.ca/en/contact-us'
            target='_blank'
            rel='noopener noreferrer'
            data-rexer-cta='contact-mint'
            className='block rounded-full bg-black px-3 py-2 text-[10px] tracking-wider whitespace-nowrap text-white uppercase transition-colors hover:bg-neutral-800 md:px-4 md:text-xs'
          >
            Contact the mint
          </a>
        </li>
      </ul>
    </div>
  );
}
