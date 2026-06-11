'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface Variant {
  key: 'orange' | 'black' | 'blue';
  label: string;
  swatch: string; // image url
  image: string; // shoe image
  ref: string;
}

interface Props {
  id?: string;
  variants: Variant[];
  onOpenDiscover?: () => void;
}

// Pinned section showing the active variant's hero image with a swatch
// picker. Pin runs for 150vh of scroll. Parallax on .js-parallax children.
export default function ProductVariantSection({
  id,
  variants,
  onOpenDiscover,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<Variant['key']>('orange');

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = sectionRef.current;
    if (!root) return;

    // Skip parallax on mobile — scrub-driven y translates on multiple
    // elements per scroll tick are heavy enough to cause noticeable
    // stutter on mid-tier phones.
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    const ctx = gsap.context(() => {
      if (isMobile) return;
      // Parallax children
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

      // Pin REMOVED. Original Astro pinned the variant for 150vh while a
      // scrub-driven `done` class toggled at progress > 0.5 (transitioning
      // the SKU title). Without that scroll-driven payload, the pin only
      // added friction: users had to scroll ~1350px through unchanged
      // content before reaching the next section, perceived as "scroll 2
      // lần mới chuyển section". The parallax on title/swatches still
      // animates as the section scrolls through the viewport — the visual
      // effect is preserved, only the hold is gone.
    }, root);

    return () => ctx.revert();
  }, []);

  const activeVariant = variants.find(v => v.key === active)!;

  return (
    <section
      id={id}
      ref={sectionRef}
      // Mobile: 80vh (was 100vh). Variant absolute % positioning was tuned
      // for landscape; shrinking the section closes the empty band between
      // shoe and swatches. Desktop unchanged.
      className='product-variant relative h-[80vh] w-full overflow-hidden bg-neutral-50 md:h-screen'
    >
      {/*
        Layout uses absolute placement instead of flex-col-justify-center —
        flex stacking pushed image+swatches+title past 100vh, clipping the
        title and bleeding into the next pinned section. Anchoring each piece
        to a fixed band (top/middle/bottom) guarantees nothing overflows
        regardless of viewport height.
      */}
      {/*
        Layered layout to mirror Astro/Delvaux: BIG sans-serif title sits on
        the back layer (z-0), shoe image sits IN FRONT (z-10) overlapping the
        title's center mass, swatches sit at the bottom of the shoe (z-20).
        Visually the title bleeds out from behind the product — the signature
        editorial-magazine composition that makes the variant block feel
        luxurious instead of utilitarian.

        Parallax (.js-parallax) is wrapped inside Tailwind-centered outer
        containers because GSAP's `y` rewrites transform and would clobber
        `-translate-x-1/2`.
      */}
      <div className='relative h-full w-full'>
        {/* BACK layer — title behind shoe */}
        <div className='pointer-events-none absolute inset-0 z-0 flex items-center justify-center px-6 text-center'>
          <div className='content-bottom js-parallax gpu-layer' data-y='60'>
            <h2 className='text-[12vw] leading-[1.05] font-light tracking-tight text-neutral-300/80 md:text-[10vw]'>
              Orange Satin <br /> Crystal Embellished
            </h2>
          </div>
        </div>

        {/* FRONT layer — shoe is now an entire clickable area. Hovering
            anywhere on it reveals a centered "CLICK FOR MORE INFORMATION"
            pill (the previous design only triggered on a 40×40 + dot,
            making the hint hard to discover). Click → opens DiscoverPanel.
            Cursor becomes pointer over the whole shoe. */}
        <div className='absolute inset-x-0 top-[20%] z-10 flex justify-center'>
          <button
            type='button'
            onClick={onOpenDiscover}
            aria-label='More information'
            className='content-top__image js-parallax gpu-layer group/info pointer-events-auto relative cursor-pointer'
            data-y='-20'
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={activeVariant.key}
              src={activeVariant.image}
              alt={`Ronconasli ${activeVariant.label}`}
              className='pointer-events-none h-[45vh] w-auto object-contain transition-opacity duration-300 md:h-[55vh]'
            />

            {/* Centered hover affordance pill. opacity-only transition,
                pointer-events-none so cursor proximity to the pill itself
                doesn't re-trigger hover. The black + circle stays as a
                small permanent indicator (top-right) so the affordance is
                also discoverable on touch devices where there's no hover. */}
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

            {/* Permanent + dot REMOVED — was visually distracting on the
                clean editorial composition. The hover pill alone provides
                the affordance on desktop; touch users tap the swatches and
                learn discoverability through them. */}
          </button>
        </div>

        {/* TOP layer — swatch picker positioned just below the shoe */}
        <ul className='content-pagination absolute top-[78%] left-1/2 z-20 flex -translate-x-1/2 gap-3'>
          {variants.map(v => (
            <li
              key={v.key}
              data-variant={v.key}
              data-ref={v.ref}
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
