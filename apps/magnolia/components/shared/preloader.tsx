'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MagnoliaMark } from './magnolia-mark';
import { useLocale } from './locale-provider';
import { siteConfig } from '@/lib/site-config';
import { VR } from '@/lib/motion';

/**
 * Opening beat.
 *
 * The original holds for 1.4 s and then cross-fades out, which is too brief for anything to
 * register: the mark appears already finished, spins a third of a turn, and is gone. This
 * version stages the moment so it can actually be read, using effects from the rexerai motion
 * library (`block-editor/motion/motionLibrary.ts`):
 *
 * | beat | effect | what it does |
 * |---|---|---|
 * | 0.15 s | `scale-in` + `blur-in` | mark resolves from soft and undersized into focus |
 * | 0.70 s | `word-reveal` | the name rises word by word through a mask |
 * | 1.20 s | `fade-up` | the kicker settles under it |
 * | 1.45 s | `line-draw` | a rule draws across, giving the wait something to track |
 * | exit | `clip-reveal` | the curtain wipes upward off the hero instead of dissolving |
 *
 * The wipe matters: a cross-fade makes the screen disappear, a wipe hands the page over.
 */
const ENTER_MARK = 0.15;
const ENTER_WORD = 0.7;
const ENTER_KICKER = 1.2;
const ENTER_LINE = 1.45;
const EXIT_DURATION = 1;

/** Hard ceiling on waiting for `window.load` before the beat is allowed to finish. */
const LOAD_TIMEOUT = 10_000;

export function Preloader() {
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();
  const { t } = useLocale();
  const { markSize, spinDuration, minDuration } = siteConfig.preloader;

  useEffect(() => {
    const started = performance.now();
    let timer = 0;
    const finish = () => {
      const elapsed = performance.now() - started;
      timer = window.setTimeout(
        () => setDone(true),
        Math.max(0, minDuration - elapsed)
      );
    };
    const waitLoad = new Promise<void>(resolve => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', () => resolve(), { once: true });
      window.setTimeout(resolve, LOAD_TIMEOUT);
    });
    waitLoad.then(finish);
    return () => window.clearTimeout(timer);
  }, [minDuration]);

  useEffect(() => {
    document.documentElement.setAttribute('aria-busy', String(!done));
    document.body.style.overflow = done ? '' : 'hidden';
    return () => {
      document.documentElement.removeAttribute('aria-busy');
      document.body.style.overflow = '';
    };
  }, [done]);

  const words = t.hero.brand.split(' ');
  const dwell = minDuration / 1000;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          id='preloader'
          key='preloader'
          className='bg-charcoal-night fixed inset-0 z-[200] grid place-items-center overflow-hidden'
          initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={reduced ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: reduced ? 0.4 : EXIT_DURATION, ease: VR }}
        >
          <motion.div
            className='relative flex translate-y-[10px] flex-col items-center'
            exit={reduced ? undefined : { y: -28, opacity: 0 }}
            transition={{ duration: EXIT_DURATION * 0.8, ease: VR }}
          >
            {/* scale-in + blur-in — the mark resolves rather than simply appearing. */}
            <motion.div
              className='text-champagne-400 max-w-[45vw]'
              style={{ width: markSize, height: markSize }}
              initial={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.86, filter: 'blur(12px)' }
              }
              animate={
                reduced
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, filter: 'blur(0px)' }
              }
              transition={{ duration: 1.1, delay: ENTER_MARK, ease: VR }}
            >
              {/* Rotation lives on its own layer so the entrance transform is not fighting it. */}
              <motion.div
                className='h-full w-full'
                animate={reduced ? undefined : { rotate: 360 }}
                transition={{
                  duration: spinDuration,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <MagnoliaMark size={markSize} className='h-full w-full' />
              </motion.div>
            </motion.div>

            {/* word-reveal — each word rises through its own mask. */}
            <h1 className='font-display text-ivory mt-9 flex gap-[0.28em] text-[clamp(1.5rem,2.6vw,2.3rem)] leading-none tracking-[0.02em]'>
              {words.map((word, i) => (
                <span
                  key={word + i}
                  className='block overflow-hidden py-[0.08em]'
                >
                  <motion.span
                    className='block'
                    initial={{ y: reduced ? '0%' : '110%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{
                      duration: 0.9,
                      delay: ENTER_WORD + i * 0.06,
                      ease: VR,
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              className='tracking-luxe text-champagne-100/70 mt-3 font-sans text-[0.5rem] font-light uppercase'
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: ENTER_KICKER, ease: VR }}
            >
              {t.contact.kicker}
            </motion.p>

            {/* line-draw — a rule that grows for the length of the hold. */}
            <div className='bg-ivory/12 mt-7 h-px w-[min(34vw,15rem)] overflow-hidden'>
              <motion.div
                className='bg-champagne-300/80 h-full w-full origin-left'
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: Math.max(0.6, dwell - ENTER_LINE),
                  delay: ENTER_LINE,
                  ease: 'linear',
                }}
              />
            </div>

            <p role='status' aria-live='polite' className='sr-only'>
              {t.a11y.loading}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
