'use client';
import { useEffect, useState, type ReactNode, type RefObject } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Curtain reveal, ported from the rexerai block `west72_showcase`
 * (`block-editor/blocks/West72Showcase.tsx`).
 *
 * Values taken from the source block rather than approximated:
 *
 * | | source | here |
 * |---|---|---|
 * | beat | `REVEAL_BEAT_DURATION = 1.6` | 1.6 s |
 * | ease | `power2.out` | `[0.25, 0.46, 0.45, 0.94]`, its cubic-bezier |
 * | image | `IMAGE_ROTATION = 15`, `IMAGE_ROTATE_SCALE = 1.2` → 0 / 1 | same |
 * | curtains | 4 columns, `yPercent: ±100`, alternating | same |
 * | timing | every tween at position 0 | same, one shared transition |
 *
 * The 1.2 scale is not decoration: a full-bleed layer rotated 15° needs roughly that much
 * overscale or its corners swing into frame. The panels are inset a pixel past each edge for
 * the same reason, so no hairline shows between them while they travel.
 */
const POWER2_OUT = [0.25, 0.46, 0.45, 0.94] as const;
const BEAT = 1.6;

/**
 * Scale needed for a w×h layer, rotated by `deg`, to still cover a w×h box.
 *
 * A fixed number cannot do this job once the angle grows. The source block's 1.2 suits its
 * 15°, but at 90° a 16:9 layer needs 1.78 and a 21:9 window needs 2.14 — anything less and the
 * corners swing into frame. Solving it from the real rectangle keeps the zoom no larger than
 * the angle actually demands.
 */
function coverScale(w: number, h: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  const c = Math.abs(Math.cos(rad));
  const s = Math.abs(Math.sin(rad));
  return Math.max(w / (w * c + h * s), h / (w * s + h * c)) * 1.04;
}

export type CurtainRevealProps = {
  /**
   * The host section. The curtains part once its top nears the top of the viewport.
   * Ignored when `open` is supplied.
   */
  hostRef?: RefObject<HTMLElement>;
  /**
   * Drive the reveal from the parent instead. Needed for a horizontal track, where a card
   * arrives sideways and the vertical rule below cannot see it.
   */
  open?: boolean;
  /** Fraction of the viewport height the section top must reach. */
  threshold?: number;
  /** Degrees the image unwinds from. The source block uses 15. */
  rotation?: number;
  panels?: number;
  /** Curtain colour. Ivory is this site's white. */
  color?: string;
  children: ReactNode;
};

export function CurtainReveal({
  hostRef,
  open: openProp,
  threshold = 0.12,
  rotation = 15,
  panels = 4,
  color = '#e8e5dd',
  children,
}: CurtainRevealProps) {
  const reduced = useReducedMotion();
  const [selfOpen, setSelfOpen] = useState(false);
  const open = openProp ?? selfOpen;
  // Measured from the host so the zoom matches the window, not a guess.
  const [startScale, setStartScale] = useState(() =>
    coverScale(16, 9, rotation)
  );

  useEffect(() => {
    const el = hostRef?.current;
    if (!el) {
      setStartScale(
        coverScale(window.innerWidth, window.innerHeight, rotation)
      );
      return;
    }
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height)
        setStartScale(
          coverScale(r.width, Math.min(r.height, window.innerHeight), rotation)
        );
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [hostRef, rotation]);

  /*
   * Read the section's own rectangle rather than a scroll MotionValue.
   *
   * Two earlier attempts failed on this section. Its pinned progress is zero until it has
   * already been scrolled past, so the reveal never ran on arrival. And `useInView` cannot
   * help either: the section is 260vh, so at a 900px viewport no more than 38 % of it is ever
   * on screen and any `amount` above that can never be satisfied.
   *
   * The rectangle is unambiguous: fire when the top edge reaches the upper tenth of the
   * screen, which is the moment the sticky panel finishes filling it.
   */
  useEffect(() => {
    if (openProp !== undefined || selfOpen) return;
    const el = hostRef?.current;
    if (!el) return;
    let confirm = 0;
    const holds = () =>
      el.getBoundingClientRect().top <= window.innerHeight * threshold;
    /*
     * Confirm the position before committing.
     *
     * When the hero film ends the page collapses by several thousand pixels and scroll snaps
     * back to the top. For one frame in the middle of that, this section's top sweeps through
     * the trigger band, and a naive check fired there — so the curtains had already opened
     * before the viewer ever arrived. Requiring the condition to still hold 120 ms later
     * ignores that sweep without delaying a real arrival noticeably.
     */
    const check = () => {
      if (!holds()) {
        window.clearTimeout(confirm);
        confirm = 0;
        return;
      }
      if (confirm) return;
      confirm = window.setTimeout(() => {
        if (holds()) setSelfOpen(true);
        confirm = 0;
      }, 120);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.clearTimeout(confirm);
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [hostRef, threshold, openProp, selfOpen]);

  const transition = { duration: reduced ? 0 : BEAT, ease: POWER2_OUT };

  return (
    <div
      className='absolute inset-0 overflow-hidden'
      data-curtain-open={open ? '1' : '0'}
    >
      <motion.div
        className='absolute inset-0'
        style={{ transformOrigin: 'center' }}
        // `animate` always carries a target. Leaving it undefined while closed meant framer had
        // nothing to animate from when it later appeared, and the tween never ran.
        initial={{ rotate: rotation, scale: startScale }}
        animate={{ rotate: open ? 0 : rotation, scale: open ? 1 : startScale }}
        transition={transition}
      >
        {children}
      </motion.div>

      {Array.from({ length: panels }).map((_, i) => (
        <motion.div
          key={i}
          aria-hidden
          className='pointer-events-none absolute z-10 will-change-transform'
          style={{
            top: -1,
            height: 'calc(100% + 2px)',
            left: `calc(${(i * 100) / panels}% - 1px)`,
            width: `calc(${100 / panels}% + 2px)`,
            backgroundColor: color,
          }}
          initial={{ y: '0%' }}
          animate={{ y: open ? (i % 2 === 0 ? '-100%' : '100%') : '0%' }}
          transition={transition}
        />
      ))}
    </div>
  );
}
