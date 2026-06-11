'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

// Final SKU showcase: layered images + giant title that splits and animates
// in char-by-char as the user scrolls past.
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
      className='product-sku relative h-[75vh] w-full overflow-hidden bg-neutral-100 md:h-screen'
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
        <div className='absolute inset-0 z-0 px-3 pt-3 md:px-12 md:pt-6'>
          {/* loading=eager + decoding=async: same reasoning as
              ProductDetailSection's main image. JPG decode on viewport
              entry was the source of trigger=— spikes. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src='https://d10zufojjcedud.cloudfront.net/delvaux-nextjs/manolo-boutique.webp'
            alt='Manolo boutique display'
            loading='eager'
            decoding='async'
            className='h-full w-full object-cover'
          />
        </div>

        {/* z-10 — title text BEHIND model, in front of background */}
        <h2
          className='product-sku__name gpu-layer pointer-events-none absolute inset-0 z-10 grid place-items-center px-6 text-center leading-[1.05] font-light tracking-tight text-neutral-300'
          style={{ fontSize: 'clamp(48px, 9vw, 130px)' }}
        >
          <span>Ronconasli Slingback Pump</span>
        </h2>

        {/* z-20 — model in front, anchored to bottom */}
        <div className='pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src='https://d10zufojjcedud.cloudfront.net/delvaux-nextjs/manolo-legs.webp'
            alt='Ronconasli on model'
            loading='eager'
            decoding='async'
            className='max-h-[78vh] object-contain'
          />
        </div>
      </div>
    </section>
  );
}
