'use client';
import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useLocale } from '@/components/shared/locale-provider';
import { useSmoothProgress } from '@/components/shared/use-smooth-progress';
import {
  StackedReveal,
  type StackedItem,
} from '@/components/shared/stacked-reveal';

/**
 * Day experience, rebuilt on the rexerai block `HeroScroll` ("Hero Scroll Reveal Cinematic").
 *
 * The original slides four pairs of images in from the right and out to the left. Each phase
 * arrives, sits, and is gone; nothing connects morning to noon except that one replaced the
 * other, and the section reads as four separate panels rather than one day passing.
 *
 * The stacked reveal makes the connection visible: each photograph shrinks into a frame and
 * uncovers the next standing behind it, so the four times of day become one continuous
 * passage. See components/shared/stacked-reveal.tsx for the values it carries over.
 *
 * Only the four lead photographs remain. The second image of each pair was decoration in a
 * layout that no longer exists; four full-bleed pictures, each given the screen, say more.
 */
const PHASE_IMAGES = [
  { id: 'morning', src: '/images/assets/day-experience/morning-01.webp' },
  { id: 'noon', src: '/images/assets/day-experience/noon-01.webp' },
  { id: 'afternoon', src: '/images/assets/day-experience/afternoon-01.webp' },
  { id: 'evening', src: '/images/assets/day-experience/evening-02.webp' },
] as const;

export function GallerySection() {
  const { t } = useLocale();
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;

  const items: StackedItem[] = PHASE_IMAGES.map(p => ({
    key: p.id,
    src: p.src,
    alt: `${t.gallery.ariaLabel} — ${t.gallery.phases[p.id]}`,
    label: t.gallery.phases[p.id],
  }));

  return (
    <section
      id='gallery'
      ref={ref}
      aria-label={t.gallery.ariaLabel}
      className='bg-charcoal-950 relative snap-start'
    >
      <Intro />
      <StackedReveal items={items} />
    </section>
  );
}

/** The statement that opens the passage, held on its own screen before the day begins. */
function Intro() {
  const { t } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress: raw } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const p = useSmoothProgress(raw);

  const opacity = useTransform(p, [0, 0.18, 0.7, 1], [0, 1, 1, 0]);
  const y = useTransform(p, [0, 0.18, 0.7, 1], [28, 0, 0, -24]);
  const blur = useTransform(
    p,
    [0, 0.18, 0.7, 1],
    ['blur(10px)', 'blur(0px)', 'blur(0px)', 'blur(6px)']
  );

  const [first, second] = t.gallery.intro.split('\n');

  return (
    <div ref={ref} style={{ height: reduced ? undefined : '180svh' }}>
      <div className='sticky top-0 flex h-[100svh] min-h-[620px] items-center justify-center overflow-hidden px-6'>
        <motion.p
          style={reduced ? undefined : { opacity, y, filter: blur }}
          className='font-display text-ivory/92 max-w-[46rem] text-center text-[clamp(1.6rem,3.1vw,3.3rem)] leading-[1.22] tracking-[-0.02em]'
        >
          {first}
          <br />
          {second}
        </motion.p>
      </div>
    </div>
  );
}
