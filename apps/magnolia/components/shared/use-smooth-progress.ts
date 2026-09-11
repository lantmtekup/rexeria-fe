'use client';
import { useReducedMotion, useSpring, type MotionValue } from 'framer-motion';

/**
 * Shared easing for every scroll-driven section.
 *
 * A wheel notch or a trackpad flick is a discrete jump, so a transform wired straight to raw
 * scroll progress teleports rather than moves: the eye reads it as a stutter. Passing the
 * progress through a spring turns each jump into a short glide, which is what reads as motion.
 *
 * Over-damped on purpose (damping 18 against ~11 for critical at this stiffness and mass) so
 * it never overshoots. Overshoot on a scroll-linked value looks like the content briefly
 * running backwards, which is worse than the stutter it replaces.
 *
 * Since Lenis (components/shared/smooth-scroll.tsx) now eases the scroll position itself, this
 * spring only has to take the edge off; two cascaded low-passes stack into lag. Hence the high
 * stiffness — it tracks closely and just rounds the corners.
 *
 * Tuning: raise `stiffness` to track the scroll more tightly, lower it for a longer glide.
 */
export const SCROLL_SPRING = {
  stiffness: 190,
  damping: 26,
  mass: 0.22,
} as const;

/**
 * Eases a scroll progress MotionValue. Returns the raw value untouched when the viewer asks
 * for reduced motion, so nothing lags behind their scroll.
 */
export function useSmoothProgress(
  progress: MotionValue<number>
): MotionValue<number> {
  const reduced = useReducedMotion();
  const smoothed = useSpring(progress, SCROLL_SPRING);
  return reduced ? progress : smoothed;
}
