'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';

// Kunai "SILENT SKILL" section clone.
// Layout: BIG title top. Two columns under: LEFT = vertical list of
// service items (line marker ─ idle, menu icon ≡ active, gold bg fills
// the row), RIGHT = preview image that swaps to match the active item.

const CDN = 'https://d10zufojjcedud.cloudfront.net/coin-nextjs';

interface ServiceItem {
  id: string;
  label: string;
  preview: string; // image URL shown in right panel
  caption?: string; // small text overlay on preview
}

const ITEMS: ServiceItem[] = [
  {
    id: 'thomson',
    label: 'Tom Thomson Heritage',
    preview: `${CDN}/jackpine-painting.webp`,
    caption: 'Painted 1916–17, Algonquin Park',
  },
  {
    id: 'engraving',
    label: 'Engraving Craft',
    preview: `${CDN}/coin-reverse.webp`,
    caption: 'Master engravers · hand-finished relief',
  },
  {
    id: 'gold',
    label: '99.99% Pure Gold',
    preview: `${CDN}/frames/frame-048.webp`,
    caption: '1006.1 g · .99999 fineness',
  },
  {
    id: 'mintage',
    label: 'Limited Mintage 75',
    preview: `${CDN}/coin-packaging.webp`,
    caption: 'Each coin individually serialised',
  },
  {
    id: 'effigy',
    label: 'King Charles III Effigy',
    preview: `${CDN}/coin-obverse.webp`,
    caption: 'By Canadian artist Steven Rosati',
  },
];

export default function ServicesSection() {
  const ref = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState<string>(ITEMS[0]!.id);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = ref.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // Big heading char-stagger
      const heading = root.querySelector<HTMLElement>('.svc-heading');
      if (heading) {
        const chars = heading.textContent?.split('') ?? [];
        heading.innerHTML = chars
          .map(
            c => `<span class="inline-block">${c === ' ' ? '&nbsp;' : c}</span>`
          )
          .join('');
        const charEls = heading.querySelectorAll<HTMLElement>('span');
        gsap.set(charEls, { yPercent: 110, opacity: 0 });
        gsap.to(charEls, {
          yPercent: 0,
          opacity: 1,
          duration: 1.6,
          ease: 'power3.out',
          stagger: 0.06,
          scrollTrigger: {
            trigger: heading,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // List items + preview fade-up
      const reveals = root.querySelectorAll<HTMLElement>('.svc-reveal');
      reveals.forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            delay: i * 0.08,
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const active = ITEMS.find(i => i.id === activeId) ?? ITEMS[0]!;

  return (
    <section
      ref={ref}
      className='services relative w-full bg-neutral-50 py-24 text-neutral-900 md:py-40'
    >
      <div className='mx-auto max-w-[1400px] px-6 md:px-16'>
        {/* Big heading */}
        <div className='mb-16 md:mb-20'>
          <span className='mb-4 block text-[11px] tracking-[0.32em] text-neutral-500 uppercase'>
            Two Dimensions
          </span>
          <h2
            className='svc-heading overflow-hidden font-serif leading-[0.9] font-extrabold tracking-tight whitespace-nowrap text-[#c79119]'
            style={{ fontSize: 'clamp(28px, 8vw, 116px)' }}
          >
            HERITAGE &amp; CRAFT
          </h2>
        </div>

        {/* Two-column body: list LEFT, preview RIGHT */}
        <div className='grid gap-8 md:grid-cols-[1fr_1.4fr] md:gap-12'>
          {/* LEFT — vertical selector list */}
          <ul className='svc-reveal flex flex-col border-y border-[#c79119]/30'>
            {ITEMS.map(item => {
              const isActive = item.id === activeId;
              return (
                <li
                  key={item.id}
                  className='border-b border-[#c79119]/20 last:border-b-0'
                >
                  <button
                    type='button'
                    onClick={() => setActiveId(item.id)}
                    onMouseEnter={() => setActiveId(item.id)}
                    className={`group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors duration-300 md:px-6 md:py-5 ${
                      isActive
                        ? 'bg-[#c79119] text-neutral-100'
                        : 'text-neutral-700 hover:text-[#c79119]'
                    }`}
                  >
                    <span className='font-serif text-lg font-medium tracking-tight md:text-2xl'>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* RIGHT — preview image panel */}
          <div className='svc-reveal relative aspect-[4/3] overflow-hidden border border-[#c79119]/30 bg-neutral-900 md:aspect-auto md:h-full md:min-h-[400px]'>
            {/* Image swaps with crossfade keyed by activeId */}
            <div key={active.id} className='svc-preview-img absolute inset-0'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.preview}
                alt={active.label}
                loading='lazy'
                decoding='async'
                className='h-full w-full object-cover'
              />
              {/* Bottom-left caption pill */}
              {active.caption && (
                <div className='absolute bottom-4 left-4 bg-neutral-100 px-4 py-2 text-[11px] tracking-[0.18em] text-neutral-900 uppercase'>
                  {active.caption}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
