'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MagnoliaMark } from './magnolia-mark';
import { useLocale } from './locale-provider';
import { useHeroFrames } from './hero-frames';
import { lockScroll, unlockScroll } from '@/lib/scroll-control';
import { OPENING_DONE } from '@/lib/events';
import { siteConfig } from '@/lib/site-config';

/**
 * Opening loader, ported from the rexerai block `CgResponsiveLandingLoader`
 * ("Responsive Landing Loader", itself a port of Codegrid `cg-responsive-landing-page`).
 *
 * Timing and easing are the source block's, with the GSAP eases written as their cubic-bezier
 * equivalents so framer-motion runs the same curves. The one structural change: the source
 * waits a fixed two seconds before leaving, and this waits for **the hero film's 286 frames to
 * finish decoding**. That is what the wait is actually for — let the page scroll before the
 * sequence is in memory and the first scroll scrubs against frames that are not there yet,
 * which is the stutter this beat exists to prevent. The counter reports real decode progress
 * instead of a random climb, so the number means something.
 *
 * | beat | source | here |
 * |---|---|---|
 * | counter | random 0→100 | frames decoded / 286 |
 * | letters in | `expo.out`, 1.5 s, stagger 0.03 | same |
 * | wait | fixed 2 s | until every frame is decoded |
 * | letters out | `expo.out`, 3 s, stagger 0.03 | same |
 * | loader shrinks | `scale 0.5`, `power4.inOut`, 2 s, +1 s | same |
 * | counter fades | `power2.inOut`, 0.5 s, +1.75 s | same |
 * | first curtain | `height 0%`, `power4.inOut`, 1.5 s, +1.75 s | same |
 * | second curtain | `height 0%`, `power4.inOut`, 1.5 s, +2 s | same |
 *
 * The curtains are the page's own charcoal-night and ivory rather than the source's black and
 * red — the ivory matching the curtains in Heritage and the cards, so the whole site parts the
 * same way — and the mark and wordmark stay, because this loader has a brand to introduce.
 */
const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
const POWER4_IN_OUT = [0.76, 0, 0.24, 1] as const;
const POWER2_IN_OUT = [0.45, 0, 0.55, 1] as const;

const LETTERS_IN = 1.5;
const STAGGER = 0.03;

/** Duration of the letters leaving, and the offsets of everything else within the exit. */
const LETTERS_OUT = 3;
const EXIT_SHRINK = 1;
const EXIT_COUNT_FADE = 1.75;
const EXIT_CURTAIN_1 = 1.75;
const EXIT_CURTAIN_2 = 2;
const CURTAIN_DURATION = 1.5;

/** The beat ends when the second curtain finishes. */
const EXIT_MS = (EXIT_CURTAIN_2 + CURTAIN_DURATION) * 1000;

/**
 * Floor on the hold. Frames served from cache report done almost immediately, and a loader
 * that flashes past reads as a glitch rather than an opening.
 */
const MIN_HOLD_MS = (LETTERS_IN + 0.4) * 1000;

/** Ceiling on the hold, so a stalled or failed frame never traps the page behind the curtain. */
const LOAD_TIMEOUT = 15_000;

export function Preloader() {
  const reduced = useReducedMotion() ?? false;
  const { t } = useLocale();
  const { markSize } = siteConfig.preloader;
  const { loaded, total, done: framesDone } = useHeroFrames();

  const [exiting, setExiting] = useState(false);
  const [done, setDone] = useState(false);

  // Measured from mount, not from whenever an effect last re-ran, so the floor is a floor on
  // the whole beat rather than an extra wait bolted onto the end of the download.
  const mountedAt = useRef(0);
  if (mountedAt.current === 0) mountedAt.current = performance.now();

  // Hold until the frames are in — but never less than the floor, never more than the ceiling.
  useEffect(() => {
    const ceiling = window.setTimeout(() => setExiting(true), LOAD_TIMEOUT);
    let timer = 0;

    if (framesDone) {
      const waited = performance.now() - mountedAt.current;
      timer = window.setTimeout(
        () => setExiting(true),
        Math.max(0, (reduced ? 0 : MIN_HOLD_MS) - waited)
      );
    }

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(ceiling);
    };
  }, [framesDone, reduced]);

  useEffect(() => {
    if (!exiting) return;
    const timer = window.setTimeout(
      () => setDone(true),
      reduced ? 400 : EXIT_MS
    );
    return () => window.clearTimeout(timer);
  }, [exiting, reduced]);

  // The page stays frozen for the whole beat. Unlocking also re-measures the hero's pin, which
  // was created against a document that could not scroll.
  useEffect(() => {
    document.documentElement.setAttribute('aria-busy', 'true');
    lockScroll();
    return () => {
      document.documentElement.removeAttribute('aria-busy');
      unlockScroll();
    };
  }, []);

  useEffect(() => {
    if (!done) return;
    document.documentElement.setAttribute('aria-busy', 'false');
    unlockScroll();
    // The hero waits for this to bring its slogan in. The beat's length is not a constant —
    // it holds until the frames are decoded — so nothing downstream can time itself off a
    // number; it has to be told.
    window.dispatchEvent(new CustomEvent(OPENING_DONE));
  }, [done]);

  const letters = [...t.hero.brand];
  const percent = exiting || !total ? 100 : Math.round((loaded / total) * 100);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          id='preloader'
          key='preloader'
          className='fixed inset-0 z-[200] overflow-hidden'
        >
          {/* Second curtain, behind everything: leaves last. */}
          <motion.div
            className='bg-ivory absolute inset-x-0 top-0'
            initial={{ height: '100%' }}
            animate={{ height: exiting && !reduced ? '0%' : '100%' }}
            transition={{
              duration: CURTAIN_DURATION,
              delay: EXIT_CURTAIN_2,
              ease: POWER4_IN_OUT,
            }}
          />

          {/* The loader shrinks as one piece, the way the source scales its whole pre-loader. */}
          <motion.div
            className='absolute inset-0'
            initial={{ scale: 1 }}
            animate={{ scale: exiting && !reduced ? 0.5 : 1 }}
            transition={{
              duration: 2,
              delay: EXIT_SHRINK,
              ease: POWER4_IN_OUT,
            }}
          >
            {/* First curtain, carrying the brand. Its height is the mask. */}
            <motion.div
              className='bg-charcoal-night absolute inset-x-0 top-0 overflow-hidden'
              initial={{ height: '100%' }}
              animate={{ height: exiting && !reduced ? '0%' : '100%' }}
              transition={{
                duration: CURTAIN_DURATION,
                delay: EXIT_CURTAIN_1,
                ease: POWER4_IN_OUT,
              }}
            >
              {/* Sized to the viewport so the content holds still while the mask closes. */}
              <div className='relative flex h-[100svh] w-full flex-col items-center justify-center'>
                <motion.div
                  className='text-champagne-400'
                  style={{
                    width: markSize,
                    height: markSize,
                    maxWidth: '62vw',
                    maxHeight: '62vw',
                  }}
                  initial={
                    reduced ? { opacity: 0 } : { opacity: 0, scale: 0.88 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: LETTERS_IN, ease: EXPO_OUT }}
                >
                  <MagnoliaMark size={markSize} className='h-full w-full' />
                </motion.div>

                <h1 className='font-display text-ivory mt-8 flex text-[clamp(3.2rem,5.6vw,5rem)] leading-[1.3] tracking-[0.01em]'>
                  {letters.map((char, i) => (
                    <span
                      key={`${char}-${i}`}
                      className='block overflow-hidden py-[0.06em]'
                    >
                      <motion.span
                        className='block whitespace-pre'
                        initial={reduced ? { opacity: 0 } : { y: '110%' }}
                        animate={
                          reduced
                            ? { opacity: 1 }
                            : { y: exiting ? '-110%' : '0%' }
                        }
                        transition={
                          reduced
                            ? { duration: 0.4 }
                            : {
                                duration: exiting ? LETTERS_OUT : LETTERS_IN,
                                delay: i * STAGGER,
                                ease: EXPO_OUT,
                              }
                        }
                      >
                        {char}
                      </motion.span>
                    </span>
                  ))}
                </h1>

                <motion.p
                  className='tracking-luxe text-champagne-100/70 mt-3 font-sans text-[0.75rem] font-light uppercase sm:text-[0.5rem]'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: exiting && !reduced ? 0 : 1 }}
                  transition={{
                    duration: exiting ? 0.6 : 1.2,
                    delay: exiting ? 0 : 0.6,
                    ease: EXPO_OUT,
                  }}
                >
                  {t.contact.kicker}
                </motion.p>

                {!reduced && (
                  <motion.p
                    aria-hidden
                    className='font-display text-ivory/85 absolute bottom-[9svh] left-[7vw] text-[clamp(2.6rem,6vw,6.5rem)] leading-none tabular-nums'
                    initial={{ opacity: 1 }}
                    animate={{ opacity: exiting ? 0 : 1 }}
                    transition={{
                      duration: 0.5,
                      delay: EXIT_COUNT_FADE,
                      ease: POWER2_IN_OUT,
                    }}
                  >
                    {percent}
                    <span className='ml-[0.06em] align-super text-[0.44em]'>
                      %
                    </span>
                  </motion.p>
                )}

                <p role='status' aria-live='polite' className='sr-only'>
                  {t.a11y.loading}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
