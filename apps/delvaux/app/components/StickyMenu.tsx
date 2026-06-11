'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Bottom-fixed action bar with anchor links + CTA buttons. Anchor clicks
// route through Lenis (when present) so scroll easing matches the rest of
// the page; falls back to gsap ScrollToPlugin if Lenis isn't mounted.
export default function StickyMenu() {
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={ref}
      // Mobile (<md): only the 2 black CTAs to keep the menu under
      // viewport width. Anchor links (Description/Discover/Information)
      // hidden — section context is obvious from scroll position. Desktop
      // shows the full set including anchors.
      className='fixed bottom-4 left-1/2 z-50 max-w-[calc(100vw-1rem)] -translate-x-1/2 rounded-full border border-black/5 bg-white shadow-lg md:bottom-6'
    >
      <ul className='flex items-center gap-2 px-2 py-2 text-sm md:gap-6 md:px-6 md:py-3'>
        <li className='hidden md:block'>
          <a
            href='#description'
            className='transition-opacity hover:opacity-60'
          >
            Description
          </a>
        </li>
        <li className='hidden md:block'>
          <a href='#discover' className='transition-opacity hover:opacity-60'>
            Discover
          </a>
        </li>
        <li className='hidden md:block'>
          <a
            href='#information'
            className='transition-opacity hover:opacity-60'
          >
            Information
          </a>
        </li>
        <li>
          <a
            href='https://www.manoloblahnik.com/int/contact/contact/index/'
            target='_blank'
            rel='noopener noreferrer'
            className='block rounded-full bg-black px-3 py-2 text-[10px] tracking-wider whitespace-nowrap text-white uppercase transition-colors hover:bg-neutral-800 md:px-4 md:text-xs'
          >
            Book an appointment
          </a>
        </li>
        <li>
          <a
            href='https://www.manoloblahnik.com/int/ronconasli-99920.html'
            target='_blank'
            rel='noopener noreferrer'
            className='block rounded-full bg-black px-3 py-2 text-[10px] tracking-wider whitespace-nowrap text-white uppercase transition-colors hover:bg-neutral-800 md:px-4 md:text-xs'
          >
            Buy now
          </a>
        </li>
      </ul>
    </div>
  );
}
