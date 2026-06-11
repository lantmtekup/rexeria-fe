'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';

// Kunai Hero clone — animation specs from CDP capture:
//   - Background image: scale 1.1 → 1, 1.6s cubic-bezier(0,0.5,0.5,1) delay 400ms
//   - Big headline (was "KUNAI"): char-stagger 100ms each, 1.6s linear easing
//   - Subtitle char-stagger from translateX(100px) + opacity 0
//   - CTA buttons: 0.8s cubic-bezier(0.03, 0.86, 0, 1) delay 1.4s
//   - Nav opener: opacity + translateY 1px → 0 with linear easing, 2.4s delay 3.2s
//
// Content swap: KUNAI → THE JACK PINE. Color/font kept neutral so designer
// can swap palette later without touching motion logic.
export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // 1. Background Ken Burns (scale 1.1 → 1)
      const bg = root.querySelector<HTMLElement>('.hero-bg');
      if (bg) {
        gsap.fromTo(
          bg,
          { scale: 1.1 },
          { scale: 1, duration: 1.6, ease: 'power2.out', delay: 0.4 }
        );
      }

      // 2. Headline char-stagger reveal (kunai uses linear easing on each
      // char, 100ms stagger). Replicated with SplitType + GSAP timeline.
      const headlineEl = root.querySelector<HTMLElement>('.hero-headline');
      if (headlineEl) {
        const split = new SplitType(headlineEl, { types: 'chars' });
        gsap.set(split.chars, { yPercent: 110, opacity: 0 });
        gsap.to(split.chars, {
          yPercent: 0,
          opacity: 1,
          duration: 1.6,
          ease: 'power2.out',
          stagger: 0.1,
          delay: 0.6,
        });
      }

      // 3. Subtitle right-slide-in (translateX 100 → 0, 1.6s)
      const subtitleEl = root.querySelector<HTMLElement>('.hero-subtitle');
      if (subtitleEl) {
        gsap.fromTo(
          subtitleEl,
          { x: 100, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.6, ease: 'power2.out', delay: 1.2 }
        );
      }

      // 4. CTA buttons (0.8s cubic-bezier(0.03, 0.86, 0, 1) delay 1.4s)
      const ctas = root.querySelectorAll<HTMLElement>('.hero-cta');
      if (ctas.length) {
        gsap.fromTo(
          ctas,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'expo.out',
            delay: 1.4,
            stagger: 0.05,
          }
        );
      }

      // 5. Nav opener (opacity 0.001 + tiny translateY → settle)
      const nav = root.querySelector<HTMLElement>('.hero-nav');
      if (nav) {
        gsap.fromTo(
          nav,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 2.4, ease: 'none', delay: 3.2 }
        );
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className='hero relative h-screen w-full overflow-hidden bg-[#c79119] text-neutral-100'
    >
      {/* Background image — full opacity, no dim overlay */}
      <div className='hero-bg absolute inset-0 origin-center will-change-transform'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src='https://d10zufojjcedud.cloudfront.net/coin-nextjs/hero-coin.webp'
          alt=''
          decoding='async'
          fetchPriority='high'
          className='h-full w-full object-cover'
        />
      </div>

      {/* Nav opener — top bar */}
      <nav className='hero-nav absolute top-0 right-0 left-0 z-20 flex items-center justify-between px-6 py-5 text-[11px] tracking-[0.32em] uppercase md:px-10'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src='https://www.mint.ca/globalassets/products/logo_web_rcm_mrc-upright-primary-bil.svg?hash=638943124010000000&width=160&quality=80'
          alt='Royal Canadian Mint'
          className='h-10 w-auto md:h-12'
          decoding='async'
        />
        <div className='hidden items-center gap-4'>
          <a
            href='#works'
            className='hero-cta transition-opacity hover:opacity-60'
          >
            Discover
          </a>
          <a
            href='https://www.mint.ca/en/shop/coins/2026/the-jack-pine-by-tom-thomson-1-kilo-pure-gold-coin'
            target='_blank'
            rel='noopener noreferrer'
            className='hero-cta rounded-full border border-neutral-100/60 px-4 py-2 transition-colors hover:bg-neutral-100 hover:text-neutral-900'
          >
            Buy
          </a>
        </div>
      </nav>

      {/* Content */}
      <div className='relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-6 pb-16 md:px-16 md:pb-24'>
        <h1
          className='hero-headline font-serif leading-[0.95] font-light tracking-tight'
          style={{ fontSize: 'clamp(72px, 12vw, 164px)' }}
        >
          The Jack Pine
        </h1>
        <p className='hero-subtitle mt-6 max-w-xl text-base leading-relaxed font-light text-neutral-200 md:text-lg'>
          A 1006.1 g, 99.99% pure gold proof coin. Mintage 75 worldwide. A piece
          of Canada&apos;s cultural heritage rendered in pure gold.
        </p>
      </div>
    </section>
  );
}
