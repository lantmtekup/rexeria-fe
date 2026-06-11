'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';

// Emblem centerpiece block — Kunai-style composition adapted for the
// Jack Pine coin. Centered coin emblem with the Tom Thomson painting
// fading in from both sides (echoes the cherry-blossom framing of the
// reference), big serif title + dotted tagline, on a light parchment
// background to contrast the dark sections around it.

const CDN = 'https://d10zufojjcedud.cloudfront.net/coin-nextjs';
const COIN = `${CDN}/coin-obverse.webp`;
const PAINTING = `${CDN}/jackpine-painting.webp`;

export default function EmblemSection() {
  const ref = useRef<HTMLElement>(null);
  const splitsRef = useRef<SplitType[]>([]);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = ref.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // Flanking decor drifts in from the outer edges as the block enters.
      const left = root.querySelector<HTMLElement>('.emblem-decor-left');
      const right = root.querySelector<HTMLElement>('.emblem-decor-right');
      [left, right].forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { xPercent: i === 0 ? -12 : 12, opacity: 0 },
          {
            xPercent: 0,
            // Fade to a FAINT backdrop (not full) so the painting frames
            // the centre without dominating / breaking the layout.
            opacity: 0.22,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top bottom',
              end: 'center center',
              scrub: 1,
            },
          }
        );
      });

      // Entrance sequence on enter:
      //   1. Coin drops in from above (top → down).
      //   2. AFTER the coin lands, text reveals WORD BY WORD from below.
      const coin = root.querySelector<HTMLElement>('.emblem-coin');
      const textEls = gsap.utils.toArray<HTMLElement>('.emblem-text');

      // Split each text element into words (in DOM order: title → copy)
      // so the stagger flows word-by-word across the whole stack.
      const splits = textEls.map(el => new SplitType(el, { types: 'words' }));
      const words = splits.flatMap(s => s.words ?? []);

      // Emblem is the TOP section (in view on load), so the entrance plays
      // ON LOAD — not scroll-gated. A scroll trigger would just snap to the
      // end state because the block is already past 'top 70%' at first paint.
      const tl = gsap.timeline({ delay: 0.2 });

      if (coin) {
        tl.fromTo(
          coin,
          { y: -240, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out' }
        );
      }

      if (words.length) {
        // '>' = start right after the coin drop finishes; each word
        // rises from below in sequence.
        tl.fromTo(
          words,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.06,
          },
          coin ? '>' : 0
        );
      }

      splitsRef.current = splits;
    }, root);

    return () => {
      ctx.revert();
      splitsRef.current.forEach(s => s.revert());
      splitsRef.current = [];
    };
  }, []);

  return (
    <section
      ref={ref}
      className='emblem sticky top-0 z-0 flex h-screen w-full items-center justify-center overflow-hidden bg-[#f4f1ea] py-28 text-neutral-900 md:py-44'
    >
      {/* Flanking painting decor — faded + masked toward centre */}
      <div
        aria-hidden='true'
        className='emblem-decor-left pointer-events-none absolute top-0 left-0 h-full w-[34%] opacity-25 md:w-[32%]'
        style={{
          WebkitMaskImage:
            'linear-gradient(to right, black 0%, transparent 85%)',
          maskImage: 'linear-gradient(to right, black 0%, transparent 85%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PAINTING}
          alt=''
          className='h-full w-full scale-x-[-1] object-cover blur-[1px]'
          loading='lazy'
          decoding='async'
        />
      </div>
      <div
        aria-hidden='true'
        className='emblem-decor-right pointer-events-none absolute top-0 right-0 h-full w-[34%] opacity-25 md:w-[32%]'
        style={{
          WebkitMaskImage:
            'linear-gradient(to left, black 0%, transparent 85%)',
          maskImage: 'linear-gradient(to left, black 0%, transparent 85%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PAINTING}
          alt=''
          className='h-full w-full object-cover blur-[1px]'
          loading='lazy'
          decoding='async'
        />
      </div>

      {/* Centre stack */}
      <div className='relative z-10 flex flex-col items-center px-6 text-center'>
        <div className='emblem-coin relative will-change-transform'>
          {/* Soft gold glow behind the coin */}
          <div
            aria-hidden='true'
            className='absolute inset-0 -z-10 opacity-60 blur-2xl'
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(199,145,25,0.35) 0%, transparent 70%)',
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={COIN}
            alt='The Jack Pine 1 kilo gold coin'
            className='h-40 w-40 object-contain drop-shadow-2xl md:h-56 md:w-56'
            loading='lazy'
            decoding='async'
          />
        </div>

        <h2
          className='emblem-text mt-10 font-serif leading-[0.95] font-light tracking-tight text-neutral-900'
          style={{ fontSize: 'clamp(48px, 9vw, 132px)' }}
        >
          The Jack Pine
        </h2>

        <p className='emblem-text mt-6 max-w-xl text-sm leading-relaxed font-light text-neutral-600 md:text-base'>
          A 1006.1 g, 99.99% pure gold proof coin. Mintage 75 worldwide.
        </p>
      </div>
    </section>
  );
}
