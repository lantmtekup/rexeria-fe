'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { useIsomorphicLayoutEffect } from '../lib/use-isomorphic-layout-effect';

// Single-line coin name on the LEFT of the hero. Gold hairline accent draws
// in first, then the name reveals char-by-char with a yPercent + blur
// unmask. Once the entrance timeline finishes, a scrub-driven parallax
// drifts the text downward as the user scrolls through the hero — text
// appears to "linger" while the background image scrolls away.
// pointer-events:none so it never catches scroll or clicks.
interface Props {
  line1?: string;
  line2?: string;
  line3?: string;
}

export default function HeroOverlayText({
  line1 = 'The Jack Pine',
  line2 = 'by Tom Thomson',
  line3 = '1 kilo Pure Gold Coin',
}: Props = {}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = ref.current;
    if (!root) return;

    const lineEl = root.querySelector<HTMLElement>('.h-line');
    const titleEl = root.querySelector<HTMLElement>('.h-title');
    const parallaxEl = root.querySelector<HTMLElement>('.h-parallax');

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.5 });

      if (lineEl) {
        gsap.set(lineEl, { scaleX: 0, transformOrigin: 'left center' });
        tl.to(lineEl, { scaleX: 1, duration: 1.0, ease: 'power3.out' }, 0);
      }

      if (titleEl) {
        const split = new SplitType(titleEl, { types: 'chars' });
        gsap.set(split.chars, {
          yPercent: 115,
          opacity: 0,
          filter: 'blur(8px)',
        });
        tl.to(
          split.chars,
          {
            yPercent: 0,
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.022,
            duration: 0.9,
            ease: 'power4.out',
          },
          0.35
        );
      }

      // Parallax — text drifts down 60% of its own height as the user
      // scrolls through the hero. Scrub on a non-pinned ancestor so iOS
      // Safari composes it natively (no transform-vs-pin conflict).
      // Slight opacity fade-out at the end so it bows out gracefully.
      if (parallaxEl) {
        gsap.to(parallaxEl, {
          yPercent: 60,
          opacity: 0.4,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero__img',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      className='hero__copy pointer-events-none absolute top-1/2 left-6 z-30 mt-[150px] -translate-y-1/2 text-white md:left-12 md:mt-[50px] lg:left-20'
    >
      {/* Parallax wrapper — separate from the outer positioning element
          so GSAP's transform doesn't clobber the Tailwind -translate-y-1/2
          that vertically centres the panel. */}
      <div className='h-parallax'>
        <div className='h-line mb-4 h-px w-16 bg-gradient-to-r from-[#e6b94a] via-[#c79119] to-transparent md:mb-5 md:w-24' />

        <h2 className='h-title text-2xl leading-[1.15] font-light tracking-[0.04em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] md:text-4xl lg:text-[44px]'>
          {line1}
          <br />
          {line2}
          <br />
          {line3}
        </h2>
      </div>
    </div>
  );
}
