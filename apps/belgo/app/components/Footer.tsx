'use client';

import { useEffect, useRef } from 'react';
import {
  gsap,
  MOTION_CONDITIONS,
  type MotionConditions,
} from '@/app/lib/motion';

type Location = { name: string; address: string[]; tel: string };

const LOCATIONS: Location[] = [
  {
    name: 'DA KAO',
    address: ['A: 159A Nguyễn Văn Thủ,', 'Đa Kao Ward, District 1, HCMC'],
    tel: 'T: +84 28 3910 0485',
  },
  {
    name: 'TON THAT THIEP',
    address: ['A: 29 - 31 Tôn Thất Thiệp,', 'Bến Nghé Ward, District 1, HCMC'],
    tel: 'T: +84 28 3622 9887',
  },
  {
    name: 'PHAN XICH LONG',
    address: ['A: 186 Phan Xích Long,', 'Ward 2, Phú Nhuận District, HCMC'],
    tel: 'T: +84 28 3517 0983',
  },
  {
    name: 'LE NGO CAT',
    address: ['A: 2 Lê Ngô Cát,', 'Ward 7, District 3, HCMC'],
    tel: 'T: +84 28 3620 5212',
  },
  {
    name: 'BINH DUONG',
    address: ['A: Hikari Complex,', 'Lô M1-M2 Thủ Dầu Một, Bình Dương'],
    tel: 'T: +84 27 4380 3188',
  },
];

// "#DRINK" stays white; the rest of the line uses the beige display colour.
const HEADLINE_WORDS = [
  { text: '#DRINK', accent: true },
  { text: 'OUT', accent: false },
  { text: 'OF', accent: false },
  { text: 'THE', accent: false },
  { text: 'ORDINARY', accent: false },
];

// Curtain diagonal — the band's edges run at this angle ("/").
const CURTAIN_ANGLE = -32;

function LocationBlock({ location }: { location: Location }) {
  return (
    <div>
      <p
        className='text-sm tracking-[0.08em] text-[#e4ddcf]'
        style={{ fontFamily: 'var(--font-bebas), sans-serif' }}
      >
        {location.name}
      </p>
      <div
        className='mt-3 space-y-0.5 text-[13px] leading-relaxed text-[#e4ddcf]/60'
        style={{ fontFamily: 'var(--font-inter), sans-serif' }}
      >
        {location.address.map(line => (
          <p key={line}>{line}</p>
        ))}
        <p>{location.tel}</p>
      </div>
    </div>
  );
}

function SocialIcons() {
  return (
    <div className='flex items-center gap-3'>
      <a
        href='#'
        aria-label='Facebook'
        className='flex h-8 w-8 items-center justify-center bg-[#1A1A1A] text-[#e4ddcf] transition-opacity hover:opacity-80'
      >
        <svg viewBox='0 0 24 24' fill='currentColor' className='h-4 w-4'>
          <path d='M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6c-.3 0-1.3-.1-2.45-.1-2.42 0-4.08 1.48-4.08 4.2v2.2H7.5V13h2.67v8h3.33Z' />
        </svg>
      </a>
      <a
        href='#'
        aria-label='Instagram'
        className='flex h-8 w-8 items-center justify-center bg-[#1A1A1A] text-[#e4ddcf] transition-opacity hover:opacity-80'
      >
        <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4'>
          <rect
            x='3.5'
            y='3.5'
            width='17'
            height='17'
            rx='4.5'
            stroke='currentColor'
            strokeWidth='1.8'
          />
          <circle
            cx='12'
            cy='12'
            r='3.8'
            stroke='currentColor'
            strokeWidth='1.8'
          />
          <circle cx='17' cy='7' r='1.1' fill='currentColor' />
        </svg>
      </a>
      <a
        href='#'
        aria-label='LinkedIn'
        className='flex h-8 w-8 items-center justify-center bg-[#1A1A1A] text-[#e4ddcf] transition-opacity hover:opacity-80'
      >
        <svg viewBox='0 0 24 24' fill='currentColor' className='h-4 w-4'>
          <path d='M6.94 8.5H4.3V20h2.64V8.5ZM5.62 4a1.53 1.53 0 1 0 0 3.06 1.53 1.53 0 0 0 0-3.06ZM20 20h-2.64v-6.02c0-1.44-.03-3.29-2-3.29-2.01 0-2.32 1.57-2.32 3.19V20H10.4V8.5h2.53v1.57h.04c.35-.67 1.22-1.37 2.5-1.37 2.68 0 3.17 1.76 3.17 4.05V20Z' />
        </svg>
      </a>
    </div>
  );
}

export default function Footer() {
  const rootRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const textScreenRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const cornerRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const footer = footerRef.current;
    const textScreen = textScreenRef.current;
    const curtain = curtainRef.current;
    const corner = cornerRef.current;
    const words = wordsRef.current;
    if (!root || !footer || !textScreen || !curtain || !corner || !words)
      return;

    const wordSpans = gsap.utils.toArray<HTMLElement>('[data-word]', words);

    // Travel direction of the band (perpendicular to its "/" edges), pointing
    // toward the bottom-right corner where it comes to rest as the accent.
    const rad = ((CURTAIN_ANGLE + 90) * Math.PI) / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);

    // Geometry is viewport-relative and recomputed on every ScrollTrigger
    // refresh so the wipe covers fully and rests correctly at any size.
    const geom = { sStart: 0, sEnd: 0 };

    const computeGeom = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // BR corner of the viewport projects onto the travel axis at +R
      // (viewport centre = 0). That is the invariant we lock rest pose to.
      const R = (vw * Math.abs(dx) + vh * Math.abs(dy)) / 2;
      const thickness = 0.74 * R;
      const width = 3 * (vw + vh);

      curtain.style.width = `${width}px`;
      curtain.style.height = `${thickness}px`;

      // Start fully off-screen toward top-left.
      geom.sStart = -(R + thickness / 2 + 0.2 * R);

      // Rest pose: leading edge = R + overshoot → always past the BR corner,
      // so the beige region is a solid filled accent (no leftover black wedge).
      const overshoot = 0.2 * R;
      geom.sEnd = R + overshoot - thickness / 2;
    };

    // p: 0 = off-screen (black), 1 = rested as bottom-right accent.
    const proxy = { p: 0 };
    const applyCurtain = () => {
      const s = geom.sStart + (geom.sEnd - geom.sStart) * proxy.p;
      const tx = s * dx;
      const ty = s * dy;
      curtain.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${CURTAIN_ANGLE}deg)`;
    };

    const mm = gsap.matchMedia();

    mm.add(MOTION_CONDITIONS, ctx => {
      const { reduce } = ctx.conditions as MotionConditions;
      computeGeom();

      if (reduce) {
        // Static final state: footer + accent visible, no pin, no scrub.
        proxy.p = 1;
        applyCurtain();
        gsap.set(wordSpans, { yPercent: 0, opacity: 1 });
        gsap.set(textScreen, { autoAlpha: 0 });
        gsap.set(corner, { autoAlpha: 1 });
        return;
      }

      proxy.p = 0;
      applyCurtain();
      gsap.set(textScreen, { autoAlpha: 1 });
      gsap.set(corner, { autoAlpha: 0 });
      // Words start hidden and stay hidden until the section is PINNED and the
      // user scrolls — nothing plays on arrival.
      gsap.set(wordSpans, { yPercent: 120, opacity: 0 });

      // Single pinned, scrubbed timeline. Everything is locked to scroll
      // position — the page is frozen while scrolling drives each step.
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=320%', // long range → each word needs real scrolling
          pin: true,
          scrub: true, // strictly locked to scroll — no smoothing tail
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            computeGeom();
            applyCurtain();
          },
        },
      });

      // 1) Words reveal one-by-one over the first ~100vh of the pinned scroll.
      tl.to(
        wordSpans,
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.16,
          ease: 'power3.out',
          stagger: 0.04,
        },
        0
      );

      // 2) Thin beige ribbon sweeps across, then parks as the bottom-right accent.
      tl.to(proxy, { p: 1, duration: 0.55, onUpdate: applyCurtain }, 0.4);

      // 3) Fade the text screen as the ribbon crosses so the footer is revealed.
      tl.to(textScreen, { autoAlpha: 0, duration: 0.2 }, 0.58);

      // 4) Reveal the socials + copyright sitting on the rested accent.
      tl.to(corner, { autoAlpha: 1, duration: 0.12 }, 0.9);
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      id='footer'
      ref={rootRef}
      className='relative h-screen w-full overflow-hidden bg-black'
    >
      {/* Footer content (bottom layer, uncovered by the passing band) */}
      <div ref={footerRef} className='absolute inset-0 z-10'>
        <div className='relative flex h-full flex-col px-6 py-8 md:px-10 md:py-14 lg:px-16'>
          {/* Logo + tagline */}
          <div className='flex shrink-0 flex-col items-center pt-10 md:pt-[200px]'>
            <img
              src='/assets/logo-2.avif'
              alt='Belgő'
              className='h-16 w-auto md:h-36'
            />
          </div>

          {/* Addresses — mobile pb clears the beige BR accent; desktop unchanged */}
          <div className='mt-auto grid max-w-3xl grid-cols-1 gap-x-12 gap-y-5 pb-40 sm:grid-cols-2 sm:gap-y-8 md:gap-y-8 md:pb-0'>
            <div className='space-y-5 md:space-y-8'>
              <LocationBlock location={LOCATIONS[0]} />
              <LocationBlock location={LOCATIONS[2]} />
              <LocationBlock location={LOCATIONS[4]} />
            </div>
            <div className='space-y-5 md:space-y-8'>
              <LocationBlock location={LOCATIONS[1]} />
              <LocationBlock location={LOCATIONS[3]} />
            </div>
          </div>
        </div>
      </div>

      {/* Diagonal beige band — sweeps across, then rests as the accent */}
      <div
        ref={curtainRef}
        aria-hidden='true'
        className='pointer-events-none absolute top-1/2 left-1/2 z-30 bg-[#e4ddcf] will-change-transform'
        style={{ transform: 'translate(-150%, -150%) rotate(-32deg)' }}
      />

      {/* Socials + copyright — ride on top of the rested accent */}
      <div ref={cornerRef} className='absolute inset-0 z-40 opacity-0'>
        {/* Tip fill under socials — covers any residual BR wedge only. */}
        <div
          aria-hidden='true'
          className='pointer-events-none absolute right-0 bottom-0 h-[48vmin] w-[62vmin] bg-[#e4ddcf]'
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
        />
        <div className='relative flex h-full flex-col items-end justify-end px-6 py-10 md:px-10 md:py-14 lg:px-16'>
          <div className='flex items-center gap-4'>
            <span
              className='text-xs tracking-[0.16em] text-[#1A1A1A]'
              style={{ fontFamily: 'var(--font-bebas), sans-serif' }}
            >
              FOLLOW US ON
            </span>
            <SocialIcons />
          </div>
          <p
            className='mt-6 text-xs tracking-[0.08em] text-[#1A1A1A]'
            style={{ fontFamily: 'var(--font-bebas), sans-serif' }}
          >
            Copyright © 2025 Belgo The Belgium Brewery
          </p>
        </div>
      </div>

      {/* Text screen (covers footer at start; hidden once fully behind beige) */}
      <div
        ref={textScreenRef}
        className='absolute inset-0 z-20 flex items-center justify-center bg-black px-6'
      >
        <h2
          ref={wordsRef}
          className='flex flex-wrap items-center justify-center gap-x-[0.3em] gap-y-1 text-center leading-none'
          style={{
            fontFamily: 'var(--font-bebas), sans-serif',
            fontSize: 'clamp(2rem, 6vw, 5rem)',
          }}
        >
          {HEADLINE_WORDS.map(word => (
            <span
              key={word.text}
              className='inline-block overflow-hidden py-[0.1em]'
            >
              <span
                data-word
                className='inline-block'
                style={{ color: word.accent ? '#ffffff' : '#e4ddcf' }}
              >
                {word.text}
              </span>
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
