'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

// Title with char-by-char fade-up entrance + paragraph fade-in.
export default function DetailsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = sectionRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const titleEl = root.querySelector<HTMLElement>('.details__title');
      if (titleEl) {
        // words,chars (not chars-only): word wrappers keep each word intact
        // so lines never break mid-word ("The Jack Pin|e") on narrow phones.
        const split = new SplitType(titleEl, { types: 'words,chars' });
        gsap.fromTo(
          split.chars,
          { opacity: 0, y: 24, force3D: true },
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
        <h1 className='details__title gpu-layer mb-10 text-5xl font-light tracking-tight text-balance break-keep md:text-8xl'>
          The Jack Pine
        </h1>
        <p className='data-fade-in mb-5 text-sm leading-relaxed text-neutral-800 md:text-base'>
          A 1006.1 g, 99.99% pure gold proof coin from the Royal Canadian Mint —
          a monumental tribute to Tom Thomson&apos;s iconic 1916–17 landscape,
          struck in a mintage of just 75 worldwide. The reverse captures the
          lone, windswept pine rising against a sunset over an Ontario lake; the
          obverse bears Steven Rosati&apos;s effigy of His Majesty King Charles
          III.
        </p>
        <p className='data-fade-in text-sm leading-relaxed text-neutral-800 md:text-base'>
          101.6 mm in diameter with a serrated edge and $2,500 face value.
          Encapsulated in a Royal Canadian Mint wooden case with black beauty
          box and serialised certificate — a piece of Canada&apos;s cultural
          heritage rendered in pure gold.
        </p>
      </div>
    </section>
  );
}
