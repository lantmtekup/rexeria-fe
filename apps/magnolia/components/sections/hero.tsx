'use client';
import { useCallback, useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteConfig } from '@/lib/site-config';
import { useLocale } from '@/components/shared/locale-provider';
import { PanelBackground } from '@/components/shared/panel-background';
import { CursorGlow } from '@/components/shared/cursor-glow';
import { useHeroFrames } from '@/components/shared/hero-frames';
import { OPENING_DONE } from '@/lib/events';

gsap.registerPlugin(ScrollTrigger);

/**
 * Panel image behind the canvas. It is the poster: what stands in for the film before the
 * first frame is drawn, and what shows through if the sequence fails to load entirely.
 */
const P = {
  hero: {
    src: '/images/assets/hero/2cb5cde9e63f1f02d524186966868fc771df1cc8.webp',
    alt: 'The Magnolia hero background',
    tone: 'from-clay-500 via-clay-600 to-charcoal-900',
  },
} as const;

/**
 * Scrub pacing, taken from `website-magnolia`: the section is pinned for five viewport heights
 * and the film is mapped linearly across that. `scrub` is the catch-up time in seconds — the
 * canvas eases toward the scroll position rather than snapping to it, which is what keeps a
 * wheel notch from reading as a jump cut.
 */
const SCROLL_LENGTH = '+=500%';
const SCRUB = 0.6;

/**
 * Outro handoff.
 *
 * When the pin releases and the section starts to leave, the frame shrinks around its centre
 * and takes on rounded corners, so the next section arrives around a card rather than the hero
 * sliding off. The colour that appears around the shrinking card is the section's own
 * background — set it to the top edge of whatever follows and the two read as continuous
 * rather than as a seam.
 */
const OUTRO_SCALE = 0.72;
const OUTRO_RADIUS = 32;
/** Top edge of `HeritageSection` (`bg-charcoal-950`). */
const OUTRO_BACKDROP = '#0b0908';

/**
 * The opening slogan.
 *
 * The film opens on the mark alone on a near-black field, which says nothing: a viewer who has
 * just watched the curtains part is looking at a symbol with no name and no reason to scroll.
 * The project's line sits under it and then gets out of the way — it fades across the first 5 %
 * of the scrub, about a quarter of a screen of scrolling, so it is gone before the film has
 * anything of its own to show.
 *
 * It is the same line the film closes on, lettered into its last frames. That is deliberate:
 * said once at the start and once at the end, it reads as the film's own bookends rather than
 * as a caption repeated by accident.
 */
const SLOGAN_FADE = 0.05;

/**
 * Cap the device pixel ratio at 2. Drawing a 1600 px frame onto a 3× canvas on a Retina
 * display costs three times the fill rate and adds no detail the source has.
 */
const MAX_DPR = 2;

/** Cover-fit, so a frame fills the canvas at any aspect ratio without distortion. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number
) {
  const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
}

/**
 * Hero: the opening film, scrubbed frame by frame on a canvas.
 *
 * One section, pinned. Earlier this was a tall scroll track that swapped itself for a separate
 * static hero once the film ended, and reset the scroll position to do it — which meant the
 * thing that scrolled away was never the film, so the handoff to the next section could not
 * come out of the last frame. Pinning keeps a single element on screen for the whole run and
 * lets it leave on its own terms.
 *
 * The film is a frame sequence rather than a scrubbed `<video>`. Seeking a video decodes every
 * frame back to the previous keyframe, and the source ran 85 frames between keyframes at 4K,
 * so one scroll step cost dozens of 4K decodes and the picture always arrived late. Frames are
 * preloaded and decoded up front by `components/shared/hero-frames.tsx`; the work here is one
 * `drawImage` per scroll frame.
 */
export function HeroSection() {
  const { t } = useLocale();
  const reduced = useReducedMotion() ?? false;
  const { framesRef, done } = useHeroFrames();

  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sloganRef = useRef<HTMLDivElement>(null);
  const sloganInnerRef = useRef<HTMLParagraphElement>(null);

  // Scrub progress lives outside React: it changes every frame and must not re-render.
  const scrollState = useRef({ progress: 0 });
  const lastDrawn = useRef(-1);

  const draw = useCallback(
    (progress: number, force = false) => {
      const canvas = canvasRef.current;
      const frames = framesRef.current;
      if (!canvas || frames.length === 0) return;

      const wanted = Math.round(
        gsap.utils.clamp(0, 1, progress) * (frames.length - 1)
      );
      // A frame that failed to load steps back to the nearest one already in hand.
      let index = wanted;
      while (index > 0 && !frames[index]) index -= 1;
      const img = frames[index];
      if (!img) return;
      if (!force && index === lastDrawn.current) return;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;
      lastDrawn.current = index;
      drawCover(ctx, img, canvas.width, canvas.height);
    },
    [framesRef]
  );

  // Canvas follows the section's box × DPR. A ResizeObserver rather than a `resize` listener,
  // so the mobile address bar sliding in and out does not force a redraw of a section whose
  // height is pinned anyway.
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section || reduced) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(section.clientWidth * dpr);
      canvas.height = Math.round(section.clientHeight * dpr);
      // The canvas is cleared by the resize, so the current frame has to be redrawn.
      draw(scrollState.current.progress, true);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(section);
    return () => observer.disconnect();
  }, [draw, reduced]);

  // Frames finished arriving → paint the current one, so the loader lifts onto the real image.
  useEffect(() => {
    if (done) draw(scrollState.current.progress, true);
  }, [done, draw]);

  // Brought in when the curtains have finished parting, not on a timer — the beat's length
  // depends on how long the frames take.
  useEffect(() => {
    const el = sloganInnerRef.current;
    if (!el) return;
    const enter = () => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: reduced ? 0.3 : 1.4,
        ease: 'power2.out',
      });
    };
    if (document.documentElement.getAttribute('aria-busy') === 'false') enter();
    else window.addEventListener(OPENING_DONE, enter, { once: true });
    return () => window.removeEventListener(OPENING_DONE, enter);
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!section || !frame) return;

    const state = scrollState.current;

    const ctx = gsap.context(() => {
      // Written on the wrapper, while the entrance tween owns the element inside it. Two
      // animations on one element's opacity would overwrite each other.
      const setSlogan = sloganRef.current
        ? gsap.quickSetter(sloganRef.current, 'opacity')
        : () => undefined;

      gsap.to(state, {
        progress: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: SCROLL_LENGTH,
          pin: true,
          scrub: SCRUB,
          anticipatePin: 1,
          refreshPriority: 1,
        },
        onUpdate: () => {
          draw(state.progress);
          // Scrubbed rather than tweened, so dragging back to the top brings it again.
          setSlogan(
            1 -
              gsap.utils.clamp(
                0,
                1,
                gsap.utils.normalize(0, SLOGAN_FADE, state.progress)
              )
          );
        },
      });

      // Created after the pin trigger on purpose: ScrollTrigger then knows about the pinned
      // distance and puts the section's 'bottom' where it actually ends up on the page.
      gsap.fromTo(
        frame,
        { scale: 1, borderRadius: 0 },
        {
          scale: OUTRO_SCALE,
          borderRadius: OUTRO_RADIUS,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'bottom bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [draw, reduced]);

  return (
    <section
      id='top'
      ref={sectionRef}
      aria-label='The Magnolia opening film'
      className='relative z-0 h-[100svh] min-h-[620px] w-full overflow-hidden'
      style={{ backgroundColor: OUTRO_BACKDROP }}
    >
      {/* The card that shrinks on the way out. `overflow-hidden` is what lets the radius bite,
          and the scale lives here rather than on the canvas so the corners actually clip. */}
      <div
        ref={frameRef}
        className='absolute inset-0 overflow-hidden will-change-transform'
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

        {!reduced && (
          <canvas
            ref={canvasRef}
            aria-hidden
            className='pointer-events-none absolute inset-0 z-10 h-full w-full'
          />
        )}

        {/*
         * Only when there is no film. The tagline is lettered into the closing frames of the
         * sequence itself, so drawing it again here printed a second copy over the first,
         * offset and in a different face. Reduced motion never gets those frames — it gets the
         * poster — so there the words still have to be said.
         */}
        {reduced && (
          <p className='font-display text-ivory/85 pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 px-6 text-center text-[clamp(2.7rem,5.4vw,4.95rem)] leading-none tracking-[-0.005em]'>
            {t.hero.tagline}
          </p>
        )}

        {/* Not under reduced motion: that branch has no film, so it already prints the line
            in the middle of the poster just above, and two copies would show at once. */}
        <div
          ref={sloganRef}
          hidden={reduced}
          className='pointer-events-none absolute inset-x-0 top-[62%] z-20 px-6 text-center'
        >
          <p
            ref={sloganInnerRef}
            style={{ opacity: 0, transform: 'translateY(16px)' }}
            className='font-display text-ivory/85 text-[clamp(2.1rem,4.1vw,3.9rem)] leading-none tracking-[0.015em] [text-shadow:0_2px_20px_rgb(0_0_0_/_0.5)]'
          >
            {t.hero.tagline}
          </p>
        </div>

        {siteConfig.cursorGlow && <CursorGlow />}
      </div>
    </section>
  );
}
