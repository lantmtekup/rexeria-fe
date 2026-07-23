'use client';

import { useEffect, useId, useRef } from 'react';
import {
  gsap,
  ScrollTrigger,
  SplitText,
  createBlockEntrySnap,
  MOTION_CONDITIONS,
  type MotionConditions,
} from '@/app/lib/motion';

const CHAR_STAGGER = 0.08;
const CHAR_DURATION = 0.7;
const SHIFT_DURATION = 0.85;
const YEAR_DURATION = 0.7;
const LINE_REVEAL_DURATION = 0.65;
const CHAR_Y = '1.1em';
const INTRO_HOLD = 0.15;
const KNOCKOUT_DURATION = 0.35;
const VIDEO_IN_DURATION = 0.45;
const VEIL_DISSOLVE_DURATION = 1.4;
const VEIL_RISE_Y = '-12vh';
/** Pin distance: intro + knockout + dissolve, bidirectional scrub. */
const PIN_SCROLL = '+=220%';

type BrandHeritageProps = {
  onActiveChange?: (isActive: boolean) => void;
};

const getSinceCenterOffset = (titleRow: HTMLElement, year: HTMLElement) => {
  const styles = getComputedStyle(titleRow);
  const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
  return (year.offsetWidth + gap) / 2;
};

export default function BrandHeritage({ onActiveChange }: BrandHeritageProps) {
  const maskUid = useId().replace(/:/g, '');
  const maskId = `heritage-knockout-${maskUid}`;

  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const whiteVeilRef = useRef<SVGSVGElement>(null);
  const captionReadRef = useRef<HTMLDivElement>(null);
  const titleRowRef = useRef<HTMLDivElement>(null);
  const sinceRef = useRef<HTMLSpanElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const onActiveChangeRef = useRef(onActiveChange);
  onActiveChangeRef.current = onActiveChange;

  useEffect(() => {
    const root = rootRef.current;
    const videoEl = videoRef.current;
    const whiteVeilEl = whiteVeilRef.current;
    const captionReadEl = captionReadRef.current;
    const titleRow = titleRowRef.current;
    const sinceEl = sinceRef.current;
    const yearEl = yearRef.current;
    const taglineEl = taglineRef.current;

    if (
      !root ||
      !videoEl ||
      !whiteVeilEl ||
      !captionReadEl ||
      !titleRow ||
      !sinceEl ||
      !yearEl ||
      !taglineEl
    ) {
      return;
    }

    const mm = gsap.matchMedia();
    let cancelled = false;

    const setupMotion = () => {
      if (cancelled) return;

      mm.add(MOTION_CONDITIONS, context => {
        const { reduce } = context.conditions as MotionConditions;

        const ctx = gsap.context(() => {
          const sinceSplit = SplitText.create(sinceEl, {
            type: 'chars',
            mask: 'chars',
          });
          const yearSplit = SplitText.create(yearEl, {
            type: 'chars',
            mask: 'chars',
          });
          const lineSplit = SplitText.create(taglineEl, {
            type: 'lines',
            mask: 'lines',
          });

          const sinceChars = sinceSplit.chars;
          const yearChars = yearSplit.chars;
          const lines = lineSplit.lines;
          const allChars = [...sinceChars, ...yearChars];

          gsap.set(allChars, { display: 'inline-block' });

          const sinceCenterX = getSinceCenterOffset(titleRow, yearEl);

          const ensureVideoPlaying = () => {
            if (videoEl.paused) void videoEl.play();
          };

          const setInitialState = () => {
            gsap.set(titleRow, { x: sinceCenterX });
            gsap.set(sinceChars, {
              y: (i: number) => (i % 2 === 0 ? `-${CHAR_Y}` : CHAR_Y),
              autoAlpha: 0,
            });
            gsap.set(yearChars, {
              y: (i: number) => (i % 2 === 0 ? `-${CHAR_Y}` : CHAR_Y),
              autoAlpha: 0,
            });
            gsap.set(lines, { yPercent: 110, opacity: 0 });
            gsap.set(captionReadEl, { autoAlpha: 1 });
            gsap.set(whiteVeilEl, { autoAlpha: 0, y: 0 });
            gsap.set(videoEl, { autoAlpha: 0 });
          };

          const setFinalState = () => {
            gsap.set(titleRow, { x: 0 });
            gsap.set(sinceChars, { y: 0, autoAlpha: 1 });
            gsap.set(yearChars, { y: 0, autoAlpha: 1 });
            gsap.set(lines, { yPercent: 0, opacity: 1 });
            gsap.set(captionReadEl, { autoAlpha: 0 });
            gsap.set(whiteVeilEl, { autoAlpha: 0, y: 0 });
            gsap.set(videoEl, { autoAlpha: 1 });
          };

          // Keep looping in the background even when the section is off-screen.
          videoEl.loop = true;
          ensureVideoPlaying();

          if (reduce) {
            setFinalState();
            ScrollTrigger.create({
              trigger: root,
              start: 'top top',
              end: 'bottom top',
              onToggle: self => {
                onActiveChangeRef.current?.(self.isActive);
              },
            });
            return;
          }

          createBlockEntrySnap(root);
          setInitialState();

          // One scrubbed pin timeline: scroll down plays, scroll up reverses,
          // re-entering from above starts cleanly at progress 0.
          const tl = gsap.timeline({
            defaults: { ease: 'power3.out' },
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: PIN_SCROLL,
              pin: true,
              scrub: 0.65,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onToggle: self => {
                onActiveChangeRef.current?.(self.isActive);
                ensureVideoPlaying();
              },
              onLeaveBack: () => {
                setInitialState();
                ensureVideoPlaying();
              },
            },
          });

          tl.addLabel('blank', 0)
            .to({}, { duration: INTRO_HOLD })
            .to(sinceChars, {
              y: 0,
              autoAlpha: 1,
              duration: CHAR_DURATION,
              stagger: CHAR_STAGGER,
            })
            .addLabel('sinceIn')
            .to(
              titleRow,
              {
                x: 0,
                duration: SHIFT_DURATION,
                ease: 'power2.inOut',
              },
              'sinceIn'
            )
            .addLabel('sinceShift')
            .to(
              yearChars,
              {
                y: 0,
                autoAlpha: 1,
                duration: YEAR_DURATION,
                stagger: CHAR_STAGGER,
              },
              'sinceShift'
            )
            .to(
              lines,
              {
                yPercent: 0,
                opacity: 1,
                duration: LINE_REVEAL_DURATION,
                stagger: { amount: 0.2 },
              },
              'sinceShift'
            )
            .addLabel('typeDone')
            // Knockout: readable type → masked veil (all tweened so scrub reverses).
            .to(captionReadEl, {
              autoAlpha: 0,
              duration: KNOCKOUT_DURATION,
              ease: 'power1.inOut',
            })
            .to(
              whiteVeilEl,
              {
                autoAlpha: 1,
                duration: KNOCKOUT_DURATION,
                ease: 'power1.inOut',
              },
              '<'
            )
            .to(
              videoEl,
              {
                autoAlpha: 1,
                duration: VIDEO_IN_DURATION,
                ease: 'power1.inOut',
              },
              '<'
            )
            .addLabel('knockout')
            // Continue scroll: letter windows rise + veil dissolves → full video.
            .to(whiteVeilEl, {
              y: VEIL_RISE_Y,
              autoAlpha: 0,
              duration: VEIL_DISSOLVE_DURATION,
              ease: 'none',
            });
        }, root);

        ScrollTrigger.refresh();

        return () => {
          ctx.revert();
        };
      });
    };

    void document.fonts.ready.then(setupMotion);

    return () => {
      cancelled = true;
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className='relative h-svh overflow-hidden bg-[#F5F5F5]'
      aria-label='Brand heritage — Since 1829'
    >
      <video
        ref={videoRef}
        src='/video-history.mp4'
        className='pointer-events-none absolute inset-0 z-0 h-full w-full object-cover'
        muted
        playsInline
        loop
        preload='auto'
        aria-hidden='true'
      />

      {/*
        SVG luminance mask: white veil + black SVG text = holes.
        (destination-out is stripped in some Chromium embeds; Tailwind also
        does not emit mix-blend-destination-out in this app.)
      */}
      <svg
        ref={whiteVeilRef}
        className='pointer-events-none absolute inset-0 z-10 h-full w-full opacity-0'
        aria-hidden='true'
      >
        <defs>
          <mask
            id={maskId}
            maskUnits='userSpaceOnUse'
            x='0'
            y='0'
            width='100%'
            height='100%'
          >
            <rect width='100%' height='100%' fill='white' />
            <text
              x='50%'
              y='46%'
              textAnchor='middle'
              dominantBaseline='middle'
              fill='black'
              style={{
                fontFamily: 'var(--font-atlas), sans-serif',
                fontSize: 'clamp(0.75rem, 1.8vw, 0.95rem)',
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}
            >
              The Oldest Fine Leather Goods House in the World
            </text>
            <text
              x='50%'
              y='54%'
              textAnchor='middle'
              dominantBaseline='middle'
              fill='black'
              style={{
                fontFamily: 'var(--font-genath), serif',
                fontSize: 'clamp(3.5rem, 12vw, 7.5rem)',
                fontWeight: 400,
                letterSpacing: '-0.02em',
              }}
            >
              Since 1829
            </text>
          </mask>
        </defs>
        <rect
          width='100%'
          height='100%'
          fill='#F5F5F5'
          mask={`url(#${maskId})`}
        />
      </svg>

      <div
        ref={captionReadRef}
        className='pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 pt-20 pb-16 text-black md:pt-24 md:pb-20'
      >
        <p
          ref={taglineRef}
          className='mb-4 max-w-[20rem] font-(family-name:--font-atlas) text-[clamp(0.75rem,1.8vw,0.95rem)] leading-snug font-medium tracking-[0.02em] sm:max-w-none md:mb-5'
        >
          The Oldest Fine Leather Goods House in the World
        </p>
        <div
          ref={titleRowRef}
          className='flex items-baseline gap-[0.35em] will-change-transform'
        >
          <span
            ref={sinceRef}
            className='overflow-hidden font-(family-name:--font-genath) text-[clamp(3.5rem,12vw,7.5rem)] leading-none tracking-[-0.02em]'
          >
            Since
          </span>
          <span
            ref={yearRef}
            className='overflow-hidden font-(family-name:--font-genath) text-[clamp(3.5rem,12vw,7.5rem)] leading-none tracking-[-0.02em]'
          >
            1829
          </span>
        </div>
      </div>
    </section>
  );
}
