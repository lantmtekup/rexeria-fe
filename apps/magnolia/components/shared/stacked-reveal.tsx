'use client';
import { useRef, type RefObject } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useSmoothProgress } from './use-smooth-progress';

/**
 * Stacked cinematic reveal, ported from the rexerai block `HeroScroll.tsx`
 * ("Hero Scroll Reveal Cinematic").
 *
 * Every image is stacked full-bleed, the first on top. As you scroll, the front image shrinks
 * from full-bleed into a rounded frame in the middle of the screen, which uncovers the next
 * image standing behind it; then it keeps shrinking and fades out as the new one takes over.
 * The last image stays full-bleed and closes the section.
 *
 * This tells the story rather than listing it: each picture visibly makes way for the next,
 * so a sequence of four reads as one continuous passage instead of four separate panels.
 *
 * Values from the source block, with its GSAP timeline positions normalised into scroll
 * progress:
 *
 * | | source | here |
 * |---|---|---|
 * | shrink | `shrinkScale = 0.4` desktop, `0.52` mobile | same |
 * | frame radius | `FRAME_RADIUS = 24` | same |
 * | fade-out | `scale × 0.35`, `autoAlpha 0`, duration 0.6 | same |
 * | lead-in | `HOLD_START = 0.12` | same |
 * | tail | `HOLD_END = 0.25` | same |
 * | track | `400dvh` desktop, `300dvh` mobile | same |
 *
 * The source's separate time-based entrance (1.18 → 1 over 1.8 s) is left out: it exists to
 * cover a hero landing cold at the top of a page, and this section is arrived at mid-scroll.
 */
const HOLD_START = 0.12;
const HOLD_END = 0.25;
const FRAME_RADIUS = 24;
const SHRINK = 0.4;
const FADE_SCALE = 0.35;

export type StackedItem = {
  key: string;
  src: string;
  alt: string;
  label: string;
};

/** Timeline length in the source's units: last Phase B ends at (n−1) + HOLD_START + 0.6. */
const totalBeats = (n: number) => n - 1 + HOLD_START + 0.6 + HOLD_END;

function Layer({
  item,
  index,
  count,
  progress,
  reduced,
}: {
  item: StackedItem;
  index: number;
  count: number;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const T = totalBeats(count);
  const isLast = index === count - 1;

  // Phase A: full-bleed → centred rounded frame. Phase B: keep shrinking and fade.
  const aStart = (index + HOLD_START) / T;
  const aEnd = (index + 1 + HOLD_START) / T;
  const bEnd = (index + 1 + HOLD_START + 0.6) / T;

  const range = isLast ? [0, 1] : [aStart, aEnd, bEnd];
  const scale = useTransform(
    progress,
    range,
    isLast ? [1, 1] : [1, SHRINK, SHRINK * FADE_SCALE]
  );
  const radius = useTransform(
    progress,
    range,
    isLast ? [0, 0] : [0, FRAME_RADIUS, FRAME_RADIUS]
  );
  const opacity = useTransform(progress, range, isLast ? [1, 1] : [1, 1, 0]);
  // The label belongs to the picture: it leaves with it.
  const labelOpacity = useTransform(
    progress,
    range,
    isLast ? [1, 1] : [1, 0.9, 0]
  );

  return (
    <motion.div
      className='absolute inset-0 overflow-hidden will-change-transform'
      style={
        reduced
          ? { zIndex: count - index, opacity: index === 0 ? 1 : 0 }
          : {
              zIndex: count - index,
              scale,
              borderRadius: radius,
              opacity,
              transformOrigin: 'center center',
            }
      }
    >
      <img
        src={item.src}
        alt={item.alt}
        loading='eager'
        decoding='async'
        className='h-full w-full object-cover'
      />
      <div
        aria-hidden
        className='from-charcoal-950/70 to-charcoal-950/20 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent'
      />
      <motion.p
        style={reduced ? undefined : { opacity: labelOpacity }}
        className='font-display text-ivory absolute bottom-[9%] left-[5%] text-[clamp(2rem,4.4vw,5.2rem)] leading-none tracking-[-0.03em] [text-shadow:0_3px_24px_rgb(0_0_0_/_0.45)]'
      >
        {item.label}
      </motion.p>
    </motion.div>
  );
}

export function StackedReveal({
  items,
  hostRef,
  intro,
}: {
  items: StackedItem[];
  /** Optional external ref, when the caller needs the section element too. */
  hostRef?: RefObject<HTMLElement>;
  intro?: React.ReactNode;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress: raw } = useScroll({
    target: (hostRef ?? innerRef) as RefObject<HTMLElement>,
    offset: ['start start', 'end end'],
  });
  const p = useSmoothProgress(raw);

  return (
    <div ref={innerRef} style={{ height: reduced ? undefined : '400svh' }}>
      <div className='bg-charcoal-950 sticky top-0 h-[100svh] min-h-[620px] overflow-hidden'>
        {items.map((item, i) => (
          <Layer
            key={item.key}
            item={item}
            index={i}
            count={items.length}
            progress={p}
            reduced={reduced}
          />
        ))}
        {intro}
      </div>
    </div>
  );
}
