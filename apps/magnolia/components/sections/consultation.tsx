'use client';
import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { VR } from '@/lib/motion';
import { useLocale } from '@/components/shared/locale-provider';
import { MagnoliaMark, Sparkle } from '@/components/shared/magnolia-mark';

/**
 * Entrance borrowed from the rexerai block "Sub-nav - Floating Pill"
 * (`block-editor/blocks/DelvauxSubnav.tsx`): `y: 80 → 0`, `opacity: 0 → 1`, 1 s, `power2.out`.
 * `[0.25, 0.46, 0.45, 0.94]` is that GSAP ease written as its cubic-bezier, so the timing
 * matches the source block rather than approximating it.
 */
const POWER2_OUT = [0.25, 0.46, 0.45, 0.94] as const;

const INPUT_CLASS =
  'h-11 w-full bg-black/55 px-2 font-sans text-[0.72rem] text-ivory placeholder:text-ivory/45 focus:outline-none focus:ring-1 focus:ring-champagne-200';

function SocialIcon({ icon }: { icon: 'facebook' | 'instagram' | 'whatsapp' }) {
  return (
    <span className='border-ivory/35 text-ivory/90 grid h-10 w-10 place-items-center rounded-full border'>
      {icon === 'facebook' && (
        <span className='font-sans text-sm font-semibold'>f</span>
      )}
      {icon === 'instagram' && (
        <svg
          viewBox='0 0 24 24'
          className='h-4 w-4'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.6'
        >
          <rect x='3.5' y='3.5' width='17' height='17' rx='4' />
          <circle cx='12' cy='12' r='3.6' />
          <circle
            cx='17.8'
            cy='6.3'
            r='0.8'
            fill='currentColor'
            stroke='none'
          />
        </svg>
      )}
      {icon === 'whatsapp' && (
        <svg
          viewBox='0 0 24 24'
          className='h-4 w-4'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.45'
        >
          <path d='M19.6 4.5A10 10 0 0 0 4.1 16.6L3 21l4.5-1.2A10 10 0 1 0 19.6 4.5Z' />
          <path d='M9 7.5c.2-.5.4-.5.7-.5h.6c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5-.1.7l-.6.7c.7 1.3 1.7 2.3 3 3l.7-.6c.2-.2.5-.2.7-.1l1.8.8c.3.1.4.3.4.5v.6c0 .3-.1.5-.5.7-.6.3-1.5.4-3-.2-1.3-.5-3-1.8-4.3-4.1-.6-1.1-.9-2.1-.7-3.2Z' />
        </svg>
      )}
    </span>
  );
}

export function ConsultationSection() {
  const { t } = useLocale();
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);

  /*
   * Fire when the viewer has STOPPED, not at a visibility percentage.
   *
   * With smooth scrolling a percentage threshold is unreliable: Lenis eases the last stretch
   * of a scroll over several hundred milliseconds, so a threshold crossed near the end still
   * leaves the page gliding, and 80px of rise is invisible underneath a moving page. Measured
   * at `amount: 0.95`, four fifths of the animation had already run by the time the section
   * actually landed.
   *
   * Watching for scroll to go quiet puts the whole rise in front of a still viewer.
   */
  /*
   * Waiting for scroll to go quiet was making the picture take two to three seconds to show:
   * any small movement reset the timer, and only then did the 1.2 s reveal begin. It now fires
   * on arrival, and the card follows it rather than racing ahead — the image lands first, the
   * form settles onto it.
   */
  const landed = useInView(sectionRef, { amount: 0.45, once: true });

  // Spec §9 — Derived values.
  const tel = 'tel:' + t.contact.phone.replace(/[^+\d]/g, '');
  const maps =
    'https://maps.google.com/?q=' + encodeURIComponent(t.footer.address);

  return (
    <section
      id='consultation'
      ref={sectionRef}
      aria-labelledby='consultation-title'
      className='bg-charcoal-night text-ivory relative flex min-h-[100svh] snap-start flex-col overflow-x-hidden px-5 pt-20 pb-8 sm:px-8 sm:pt-24 sm:pb-10 md:px-12 md:pt-28 md:pb-12'
    >
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 overflow-hidden'
      >
        <motion.div
          className='absolute inset-0'
          /*
           * Rise plus zoom, not rise alone. 80px is 9 % of a full-bleed background, and on a
           * dark, busy photograph that much travel reads as nothing — the eye only picks up the
           * fade. Pairing the pill's rise with `media-zoom` from the same motion library
           * (scale 1.22 → 1.04) is what makes the movement legible at this size.
           *
           * The scale never reaches 1: 4 % of overscale stays as margin, and at the start the
           * 22 % covers the 80px offset so the rise never exposes the top edge.
           */
          initial={
            reduced
              ? { opacity: 0, scale: 1.04 }
              : { y: 80, scale: 1.22, opacity: 0 }
          }
          animate={landed ? { y: 0, scale: 1.04, opacity: 1 } : undefined}
          transition={{ duration: reduced ? 0.4 : 1.2, ease: POWER2_OUT }}
        >
          <Image
            src='/images/assets/heritage/silhouette2.webp'
            priority
            alt=''
            fill
            sizes='100vw'
            quality={92}
            className='object-cover object-center'
          />
        </motion.div>
      </div>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 28 }}
        animate={landed ? { opacity: 1, y: 0 } : undefined}
        // Starts after the picture has had most of its 1.2 s, so the two read as one sequence
        // rather than two things happening at once.
        transition={{ duration: 0.7, delay: reduced ? 0 : 0.55, ease: VR }}
        className='relative z-10 mx-auto my-10 flex w-full max-w-[31rem] flex-1 items-center sm:my-12'
      >
        <div className='border-ivory/30 w-full border bg-black/35 px-10 py-9 shadow-[0_18px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:px-14 sm:py-10'>
          <div className='flex flex-col items-center text-center'>
            <MagnoliaMark className='text-ivory/90 h-14 w-14' />
            <h2
              id='consultation-title'
              className='font-display text-ivory mt-3 text-[clamp(2.15rem,3.15vw,3.05rem)] leading-none tracking-[-0.035em]'
            >
              {t.contact.brand}
            </h2>
            <p className='text-ivory/75 mt-2 font-sans text-[0.52rem] tracking-[0.34em] uppercase sm:text-[0.58rem]'>
              {t.contact.kicker}
            </p>
            <span aria-hidden className='bg-ivory/25 mt-6 h-px w-12' />
          </div>
          <form
            onSubmit={e => e.preventDefault()}
            className='mt-7 flex flex-col gap-[18px]'
          >
            <div>
              <label
                htmlFor='consultation-name'
                className='font-display text-ivory/90 mb-2 block text-[0.76rem]'
              >
                {t.contact.labels.name}
              </label>
              <input
                id='consultation-name'
                type='text'
                name='name'
                autoComplete='name'
                required
                placeholder={t.contact.fields.name}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label
                htmlFor='consultation-contact'
                className='font-display text-ivory/90 mb-2 block text-[0.76rem]'
              >
                {t.contact.labels.contact}
              </label>
              <input
                id='consultation-contact'
                type='text'
                name='contact'
                autoComplete='tel'
                inputMode='tel'
                required
                placeholder={t.contact.fields.contact}
                className={INPUT_CLASS}
              />
            </div>
            <button
              type='submit'
              className='border-ivory/50 bg-ivory/15 font-display text-ivory hover:bg-ivory/25 focus-visible:ring-champagne-200 mt-2 flex h-12 items-center justify-center gap-5 border px-4 text-[clamp(0.88rem,1.2vw,1.08rem)] transition-colors'
            >
              <Sparkle size={12} />
              {t.contact.submit}
              <Sparkle size={12} />
            </button>
          </form>
        </div>
      </motion.div>
      <div className='border-ivory/25 relative z-10 flex flex-col gap-6 border-t pt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8'>
        <div className='flex flex-wrap items-center gap-3'>
          <a
            href={maps}
            target='_blank'
            rel='noreferrer'
            className='border-ivory/45 font-display text-ivory/90 hover:bg-ivory/10 inline-flex h-11 items-center gap-4 border px-5 text-[clamp(0.82rem,1.2vw,1.05rem)] transition-colors'
          >
            <Sparkle size={12} />
            {t.contact.map}
            <Sparkle size={12} />
          </a>
          <div aria-hidden className='flex items-center gap-2'>
            <SocialIcon icon='facebook' />
            <SocialIcon icon='instagram' />
            <SocialIcon icon='whatsapp' />
          </div>
        </div>
        <div className='flex flex-col items-start gap-2 sm:items-end sm:text-right'>
          <a
            href={tel}
            className='font-display text-ivory/95 hover:text-champagne-200 text-[clamp(1.3rem,2.3vw,2.25rem)] leading-none tracking-[-0.025em] transition-colors'
          >
            {t.contact.phone}
          </a>
          <a
            href={`mailto:${t.contact.email}`}
            className='font-display text-ivory/85 hover:text-champagne-200 text-[clamp(0.8rem,1vw,1rem)] leading-none transition-colors'
          >
            {t.contact.email}
          </a>
        </div>
      </div>
    </section>
  );
}
