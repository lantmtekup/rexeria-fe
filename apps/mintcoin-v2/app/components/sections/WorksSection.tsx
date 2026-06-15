'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';
import ImageLightbox, { type LightboxItem } from '../ImageLightbox';

// Derive popup title/description from a thumbnail's image URL — keeps the
// WORKS data lean (thumbs stay string[]) while giving each thumb real info.
function thumbMeta(src: string): { title: string; desc: string } {
  if (src.includes('coin-obverse'))
    return {
      title: 'Obverse — Charles III Effigy',
      desc: 'The effigy of His Majesty King Charles III, sculpted by Canadian artist Steven Rosati.',
    };
  if (src.includes('coin-reverse'))
    return {
      title: 'Reverse — The Jack Pine',
      desc: "Tom Thomson's windswept pine, rendered in proof-finished relief across 1006.1 g of .99999 fine gold.",
    };
  if (src.includes('jackpine-painting'))
    return {
      title: 'The Source Painting',
      desc: 'Tom Thomson, The Jack Pine (1916–17), painted at Algonquin Park — the inspiration for the coin.',
    };
  if (src.includes('coin-packaging'))
    return {
      title: 'Presentation Case',
      desc: 'Each coin is encapsulated and presented in a Royal Canadian Mint wooden case with a serialised certificate.',
    };
  return {
    title: 'Engraving Detail',
    desc: 'A close angle on the hand-finished die work — every needle, crag, and ripple plotted by hand.',
  };
}

// Kunai Works gallery — hover-morph cards.
// Two visual states (matches reference screenshots):
//
//   IDLE (no hover):
//     • Light card bg + DARK title text + dark tag pills
//     • Right column shows ONE single hero image
//     • 4 thumbnails hidden (parked at 4 corners off-grid)
//     • CTA button hidden
//
//   HOVER (mouse over card):
//     • Card bg wipes in colour right → left
//     • Title + tag pills flip to LIGHT colour (group-hover)
//     • Single hero image fades out
//     • 4 thumbnails fly in from 4 corners → 2×2 grid positions
//     • Circular "View" CTA scales in over the grid
//
// Animation: single GSAP timeline per card (paused). mouseenter → play,
// mouseleave → reverse. Direction-aware = same animation runs in both
// directions, no separate enter/exit choreography to maintain.
//
// Color/typography stays neutral placeholder. Designer assigns brand
// palette by editing `bgClass` per Work + the Tailwind hover utilities.

interface Work {
  number: string;
  jpLabel: string;
  category: string;
  title: string;
  hero: string; // single image shown idle
  backdrop: string; // image filling the right-column behind the 4 thumbs
  thumbs: string[]; // 4 thumbnails shown on hover
  bgClass: string; // hover state card bg color (placeholder)
}

const CDN = 'https://d10zufojjcedud.cloudfront.net/coin-nextjs';
const COIN_REVERSE = `${CDN}/coin-reverse.webp`;
const COIN_OBVERSE = `${CDN}/coin-obverse.webp`;
const COIN_PACKAGING = `${CDN}/coin-packaging.webp`;
const PAINTING = `${CDN}/jackpine-painting.webp`;
const HERO = `${CDN}/hero-coin.webp`;
// Per-frame rotation stills — used as varied "angle views" so each
// card pulls 4 different image sources (no duplicates across the
// grid or across cards).
const frame = (n: number) =>
  `${CDN}/frames/frame-${String(n).padStart(3, '0')}.webp`;

const WORKS: Work[] = [
  {
    number: '01',
    jpLabel: 'I',
    category: 'Engraving Detail',
    title: 'LONE PINE',
    hero: COIN_OBVERSE,
    backdrop: COIN_OBVERSE,
    thumbs: [COIN_OBVERSE, frame(12), frame(36), PAINTING],
    bgClass: 'bg-[#efe9dc]',
  },
  {
    number: '02',
    jpLabel: 'II',
    category: 'Polish Finish',
    title: 'SKY & WATER',
    hero: COIN_REVERSE,
    backdrop: COIN_REVERSE,
    thumbs: [COIN_REVERSE, frame(48), frame(72), PAINTING],
    bgClass: 'bg-[#efe9dc]',
  },
  {
    number: '03',
    jpLabel: 'III',
    category: 'Die Geometry',
    title: 'SERRATED EDGE',
    hero: frame(84),
    backdrop: PAINTING,
    thumbs: [frame(6), frame(28), frame(84), COIN_PACKAGING],
    bgClass: 'bg-[#efe9dc]',
  },
  {
    number: '04',
    jpLabel: 'IV',
    category: 'Effigy Portrait',
    title: 'CHARLES III',
    hero: COIN_PACKAGING,
    backdrop: COIN_PACKAGING,
    thumbs: [COIN_PACKAGING, COIN_OBVERSE, frame(96), HERO],
    bgClass: 'bg-[#efe9dc]',
  },
];

export default function WorksSection() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<LightboxItem | null>(null);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = ref.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // Section heading char-stagger on scroll (kept from previous)
      const heading = root.querySelector<HTMLElement>('.works-heading');
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

      // Per-card hover timeline. Idle: 4 thumbs parked at 4 outer
      // corners (hidden). Hover: thumbs fly IN to 2×2 + bg wipe + CTA.
      // Mouse leave: reverse — thumbs fly OUT to corners.
      const cards = root.querySelectorAll<HTMLElement>('.work-card');
      cards.forEach((card, idx) => {
        const cta = card.querySelector<HTMLElement>('.card-cta');
        const thumbs = card.querySelectorAll<HTMLElement>('.card-thumb');
        const backdrop = card.querySelector<HTMLElement>('.thumbs-bg');
        const mobileText = card.querySelector<HTMLElement>('.mobile-text');
        const mobileImg = card.querySelector<HTMLElement>('.mobile-img');

        // MOBILE-only scroll-driven scrub: text slides LEFT → RIGHT,
        // image slides RIGHT → LEFT, both proportional to card visibility.
        if (window.matchMedia('(max-width: 767px)').matches) {
          if (mobileText) {
            gsap.set(mobileText, { xPercent: -40, opacity: 0 });
            gsap.to(mobileText, {
              xPercent: 0,
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'center 70%',
                scrub: 1,
                invalidateOnRefresh: true,
              },
            });
          }
          if (mobileImg) {
            gsap.set(mobileImg, { xPercent: 40, opacity: 0 });
            gsap.to(mobileImg, {
              xPercent: 0,
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'center 70%',
                scrub: 1,
                invalidateOnRefresh: true,
              },
            });
          }
        }

        // SCROLL-DRIVEN scrub. BG (gold) and BACKDROP image slide IN
        // FROM OPPOSITE outer edges of their respective columns:
        //   • Non-mirrored cards (1, 3): text LEFT + image RIGHT →
        //     bg slides from LEFT (-100), backdrop from RIGHT (+100)
        //   • Mirrored cards (2, 4): text RIGHT + image LEFT →
        //     bg slides from RIGHT (+100), backdrop from LEFT (-100)
        // Each pair converges to centre — gold + image meeting at the
        // divider line. Thumbs + hover CTA stay independent.
        const isMirrored = idx % 2 === 1;
        const backdropFrom = isMirrored ? -100 : 100;
        const scrollTriggerCfg = {
          trigger: card,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: 1,
          invalidateOnRefresh: true,
        } as const;
        if (backdrop) {
          gsap.set(backdrop, { xPercent: backdropFrom, opacity: 0 });
          gsap.to(backdrop, {
            xPercent: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: scrollTriggerCfg,
          });
        }
        // Gold card-bg is ALWAYS visible (idle, no hover/scroll needed).
        // Only the backdrop image slides in on scroll; the gold panel
        // stays put so text always sits on its background.

        if (cta) gsap.set(cta, { scale: 0, opacity: 0 });
        thumbs.forEach((thumb, i) => {
          const xFrom = i % 2 === 0 ? -120 : 120;
          const yFrom = i < 2 ? -120 : 120;
          gsap.set(thumb, {
            xPercent: xFrom,
            yPercent: yFrom,
            scale: 0.6,
            opacity: 0,
          });
        });

        const tl = gsap.timeline({ paused: true });

        thumbs.forEach((thumb, i) => {
          tl.to(
            thumb,
            {
              xPercent: 0,
              yPercent: 0,
              scale: 1,
              opacity: 1,
              duration: 0.85,
              ease: 'power3.out',
            },
            0.15 + i * 0.05
          );
        });

        if (cta) {
          tl.to(
            cta,
            { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2)' },
            0.5
          );
        }

        const play = () => tl.play();
        const reverse = () => tl.reverse();
        card.addEventListener('mouseenter', play);
        card.addEventListener('mouseleave', reverse);

        let touched = false;
        const onTouchStart = () => {
          if (touched) tl.reverse();
          else tl.play();
          touched = !touched;
        };
        card.addEventListener('touchstart', onTouchStart, { passive: true });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id='works'
      ref={ref}
      className='works relative w-full overflow-hidden bg-white py-24 text-neutral-900 md:py-40'
    >
      {/* Section decorative background — dark with subtle gold radial tint */}
      <div aria-hidden='true' className='absolute inset-0 z-0'>
        <div
          className='absolute inset-0 opacity-50'
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 20% 30%, rgba(199,145,25,0.06) 0%, transparent 55%), radial-gradient(ellipse at 80% 75%, rgba(199,145,25,0.08) 0%, transparent 60%)',
          }}
        />
      </div>

      <div className='relative z-10 mx-auto mb-16 max-w-[1400px] px-6 md:mb-24 md:px-16'>
        <span className='mb-4 block text-[11px] tracking-[0.32em] text-neutral-600 uppercase'>
          The Details
        </span>
        {/* leading bumped from 0.95 → 1.15 + pb-2 so descenders (g, p, y)
            don't get clipped by overflow-hidden char-stagger mask. */}
        <h2
          className='works-heading overflow-hidden pb-2 font-serif leading-[1.15] font-light tracking-tight text-neutral-900'
          style={{ fontSize: 'clamp(56px, 9vw, 128px)' }}
        >
          Forged in Gold
        </h2>
      </div>

      <div className='relative z-10 mx-auto max-w-[1400px] space-y-12 px-6 md:space-y-[120px] md:px-16'>
        {WORKS.map((w, idx) => {
          // Alternating zigzag: even cards (1, 3) = text LEFT + image RIGHT;
          // odd cards (2, 4) mirror the grid so image is LEFT + text RIGHT.
          // Done via grid-template + order utilities; transform animations
          // stay identical because the inner column markup is unchanged.
          const mirrored = idx % 2 === 1;
          return (
            <article
              key={w.number}
              // `group` so child colour utilities can react to card hover
              // without explicit JS — Tailwind handles the simple bits, GSAP
              // handles transforms.
              className={`work-card group relative grid cursor-pointer grid-cols-1 overflow-hidden rounded-sm md:min-h-[400px] ${
                mirrored
                  ? 'md:grid-cols-[1fr_1.85fr]'
                  : 'md:grid-cols-[1.85fr_1fr]'
              }`}
            >
              {/* TEXT column (left by default, moves to right on odd) */}
              <div
                className={`relative flex items-center px-6 py-8 md:p-[50px] ${mirrored ? 'md:order-2' : ''}`}
              >
                {/* Card bg gold — desktop only, scroll-driven slide-in (GSAP
                  scrubs .card-bg). Mobile keeps text column transparent on
                  the section dark bg for a clean stack. */}
                <div
                  aria-hidden='true'
                  className={`card-bg absolute inset-0 hidden md:block ${w.bgClass}`}
                />

                {/* Content — colour swaps via Tailwind group-hover.
                  Right-align text on mirrored cards so the title hugs
                  the inner edge (toward the image column) for clean
                  zigzag composition. */}
                <div
                  className={`mobile-text relative z-10 will-change-transform ${mirrored ? 'md:text-right' : ''}`}
                >
                  <div
                    className={`card-tag mb-4 flex items-center gap-3 ${mirrored ? 'md:justify-end' : ''}`}
                  >
                    <span className='inline-block bg-neutral-800 px-2 py-1 text-[10px] tracking-[0.18em] text-neutral-300 uppercase transition-colors duration-500 group-hover:bg-neutral-900 group-hover:text-neutral-100'>
                      {w.jpLabel}
                    </span>
                    <span className='inline-block bg-neutral-800 px-3 py-1 text-[10px] tracking-[0.18em] text-neutral-300 uppercase transition-colors duration-500 group-hover:bg-neutral-900 group-hover:text-neutral-100'>
                      {w.category}
                    </span>
                  </div>
                  <h3
                    className='card-title pb-1 font-serif leading-[1.05] font-extrabold tracking-tight text-neutral-900 transition-colors duration-500 group-hover:text-neutral-900'
                    style={{ fontSize: 'clamp(36px, 6vw, 84px)' }}
                  >
                    {w.title}
                  </h3>
                </div>
              </div>

              {/* IMAGE column (right by default, moves to left on odd) */}
              <div
                className={`card-thumbs relative overflow-hidden ${mirrored ? 'md:order-1' : ''}`}
              >
                {/* MOBILE single image — full width, no backdrop, no thumbs.
                  Replaces the 4-thumb grid + backdrop wash on phones. Tapping
                  it opens the same lightbox the desktop thumbnails use (the
                  thumb grid is hidden on mobile, so this is the only entry). */}
                <button
                  type='button'
                  aria-label={`View ${thumbMeta(w.hero).title}`}
                  onClick={e => {
                    e.stopPropagation();
                    setActive({ src: w.hero, ...thumbMeta(w.hero) });
                  }}
                  className='mobile-img block aspect-square w-full cursor-pointer overflow-hidden will-change-transform md:hidden'
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={w.hero}
                    alt={w.title}
                    loading='lazy'
                    decoding='async'
                    className='h-full w-full object-cover'
                  />
                </button>

                {/* DESKTOP backdrop image — per-card unique. object-contain
                  so the full coin/painting shows without top/bottom crop. */}
                <div
                  aria-hidden='true'
                  className='thumbs-bg absolute inset-0 hidden md:block'
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={w.backdrop}
                    alt=''
                    className='absolute inset-0 h-full w-full object-contain'
                  />
                  <div
                    className='absolute inset-0'
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(20,20,20,0.55) 0%, rgba(20,20,20,0.25) 50%, rgba(20,20,20,0.65) 100%)',
                    }}
                  />
                </div>

                {/* 4-thumb grid — DESKTOP only. Hover triggers fly-in from
                  4 corners. Mobile uses the single hero image above. */}
                <div className='absolute inset-0 z-20 hidden grid-cols-2 grid-rows-2 gap-3 p-[50px] md:grid md:gap-5'>
                  {w.thumbs.map((src, i) => {
                    const meta = thumbMeta(src);
                    return (
                      <button
                        key={i}
                        type='button'
                        aria-label={`View ${meta.title}`}
                        onClick={e => {
                          e.stopPropagation();
                          setActive({ src, ...meta });
                        }}
                        className='card-thumb group/thumb relative origin-center cursor-pointer overflow-hidden shadow-lg will-change-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f9f9f8]'
                        style={{ opacity: 0 }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt=''
                          loading='lazy'
                          decoding='async'
                          className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/thumb:scale-105'
                        />
                        {/* hover hint */}
                        <span className='pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-900/0 text-[10px] tracking-[0.18em] text-neutral-100/0 uppercase transition-all duration-300 group-hover/thumb:bg-neutral-900/40 group-hover/thumb:text-neutral-100'>
                          View
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Click-to-view popup for each thumbnail */}
      <ImageLightbox item={active} onClose={() => setActive(null)} />
    </section>
  );
}
