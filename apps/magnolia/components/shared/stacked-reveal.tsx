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
 * | track | `400dvh` desktop, `300dvh` mobile | grown, see `HOLD` |
 *
 * The source's separate time-based entrance (1.18 → 1 over 1.8 s) is left out: it exists to
 * cover a hero landing cold at the top of a page, and this section is arrived at mid-scroll.
 *
 * One departure that matters. In the source, a picture begins its own shrink at the instant
 * the one in front of it reaches frame size — while that one is still on screen fading out. So
 * every picture after the first was already shrinking by the time anything else cleared it: it
 * never had the screen to itself. Noon was never seen full-bleed, only on its way to being
 * small. Each picture now waits for the one in front to finish leaving and then holds
 * full-bleed for `HOLD` before it starts to go, which is the beat the sequence was missing.
 */
const HOLD_START = 0.12;
const HOLD_END = 0.25;
const FRAME_RADIUS = 24;
const SHRINK = 0.4;
const FADE_SCALE = 0.35;

/** Phase A, the shrink from full-bleed to frame, is the unit beat. */
const SHRINK_BEATS = 1;
/** Phase B: the framed picture keeps shrinking and fades out. */
const FADE_BEATS = 0.6;
/** Full-bleed dwell after the picture in front has gone and before this one starts to leave. */
const HOLD = 0.6;
/** One picture's whole turn on screen. */
const STEP = SHRINK_BEATS + FADE_BEATS + HOLD;

/**
 * Scroll length of one beat.
 *
 * In screen heights, so the shrink always costs the same fraction of a screen to scroll
 * through whatever the window size. 76 is the rate the section already ran at (300 svh of
 * travel over 3.97 beats) — the track gets longer because there are more beats in it now, not
 * because anything moves at a different speed.
 */
const BEAT_SVH = 76;

/**
 * Parallax drift.
 *
 * The picture moves against its own frame while that frame holds still, which is what stops a
 * held full-bleed photograph reading as a flat plate — it is the same trick
 * `components/shared/panel-background.tsx` plays on the heritage panel, at `UQ.subtle`.
 *
 * It is driven by the section's own progress rather than by a ScrollTrigger of its own. The
 * stage here is `sticky`, so its rectangle sits at the top of the screen for the whole track
 * and a trigger measured off that rectangle has nothing to travel through. The progress value
 * the layers already share does not have that problem.
 *
 * Each picture drifts across its own window — from when the one in front of it starts leaving
 * to when it has gone itself — so the whole range is spent while that picture is the one being
 * looked at, rather than a quarter of it each.
 *
 * `OVERSCALE` is the margin the drift eats: at ±6 % the layer must be at least 112 % tall or
 * the travel exposes an edge. 1.16 leaves a little over.
 */
const DRIFT = 6;
const OVERSCALE = 1.16;

export type StackedItem = {
  key: string;
  src: string;
  alt: string;
  label: string;
};

/**
 * Timeline length. Every picture but the last takes a full `STEP`; the last one only holds,
 * since it closes the section full-bleed rather than shrinking away.
 */
const totalBeats = (n: number) =>
  HOLD_START + Math.max(0, n - 2) * STEP + SHRINK_BEATS + FADE_BEATS + HOLD_END;

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

  // Phase A: full-bleed → centred rounded frame. Phase B: keep shrinking and fade. Everything
  // before `aStart` is this picture's full-bleed hold, which is simply the absence of a tween.
  const aStart = (HOLD_START + index * STEP) / T;
  const aEnd = aStart + SHRINK_BEATS / T;
  const bEnd = aEnd + FADE_BEATS / T;

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

  // This picture's own turn on screen: it starts being uncovered a hold before its shrink, and
  // is finished when it has faded out (or at the end of the section, for the last one).
  const driftStart = Math.max(0, (HOLD_START + index * STEP - HOLD) / T);
  const driftEnd = isLast ? 1 : bEnd;
  const driftY = useTransform(
    progress,
    [driftStart, driftEnd],
    [`${-DRIFT}%`, `${DRIFT}%`]
  );
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
      <motion.div
        className='absolute inset-0 will-change-transform'
        style={reduced ? undefined : { y: driftY, scale: OVERSCALE }}
      >
        <img
          src={item.src}
          alt={item.alt}
          loading='eager'
          decoding='async'
          className='h-full w-full object-cover'
        />
      </motion.div>
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
  const track = `${Math.round(100 + totalBeats(items.length) * BEAT_SVH)}svh`;

  return (
    <div ref={innerRef} style={{ height: reduced ? undefined : track }}>
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
