'use client';
import { useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
      className='text-ivory relative bg-black'
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

      <div className='bg-navy-dark relative mt-24 h-[min(58vw,860px)] min-h-[520px] w-full overflow-hidden'>
        <Image
          src={P.units.src ?? cardImages['3 Bedroom']}
          alt={P.units.alt}
          fill
          sizes='100vw'
          quality={92}
          className='object-cover'
        />
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={d1}
          transition={{ duration: 1.1, ease: VR }}
          className='text-ivory absolute right-8 bottom-0 left-8 flex flex-col gap-2 pb-36 md:right-auto md:left-10 md:pb-20'
        >
          <p className='font-display text-[clamp(1rem,1.6vw,1.72rem)] leading-none'>
            {t.units.hero.eyebrow}
          </p>
          <p className='font-display text-[clamp(2.72rem,5.92vw,5.6rem)] leading-none font-semibold tracking-[-0.018em]'>
            {t.units.hero.title}
          </p>
        </motion.div>
        <div className='absolute right-8 bottom-16 left-8 md:right-10 md:bottom-20 md:left-auto'>
          <button
            type='button'
            className='group border-ivory/55 text-ivory hover:bg-ivory inline-flex h-[72px] w-full min-w-[18rem] items-center justify-center gap-[22px] border bg-black/[0.16] px-[34px] font-sans text-[0.75rem] backdrop-blur-[5px] transition-colors duration-500 hover:text-black md:w-auto'
          >
            <Compass className='h-5 w-5' />
            <span className='font-display'>{t.units.hero.explore}</span>
            <Compass className='h-5 w-5' />
          </button>
        </div>
      </div>
    </section>
  );
}
