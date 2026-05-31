'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

// Final SKU showcase: layered painting + coin + giant title that splits and
// animates in char-by-char as the user scrolls past.
export default function ProductSkuSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = sectionRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // Target the inner <span> (SplitType replaces the element's content);
      // wrapping prevents grid layout from stripping word spaces.
      const titleEl = root.querySelector<HTMLElement>(
        '.product-sku__name span'
      );
      if (titleEl) {
        const split = new SplitType(titleEl, { types: 'words,chars' });
        // toggleActions instead of scrub — same reasoning as DetailsSection:
        // scrubbing N chars on every tick during a reverse scroll is the
        // single biggest contributor to "giật giật". A one-shot reveal
        // (play forward on enter, reverse on leave-back) gives the same
        // feel without the per-tick interpolation cost.
        gsap.fromTo(
          split.chars,
          { opacity: 0, y: 30, force3D: true },
          {
            opacity: 1,
            y: 0,
            force3D: true,
            ease: 'power2.out',
            stagger: 0.03,
            duration: 0.6,
            scrollTrigger: {
              trigger: titleEl,
              start: 'top 80%',
              end: 'top 50%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      // Mobile: 75vh (was 100vh). The boutique-frame composition is
      // optimised for landscape so the shoes/boxes wrap around the model.
      // Shrinking on portrait keeps the model+title+boutique balance
      // without forcing the user through a full extra viewport.
      className='product-sku relative h-[50vh] w-full overflow-hidden bg-neutral-100 md:h-[50vh]'
    >
      {/*
        Astro/Delvaux composition:
          z-0  boutique photo (with horizontal padding so it doesn't bleed
               edge-to-edge — matches the framed-window look)
          z-10 BIG gray sans-serif title (sits BETWEEN background and model
               so model occludes part of the text — editorial overlap)
          z-20 model PNG cutout in front of everything
        The title color is light gray (~neutral-300) on the light boutique
        background, achieving the soft "ghosted" look from the reference.
      */}
      <div className='relative h-full w-full'>
        {/* z-0 — boutique with framing padding */}
        {/* z-0 — painting muted via brightness/saturate + dark vignette
            overlay. Without dimming, the high-contrast painting drowned out
            the wooden box on top. Three layers stack to keep the painting
            recognisable (slight blur kept off so the brushwork is still
            legible) while pushing the box to the front of attention. */}
        <div className='absolute inset-0 z-0'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src='https://d10zufojjcedud.cloudfront.net/coin-nextjs/jackpine-painting.webp'
            alt='The Jack Pine — Tom Thomson'
            loading='eager'
            decoding='async'
            className='h-full w-full object-cover'
            style={{ filter: 'brightness(0.45) saturate(0.7)' }}
          />
          {/* Radial vignette + top-bottom dark gradient for depth */}
          <div
            className='absolute inset-0'
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%), linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 35%, transparent 70%, rgba(0,0,0,0.55) 100%)',
            }}
          />
        </div>

        {/* z-10 — soft ghost title between painting and box */}
        <h2
          className='product-sku__name gpu-layer pointer-events-none absolute inset-0 z-10 grid place-items-center px-6 text-center leading-[1.05] font-light tracking-tight text-white/25'
          style={{ fontSize: 'clamp(48px, 9vw, 130px)' }}
        >
          <span>The Jack Pine 1 kilo</span>
        </h2>

        {/* z-20 — coin in front, centered */}
        <div className='pointer-events-none absolute inset-0 z-20 flex items-center justify-center'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src='https://d10zufojjcedud.cloudfront.net/coin-nextjs/coin-packaging.webp'
            alt='Jack Pine 1 Kilo Gold Coin — wooden presentation case'
            loading='eager'
            decoding='async'
            className='h-[58vh] w-auto -translate-y-[100px] object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.7)] md:h-[64vh]'
          />
        </div>
      </div>
    </section>
  );
}
