'use client';
import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { VR, pB, EY, d1, UQ } from '@/lib/motion';
import { useLocale } from '@/components/shared/locale-provider';
import { useSmoothProgress } from '@/components/shared/use-smooth-progress';
import { PanelBackground } from '@/components/shared/panel-background';
import { CurtainReveal } from '@/components/shared/curtain-reveal';

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/></filter><rect width='140' height='140' filter='url(%23n)' opacity='0.7'/></svg>\")";

const TAGLINE_CLASS =
  'font-display text-[clamp(2.52rem,4.68vw,6.32rem)] leading-[0.98] tracking-[-0.018em] text-ivory drop-shadow-[0_3px_22px_rgba(0,0,0,0.22)]';

/** Heritage: pinned 260vh panel; tagline 1 slides in/out on scroll, tagline 2 rises at the end. */
export function HeritageSection() {
  const { t } = useLocale();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: rawP } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const p = useSmoothProgress(rawP);

  const line1X = useTransform(
    p,
    [0, 0.35, 0.62, 0.88],
    ['80vw', '0vw', '0vw', '-80vw']
  );
  const line2X = useTransform(
    p,
    [0, 0.35, 0.62, 0.88],
    ['-80vw', '0vw', '0vw', '80vw']
  );
  const linesOpacity = useTransform(p, [0, 0.26, 0.66, 0.88], [0, 1, 1, 0]);
  const tag2Y = useTransform(p, [0.72, 0.96], ['24vh', '0vh']);
  const tag2Opacity = useTransform(p, [0.74, 0.96], [0, 1]);

  const taglines = t.heritage.taglines;
  const words = taglines[0].split(' ');
  const line1 = words.slice(0, 5).join(' ');
  const line2 = words.slice(5).join(' ');

  return (
    <section
      id='heritage'
      ref={ref}
      aria-labelledby='heritage-title'
      className='bg-charcoal-950 relative min-h-[100svh] snap-start'
      style={{ height: '260vh' }}
    >
      <div className='sticky top-0 h-[100svh] min-h-[620px] overflow-hidden'>
        {/* Curtain reveal from the west72_showcase block: four ivory columns part while the
            image unwinds from 15° and 1.2 scale. See components/shared/curtain-reveal.tsx. */}
        <CurtainReveal hostRef={ref} rotation={90}>
          <PanelBackground
            src='/images/assets/heritage/silhouette.webp'
            alt='Silhouette against the Magnolia façade at golden hour'
            tone='from-clay-600 via-clay-700 to-charcoal-900'
            depth={UQ.subtle}
            scrim={false}
            layerClassName='scale-[1.04]'
            imageClassName='object-cover object-[50%_48%]'
          />
        </CurtainReveal>
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_17%_34%,rgba(255,226,170,0.38),transparent_34%),linear-gradient(90deg,rgba(245,205,141,0.18),transparent_28%,rgba(11,9,8,0.1)_72%,rgba(11,9,8,0.42)),linear-gradient(180deg,rgba(11,9,8,0.08),transparent_42%,rgba(11,9,8,0.58))]'
        />
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay'
          style={{ backgroundImage: GRAIN }}
        />
        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={d1}
          variants={EY(0.18, 0.1)}
          className='absolute inset-x-0 top-[37.5%] z-10 flex flex-col items-center px-5 text-center sm:px-8'
        >
          <motion.p
            id='heritage-title'
            variants={pB}
            className='font-display text-ivory text-[clamp(1.08rem,1.72vw,2.16rem)] leading-none drop-shadow-[0_2px_14px_rgba(0,0,0,0.22)]'
          >
            {t.heritage.brand}
          </motion.p>
          <motion.div
            variants={pB}
            transition={{ duration: 0.9, ease: VR }}
            className='relative mt-9 flex min-h-[13rem] w-full max-w-[81rem] items-start justify-center overflow-hidden md:min-h-[17rem]'
          >
            {reduced ? (
              <div
                className={`max-w-[22ch] whitespace-normal ${TAGLINE_CLASS}`}
              >
                <p>{taglines[0]}</p>
                <p className='mt-6 whitespace-nowrap'>{taglines[1]}</p>
              </div>
            ) : (
              <>
                <motion.div
                  aria-hidden
                  style={{ opacity: linesOpacity }}
                  className={`absolute w-full max-w-[22ch] whitespace-normal ${TAGLINE_CLASS}`}
                >
                  <motion.span style={{ x: line1X }} className='block'>
                    {line1}
                  </motion.span>
                  <motion.span style={{ x: line2X }} className='block'>
                    {line2}
                  </motion.span>
                </motion.div>
                <motion.p
                  aria-hidden
                  style={{ y: tag2Y, opacity: tag2Opacity }}
                  className={`absolute whitespace-nowrap ${TAGLINE_CLASS}`}
                >
                  {taglines[1]}
                </motion.p>
                <span className='sr-only'>{taglines.join('. ')}</span>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
