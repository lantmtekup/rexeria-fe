'use client';
import { useMemo } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { VR, pB, EY, d1 } from '@/lib/motion';
import { useLocale } from '@/components/shared/locale-provider';
import { ImageStagger } from '@/components/shared/image-stagger';
import {
  MediaPanelTrack,
  type TrackItem,
} from '@/components/shared/media-panel-track';

const cardImages: Record<string, string> = {
  '3 Bedroom': '/images/assets/units/card-3br.webp',
  Penthouse: '/images/assets/units/card-penthouse.webp',
  Duplex: '/images/assets/units/card-duplex.webp',
};
/* Aspect ratios are the files' own — two portraits and a landscape. Declared rather than
   imposed so the grid bends to the pictures instead of cropping them to a common shape. */
const strips = [
  { src: '/images/assets/units/strip-1.webp', aspect: '1800 / 2388' },
  { src: '/images/assets/units/strip-2.webp', aspect: '1800 / 1167' },
  { src: '/images/assets/units/strip-3.webp', aspect: '1800 / 2388' },
];
const P = {
  units: {
    src: '/images/assets/units/townhouse-hero.webp' as string | undefined,
    alt: 'The Townhouse — living room facing the tower façade at golden hour',
  },
};

/**
 * The closing plate: the picture opens out, then the words arrive.
 *
 * The order is the point. Before this the whole group faded up together on `d1`
 * (`amount: 0.28`), which on a plate this tall fires while it is still a strip at the bottom of
 * the screen — the animation was over before anyone had it in front of them, which reads as no
 * animation at all. It now waits for 40 % of the plate and runs as a sequence.
 *
 * The picture grows out of a smaller rounded card into full bleed. That is the hero's outro
 * played backwards — the hero shrinks into a rounded card as it leaves, this one opens out of
 * one as it arrives — so the page closes the section the way it opened.
 *
 * Height is a screen height, capped. It used to be `min(58vw, 860px)` — measured off the
 * window's WIDTH, so on a wide monitor the 860 px cap was what decided it and the plate sat as
 * a short band under a very tall picture. A closing plate carrying the collection name and its
 * call to action should hold the screen. The source is 3200 × 2133, so a full-height frame
 * crops about a fifth of its height, which the composition has to spare.
 */
const PLATE_VIEWPORT = { once: true, amount: 0.4 } as const;

const plateImage: Variants = {
  hidden: { scale: 0.86, borderRadius: 28 },
  visible: {
    scale: 1,
    borderRadius: 0,
    transition: { duration: 1.5, ease: VR },
  },
};

/** Held back until the picture is most of the way open, then one line after another. */
const plateCopy: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.9, staggerChildren: 0.18 } },
};

const plateLine: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: VR } },
};

const plateCta: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, delay: 1.35, ease: VR },
  },
};

function Compass({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 16 16'
      fill='currentColor'
      aria-hidden
      className={className ?? 'h-3 w-3'}
    >
      <path d='M8 0 L8.7 6.4 L8 8 L7.3 6.4 Z' />
      <path d='M8 16 L8.7 9.6 L8 8 L7.3 9.6 Z' />
      <path d='M0 8 L6.4 7.3 L8 8 L6.4 8.7 Z' />
      <path d='M16 8 L9.6 7.3 L8 8 L9.6 8.7 Z' />
      <path opacity='.55' d='M2.34 2.34 L6.4 6.05 L8 8 L6.05 6.4 Z' />
      <path opacity='.55' d='M13.66 2.34 L9.95 6.4 L8 8 L9.6 6.05 Z' />
      <path opacity='.55' d='M2.34 13.66 L6.05 9.6 L8 8 L6.4 9.95 Z' />
      <path opacity='.55' d='M13.66 13.66 L9.95 9.6 L8 8 L9.6 9.95 Z' />
    </svg>
  );
}

export function UnitsSection() {
  const { t, locale } = useLocale();
  const reduced = useReducedMotion() ?? false;
  const dividerLines = [t.units.divider[0], t.units.divider[1]];

  /*
   * The dictionary carries only a title per unit — no description, unlike the amenities. The
   * panel renders tighter when `body` is absent rather than leaving a hole; supply copy here
   * and it fills out on its own.
   */
  const unitItems: TrackItem[] = useMemo(
    () =>
      t.units.types.map(({ title }) => ({
        key: title,
        src: cardImages[title],
        alt: title,
        title,
        cta: t.units.explore,
      })),
    [t]
  );

  return (
    <section
      id='units'
      aria-labelledby='units-heading'
      className='text-ivory bg-charcoal-950 relative'
    >
      <div className='mx-auto max-w-[1440px] px-8 pt-24 md:pt-28'>
        <motion.h2
          id='units-heading'
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={d1}
          transition={{ duration: 0.9, ease: VR }}
          className='font-display text-ivory max-w-[36rem] text-[clamp(1.88rem,3.32vw,3.48rem)] leading-[1.05] tracking-[-0.015em]'
        >
          {locale === 'vi' ? (
            <>
              Không gian sống được
              <br />
              tinh chỉnh
            </>
          ) : (
            t.units.heading
          )}
        </motion.h2>
      </div>

      {/*
       * The track sits OUTSIDE the 1440px container on purpose. Its panels are 100vw, so
       * inside that container the viewport clipped them to 1376px — which cut away the right
       * edge where the card is anchored, and made the measured travel (and so the section)
       * far longer than it should be.
       */}
      <div className='mt-20'>
        <MediaPanelTrack items={unitItems} chip={t.units.hero.eyebrow} />
      </div>

      {/*
       * Staggered grid from the rexerai block FramerImageStagger: the statement sets the three
       * pictures up, then they sit off-register — one large plate, a shorter column dropped
       * below it. See components/shared/image-stagger.tsx for what it replaced and why.
       */}
      <div className='mt-28'>
        <ImageStagger
          items={strips.map(({ src, aspect }, i) => ({
            key: src,
            src,
            aspect,
            alt: dividerLines.join(' · ') + ` — ${i + 1}`,
          }))}
          heading={
            <motion.p
              initial='hidden'
              whileInView='visible'
              viewport={d1}
              variants={EY(0.1, 0.2)}
              className='font-display text-ivory text-[clamp(1.5rem,2.9vw,2.9rem)] leading-[1.14] tracking-[-0.005em]'
            >
              {dividerLines.map((line, li) => (
                <span key={line} className={li === 0 ? 'block' : 'mt-2 block'}>
                  {line.split(' ').map((word, wi, arr) => (
                    <motion.span
                      key={`${word}-${wi}`}
                      variants={pB}
                      // `whitespace-pre`: the trailing space lives inside this span, and an
                      // inline-block collapses trailing whitespace — which ran every word
                      // together.
                      className={
                        wi === arr.length - 1
                          ? 'text-champagne-200 inline-block whitespace-pre'
                          : 'inline-block whitespace-pre'
                      }
                    >
                      {word}
                      {wi < arr.length - 1 ? ' ' : ''}
                    </motion.span>
                  ))}
                </span>
              ))}
            </motion.p>
          }
        />
      </div>

      <motion.div
        initial={reduced ? 'visible' : 'hidden'}
        whileInView='visible'
        viewport={PLATE_VIEWPORT}
        className='bg-navy-dark relative mt-24 h-[min(100svh,1240px)] min-h-[640px] w-full overflow-hidden'
      >
        {/* The card that opens out. `overflow-hidden` is what lets the radius bite while it
            is still small, and the plate's own navy shows at the edges as it grows. */}
        <motion.div
          variants={plateImage}
          style={{ transformOrigin: 'center' }}
          className='absolute inset-0 overflow-hidden'
        >
          <Image
            src={P.units.src ?? cardImages['3 Bedroom']}
            alt={P.units.alt}
            fill
            sizes='100vw'
            quality={92}
            className='object-cover'
          />
        </motion.div>

        <motion.div
          variants={plateCopy}
          className='text-ivory absolute right-8 bottom-0 left-8 flex flex-col gap-2 pb-36 md:right-auto md:left-10 md:pb-20'
        >
          <motion.p
            variants={plateLine}
            className='font-display text-[clamp(1rem,1.6vw,1.72rem)] leading-none'
          >
            {t.units.hero.eyebrow}
          </motion.p>
          <motion.p
            variants={plateLine}
            className='font-display text-[clamp(2.72rem,5.92vw,5.6rem)] leading-none font-semibold tracking-[-0.018em]'
          >
            {t.units.hero.title}
          </motion.p>
        </motion.div>

        <motion.div
          variants={plateCta}
          className='absolute right-8 bottom-16 left-8 md:right-10 md:bottom-20 md:left-auto'
        >
          <button
            type='button'
            className='group border-ivory/55 text-ivory hover:bg-ivory inline-flex h-[72px] w-full min-w-[18rem] items-center justify-center gap-[22px] border bg-black/[0.16] px-[34px] font-sans text-[0.75rem] backdrop-blur-[5px] transition-colors duration-500 hover:text-black md:w-auto'
          >
            <Compass className='h-5 w-5' />
            <span className='font-display'>{t.units.hero.explore}</span>
            <Compass className='h-5 w-5' />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
