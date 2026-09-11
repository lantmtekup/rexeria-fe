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

  // Mount the iframe on first intersection (threshold 0, default rootMargin — `mountRootMargin` is defined but unused).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const activate = () => {
      setMounted(true);
      setStatus('loading');
    };
    if (typeof IntersectionObserver === 'undefined') {
      const check = () => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          activate();
          window.removeEventListener('scroll', check);
          window.removeEventListener('resize', check);
        }
      };
      window.addEventListener('scroll', check, { passive: true });
      window.addEventListener('resize', check);
      check();
      return () => {
        window.removeEventListener('scroll', check);
        window.removeEventListener('resize', check);
      };
    }
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          activate();
          io.disconnect();
        }
      },
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
      className='relative h-[100svh] snap-start overflow-hidden bg-black px-10 pt-[120px] pb-16 sm:px-10 sm:pt-32 md:px-10 md:pt-28 md:pb-16'
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
          className='bg-charcoal-night relative mt-7 min-h-0 flex-1 overflow-hidden rounded-[18px] md:mt-8'
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
                  className='border-ivory/45 tracking-luxe text-ivory hover:bg-ivory/10 focus-visible:ring-champagne-300 mt-5 inline-flex items-center gap-3 border px-5 py-3 font-sans text-[0.56rem] uppercase transition-colors'
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
