'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface Variant {
  key: string;
  label: string;
  swatch: string;
  image: string;
  ref: string;
}

interface Props {
  id?: string;
  variants: Variant[];
  onOpenDiscover?: () => void;
}

// Pinned section showing the active variant's hero image with a swatch
// picker. Parallax on .js-parallax children; pin removed (was friction-only
// after the scrub-driven `done` class was retired).
export default function ProductVariantSection({
  id,
  variants,
  onOpenDiscover,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string>(variants[0]?.key ?? '');

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = sectionRef.current;
    if (!root) return;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    const ctx = gsap.context(() => {
      if (isMobile) return;
      gsap.utils.toArray<HTMLElement>('.js-parallax', root).forEach(el => {
        const y = el.getAttribute('data-y') || '-100';
        gsap.to(el, {
          y,
          ease: 'power4',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const activeVariant = variants.find(v => v.key === active) ?? variants[0];

  return (
    <section
      id={id}
      ref={sectionRef}
      className='product-variant relative h-[80vh] w-full overflow-hidden bg-neutral-50 md:h-screen'
    >
      <div className='relative h-full w-full'>
        {/* BACK layer — editorial title behind the coin */}
        <div className='pointer-events-none absolute inset-0 z-0 flex items-center justify-center px-6 text-center'>
          <div className='content-bottom js-parallax gpu-layer' data-y='60'>
            <h2 className='text-[12vw] leading-[1.05] font-light tracking-tight text-neutral-300/80 md:text-[10vw]'>
              99.99% <br /> Pure Gold
            </h2>
          </div>
        </div>

        {/* FRONT layer — coin as clickable affordance */}
        <div className='absolute inset-x-0 top-[20%] z-10 flex justify-center'>
          <button
            type='button'
            onClick={onOpenDiscover}
            aria-label='More information'
            data-rexer-cta='open-discover-panel'
            className='content-top__image js-parallax gpu-layer group/info pointer-events-auto relative cursor-pointer'
            data-y='-20'
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={activeVariant.key}
              src={activeVariant.image}
              alt={`Jack Pine Gold Coin — ${activeVariant.label}`}
              className='pointer-events-none h-[45vh] w-auto object-contain transition-opacity duration-300 md:h-[55vh]'
            />

            <span className='pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/info:opacity-100'>
              <span className='flex items-center gap-2 rounded-full bg-black px-5 py-3 text-[11px] tracking-[0.2em] whitespace-nowrap text-white uppercase shadow-xl'>
                <svg width='14' height='14' viewBox='0 0 24 24' fill='none'>
                  <path
                    d='M12 5v14M5 12h14'
                    stroke='white'
                    strokeWidth='1.6'
                    strokeLinecap='round'
                  />
                </svg>
                Click for more information
              </span>
            </span>
          </button>
        </div>

        {/* TOP layer — view picker (reverse / obverse / packaging) */}
        <ul className='content-pagination absolute top-[78%] left-1/2 z-20 flex -translate-x-1/2 gap-3'>
          {variants.map(v => (
            <li
              key={v.key}
              data-variant={v.key}
              data-ref={v.ref}
              data-rexer-cta={`variant-${v.key}`}
              onClick={() => setActive(v.key)}
              className={`h-9 w-9 cursor-pointer rounded-full border transition-all ${
                active === v.key
                  ? 'scale-110 border-black ring-2 ring-black ring-offset-2'
                  : 'border-black/30 hover:scale-105'
              }`}
              style={{
                backgroundImage: `url(${v.swatch})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              role='button'
              aria-label={`Select ${v.label}`}
              aria-pressed={active === v.key}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
