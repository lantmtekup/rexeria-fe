'use client';
import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion';
import { VR, Fv, V1, gT } from '@/lib/motion';
import { siteConfig } from '@/lib/site-config';
import { useLocale } from '@/components/shared/locale-provider';
import { PanelBackground } from '@/components/shared/panel-background';
import { CursorGlow } from '@/components/shared/cursor-glow';
import { ScrollFrameSequence } from '@/components/shared/scroll-frame-sequence';
import heroFrames from '@/lib/hero-frames.json';
import { useSmoothProgress } from '@/components/shared/use-smooth-progress';

/**
 * Panel image data referenced by the hero (`P.hero`).
 * `tone` is only rendered when `src` is absent; the spec does not state a hero-specific
 * value, so the PanelBackground default gradient is replicated here.
 */
const P = {
  hero: {
    src: '/images/assets/hero/2cb5cde9e63f1f02d524186966868fc771df1cc8.webp',
    alt: 'The Magnolia hero background',
    tone: 'from-amber-600 via-amber-700 to-charcoal-900',
  },
} as const;

const HERO_FRAMES = '/frames/hero';

/**
 * Scrub pacing.
 *
 * The film is 23.8 s. How much scrolling it costs decides whether a viewer can read the
 * footage or just sees it flash past. The useful unit is **pixels of scroll per second of
 * video**; scroll-driven film sits comfortably around 100–150 px/s, because one mouse-wheel
 * notch is ~100 px, so a notch should advance well under a second of footage.
 *
 * The original site uses a 260svh track, which at a 900 px viewport leaves 1440 px of travel;
 * the film occupies the first 80 % of it (1152 px) and so runs at 48 px/s — one wheel notch
 * jumps ~2 s of film. That is the "flies past, can't see anything" problem.
 *
 * 520svh gives 3780 px of travel, 3024 px of film, = 127 px/s (114 px/s on a 812 px phone,
 * 152 px/s on a 1080 px display). A wheel notch now advances ~0.8 s of footage.
 */
const TRACK_CLASS = 'h-[520svh]';

/** Fraction of the track the film occupies; the remaining 20 % holds the closing frame. */
const FILM_SPAN = 0.8;

/**
 * Opening hold.
 *
 * The film opens on a title card — the mark on a near-black field — and that card is the first
 * thing anyone sees. Mapped straight through, it lasts only as long as its own ~1.5 s of
 * footage, so two wheel notches blow past it and the page appears to have shown nothing.
 *
 * The first 12 % of the track now pins the video at t=0, which parks the card for ~454 px of
 * scroll before the film starts moving. The film then runs over the remaining 0.12 → 0.8,
 * which is 108 px per second of footage: still inside the legible band.
 */
const FILM_START = 0.12;

/**
 * Hero: scroll-scrubbed opening film (520svh) → static hero once the film reaches 80 %.
 *
 * The film plays as a canvas frame sequence rather than a scrubbed `<video>`, which is what the
 * rexerai "Hero - Scroll Video" block does first and only falls back from. See
 * components/shared/scroll-frame-sequence.tsx for why seeking was the thing making it stutter.
 */
export function HeroSection() {
  const reduced = useReducedMotion();
  const [completed, setCompleted] = useState(false);
  if (reduced) return <HeroStatic />;
  if (completed) return <HeroStatic />;
  return (
    <HeroScrub
      onComplete={() => {
        setCompleted(true);
        window.requestAnimationFrame(() => {
          window.scrollTo(0, 0);
          // Keep Lenis's internal position in step with the reset, otherwise the next wheel
          // event eases back from where Lenis still thinks the page is.
          window.dispatchEvent(new CustomEvent('magnolia:scroll-reset'));
        });
      }}
    />
  );
}

function HeroScrub({ onComplete }: { onComplete: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const smoothed = useSmoothProgress(scrollYProgress);

  // Hand off on the SMOOTHED value, not the raw one: if a fast flick pushed raw progress past
  // the threshold the film would still be mid-glide, and the swap would cut it off unseen.
  useMotionValueEvent(smoothed, 'change', v => {
    if (v >= FILM_SPAN) onComplete();
  });

  return (
    <section
      id='top'
      ref={sectionRef}
      aria-label='The Magnolia opening film'
      className={`relative ${TRACK_CLASS} bg-charcoal-950 snap-start`}
    >
      <div className='sticky top-0 h-[100svh] min-h-[620px] overflow-hidden'>
        <PanelBackground
          src={P.hero.src}
          alt={P.hero.alt}
          tone={P.hero.tone}
          depth={0}
          priority
          scrim={false}
          layerClassName='scale-100'
        />
        <div className='absolute inset-0 z-10'>
          <ScrollFrameSequence
            dir={HERO_FRAMES}
            count={heroFrames.count}
            width={heroFrames.width}
            height={heroFrames.height}
            scrollYProgress={smoothed}
            getProgress={p =>
              (Math.max(0, p) - FILM_START) / (FILM_SPAN - FILM_START)
            }
            className='pointer-events-none absolute inset-0 h-full w-full object-cover'
          />
        </div>
        {siteConfig.cursorGlow === true && <CursorGlow />}
      </div>
    </section>
  );
}

function HeroStatic() {
  const { t } = useLocale();

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('scroll-scrub-video-diagnostic', {
        detail: {
          event: 'mode-static-reduced-motion',
          label: 'hero',
          phase: 'static-reduced-motion',
          attempt: 0,
          isEligible: false,
          visibility: document.visibilityState,
        },
      })
    );
  }, []);

  return (
    <motion.section
      id='top'
      whileInView={Fv}
      viewport={gT}
      transition={V1}
      className='relative h-[100svh] min-h-[620px] snap-start overflow-hidden'
    >
      <PanelBackground
        src={P.hero.src}
        alt={P.hero.alt}
        tone={P.hero.tone}
        depth={0}
        priority
        scrim={false}
        layerClassName='scale-100'
      />
      {siteConfig.cursorGlow && <CursorGlow />}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, delay: 1.1, ease: VR }}
        className='font-display text-ivory/85 pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-6 text-center text-[clamp(2.7rem,5.4vw,4.95rem)] leading-none tracking-[-0.005em]'
      >
        {t.hero.tagline}
      </motion.p>
    </motion.section>
  );
}
