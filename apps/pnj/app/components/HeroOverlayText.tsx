'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';

// Brand copy anchored bottom-left over the hero scrim.
// Entrance: subtitle mask → gold hairline → title lines (no char/blur).
// Scroll: scrubbed fade + drift out as the hero yields to the canvas.
// pointer-events:none so it never catches scroll or clicks.
export default function HeroOverlayText() {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = ref.current;
    if (!root) return;

    const subtitleEl = root.querySelector<HTMLElement>('.h-subtitle');
    const lineEl = root.querySelector<HTMLElement>('.h-line');
    const titleInners = root.querySelectorAll<HTMLElement>('.h-title-inner');
    const parallaxEl = root.querySelector<HTMLElement>('.h-parallax');

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (subtitleEl) gsap.set(subtitleEl, { yPercent: 100 });
        if (lineEl)
          gsap.set(lineEl, { scaleX: 0, transformOrigin: 'left center' });
        if (titleInners.length) gsap.set(titleInners, { yPercent: 110 });

        // Starts after hero ken-burns has mostly settled (~0.05 + 1.4).
        const tl = gsap.timeline({ delay: 0.55 });

        if (subtitleEl) {
          tl.to(
            subtitleEl,
            { yPercent: 0, duration: 0.7, ease: 'power3.out' },
            0
          );
        }

        if (lineEl) {
          tl.to(lineEl, { scaleX: 1, duration: 0.7, ease: 'power3.out' }, 0.2);
        }

        if (titleInners.length) {
          tl.to(
            titleInners,
            {
              yPercent: 0,
              duration: 0.85,
              stagger: 0.1,
              ease: 'power3.out',
            },
            0.35
          );
        }

        if (parallaxEl) {
          gsap.to(parallaxEl, {
            y: 40,
            autoAlpha: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: '.hero__img',
              start: 'top top',
              end: 'bottom top',
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          });
        }
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        if (subtitleEl) gsap.set(subtitleEl, { yPercent: 0 });
        if (lineEl)
          gsap.set(lineEl, { scaleX: 1, transformOrigin: 'left center' });
        if (titleInners.length) gsap.set(titleInners, { yPercent: 0 });
        if (parallaxEl) gsap.set(parallaxEl, { y: 0, autoAlpha: 1 });
      });
    }, root);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={ref}
      className='hero__copy pointer-events-none absolute inset-0 z-30 flex items-end px-6 pb-20 md:px-12 md:pb-24 lg:px-20'
    >
      <div className='h-parallax w-full max-w-xl'>
        <div className='mb-2 overflow-hidden'>
          <p className='h-subtitle text-sm leading-[1.2] font-medium tracking-[0.2em] text-[#6A5634] uppercase md:text-base'>
            CITIZEN
          </p>
        </div>
        <div className='h-line mb-3 h-px w-16 bg-gradient-to-r from-[#e6b94a] via-[#c79119] to-transparent md:mb-4 md:w-24' />
        <h2 className='h-title text-2xl leading-[1.2] font-medium text-[#003468] sm:text-3xl md:text-5xl md:leading-[1.15]'>
          <span className='block overflow-hidden pb-1'>
            <span className='h-title-inner block'>Đồng Hồ Citizen</span>
          </span>
          <span className='block overflow-hidden pb-1'>
            <span className='h-title-inner block'>L Arcly Nữ Dây Kim Loại</span>
          </span>
        </h2>
      </div>
    </div>
  );
}
