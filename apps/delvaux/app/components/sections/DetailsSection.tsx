'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

// Title with 3D char-by-char rotateX entrance + paragraph fade-up.
export default function DetailsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = sectionRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const titleEl = root.querySelector<HTMLElement>('.details__title');
      if (titleEl) {
        const split = new SplitType(titleEl, { types: 'chars' });
        // Simplified from 3D rotationX/z (perspective:1000) to flat 2D
        // y/opacity. The original 3D entrance forced the GPU to recompute a
        // 3D transform matrix for each of the 25 chars every scroll tick,
        // which manifested as visible "giật giật" when the user scrolled
        // back UP through the title (every char's matrix had to invert).
        // 2D y/opacity is composite-only — no matrix work, smooth in both
        // directions.
        gsap.fromTo(
          split.chars,
          {
            opacity: 0,
            y: 24,
            force3D: true,
          },
          {
            opacity: 1,
            y: 0,
            force3D: true,
            stagger: 0.04,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: titleEl,
              start: 'top 85%',
              end: 'top 50%',
              // toggleActions: play once forward, reverse on leave-back, etc.
              // Without scrub, the animation plays atomically — no per-tick
              // interpolation that could flicker when direction changes.
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      }

      gsap.utils.toArray<HTMLElement>('.data-fade-in', root).forEach(el => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'sine.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              end: 'bottom 85%',
            },
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id='description'
      ref={sectionRef}
      className='details px-6 pt-32 pb-24 md:pt-40 md:pb-32'
    >
      <div className='mx-auto max-w-3xl text-center'>
        {/* Sans-serif (default Helvetica Neue) — matches Delvaux/Astro ref. */}
        <h1 className='details__title gpu-layer mb-10 text-6xl font-light tracking-tight md:text-8xl'>
          RONCONASLI
        </h1>
        <p className='data-fade-in mb-5 text-sm leading-relaxed text-neutral-800 md:text-base'>
          Shop our Manolo Blahnik Orange Satin Crystal Embellished Slingback
          Pumps. International delivery offered on all products. A masterwork of
          Italian satin adorned with hand-applied crystal detailing, the
          Ronconasli slingback pump is a celebration of Manolo Blahnik&apos;s
          enduring vision of femininity and elegance.
        </p>
        <p className='data-fade-in text-sm leading-relaxed text-neutral-800 md:text-base'>
          The Ronconasli features a luminous orange satin upper with crystal
          embellishments set by Italian artisans with millimeter precision. The
          adjustable slingback strap and 90mm covered heel deliver timeless
          silhouette with all-day wearability — a true Manolo Blahnik icon.
        </p>
      </div>
    </section>
  );
}
