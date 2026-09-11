'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { siteConfig } from '@/lib/site-config';
import { useLocale } from '@/components/shared/locale-provider';
import { Sparkle } from '@/components/shared/magnolia-mark';

type Status = 'dormant' | 'loading' | 'ready' | 'failed';

export function InteractiveTourSection() {
  const { t } = useLocale();
  const reduced = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<Status>('dormant');
  const { embedUrl, externalUrl, previewSrc, readyTimeoutMs } =
    siteConfig.interactiveTour;

  /*
   * The tour loads on request, not on arrival.
   *
   * Measured on this page: while the tour is on screen, 29 % of frames miss 32 ms, against
   * 7.6 % elsewhere. It renders 2.78 million gaussian splats in WebGL, and that competes with
   * the compositor for the whole time it is visible — scrolling past it is what feels bad.
   *
   * Unmounting it once it leaves the screen would not help: measured off-screen it costs
   * nothing at all (0 dropped frames of 321), because the browser already stops it. And the
   * viewer takes no quality or level-of-detail parameter, so it cannot be turned down from
   * outside. That leaves one lever that actually works — do not start it until it is wanted.
   */
  const open = () => {
    setMounted(true);
    setStatus('loading');
  };

  // Ready timeout → unavailable state.
  useEffect(() => {
    if (!mounted || status !== 'loading') return;
    const id = window.setTimeout(() => setStatus('failed'), readyTimeoutMs);
    return () => window.clearTimeout(id);
  }, [mounted, status, readyTimeoutMs]);

  return (
    <section
      id='interactive-tour'
      ref={ref}
      aria-labelledby='interactive-tour-heading'
      className='bg-charcoal-950 relative h-[100svh] snap-start overflow-hidden px-10 pt-[120px] pb-16 sm:px-10 sm:pt-32 md:px-10 md:pt-28 md:pb-16'
    >
      <div className='flex h-full flex-col'>
        <div className='flex flex-wrap items-end justify-between gap-x-8 gap-y-4'>
          <h2
            id='interactive-tour-heading'
            className='font-display text-ivory max-w-[40rem] text-[clamp(1.536rem,2.72vw,3.2rem)] leading-[1.08] tracking-[-0.02em]'
          >
            {t.globe.heading}
          </h2>
        </div>
        <div
          aria-busy={status === 'loading'}
          className='bg-charcoal-950 relative mt-7 min-h-0 flex-1 overflow-hidden rounded-[18px] md:mt-8'
        >
          <img
            src={previewSrc}
            alt=''
            loading='lazy'
            decoding='async'
            className='absolute inset-0 h-full w-full object-cover'
          />
          <div
            aria-hidden
            className='from-charcoal-950/55 via-charcoal-950/10 to-charcoal-950/20 absolute inset-0 bg-gradient-to-t'
          />
          {mounted && (
            <iframe
              src={embedUrl}
              title={t.tour.title}
              loading='eager'
              allow='fullscreen; xr-spatial-tracking; accelerometer; gyroscope'
              allowFullScreen
              referrerPolicy='strict-origin-when-cross-origin'
              onLoad={() => setStatus('ready')}
              onError={() => setStatus('failed')}
              className={`absolute inset-0 z-10 h-full w-full border-0 ${reduced ? '' : 'transition-opacity duration-500'} ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
          {/*
           * Covers the viewer's own outbound chip in the top-right corner, which links visitors
           * away to studio.realhorizons.ai. The iframe is cross-origin so its DOM cannot be
           * touched; a patch in the page's own colour over that corner is the only way.
           *
           * Deliberately only the outbound link. The "powered by" credit at the bottom is the
           * provider's attribution and is left alone.
           */}
          {status === 'ready' && (
            <div
              aria-hidden
              className='bg-charcoal-950 pointer-events-none absolute top-0 right-0 z-[15] h-[clamp(44px,4.6vw,62px)] w-[clamp(150px,15vw,230px)] rounded-bl-[14px]'
            />
          )}
          {status === 'dormant' && (
            <div className='absolute inset-0 z-20 grid place-items-center px-6 text-center'>
              <div>
                <button
                  type='button'
                  onClick={open}
                  className='border-ivory/55 bg-charcoal-950/45 tracking-luxe text-ivory hover:bg-ivory hover:text-charcoal-950 focus-visible:ring-champagne-300 inline-flex items-center gap-4 border px-7 py-4 font-sans text-[0.75rem] uppercase backdrop-blur-[3px] transition-colors duration-500 sm:text-[0.62rem]'
                >
                  <Sparkle size={10} />
                  {t.tour.title}
                  <Sparkle size={10} />
                </button>
                <p className='text-ivory/55 mt-4 font-sans text-[0.75rem] sm:text-[0.58rem]'>
                  {t.globe.hint}
                </p>
              </div>
            </div>
          )}
          {status === 'loading' && (
            <div className='bg-charcoal-950/30 absolute inset-0 z-20 grid place-items-center px-6 text-center backdrop-blur-[1px]'>
              <p
                role='status'
                aria-live='polite'
                className='font-display text-ivory/90 text-[clamp(1rem,1.7vw,1.5rem)]'
              >
                {t.tour.loading}
              </p>
            </div>
          )}
          {status === 'failed' && (
            <div className='bg-charcoal-950/35 absolute inset-0 z-20 grid place-items-center px-6 text-center backdrop-blur-[1px]'>
              <div>
                <p
                  role='alert'
                  className='font-display text-ivory/90 text-[clamp(1rem,1.7vw,1.5rem)]'
                >
                  {t.tour.unavailable}
                </p>
                <a
                  href={externalUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='border-ivory/45 tracking-luxe text-ivory hover:bg-ivory/10 focus-visible:ring-champagne-300 mt-5 inline-flex items-center gap-3 border px-5 py-3 font-sans text-[0.75rem] uppercase transition-colors sm:text-[0.56rem]'
                >
                  <Sparkle size={9} />
                  {t.tour.openExternal}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      <motion.div
        aria-hidden
        animate={
          reduced
            ? { opacity: 0.7 }
            : { y: [0, 5, 0], opacity: [0.55, 1, 0.55] }
        }
        transition={
          reduced
            ? undefined
            : { duration: 1.35, repeat: Infinity, ease: 'easeInOut' }
        }
        className='text-ivory pointer-events-none absolute bottom-[14px] left-1/2 z-20 -translate-x-1/2'
      >
        <svg width='18' height='12' viewBox='0 0 18 12' fill='none' aria-hidden>
          <path d='m2 2 7 7 7-7' stroke='currentColor' strokeWidth='1.5' />
        </svg>
      </motion.div>
    </section>
  );
}
