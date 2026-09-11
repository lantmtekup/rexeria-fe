import type Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * One place that owns "is the page allowed to scroll".
 *
 * Two things have to agree. `overflow: hidden` on the document stops the browser, but Lenis
 * runs its own rAF loop against a target position it keeps internally — left running, it
 * happily keeps easing while the page is frozen and then jumps when the freeze lifts. So the
 * lock has to reach the Lenis instance as well, which means something outside
 * `components/shared/smooth-scroll.tsx` needs a handle on it. That component registers the
 * instance here on mount and clears it on unmount.
 *
 * Nothing registers under `prefers-reduced-motion` — Lenis is never created — and the
 * `overflow` half of the lock still works on its own.
 */
let instance: Lenis | null = null;

export function registerLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function lockScroll() {
  instance?.stop();
  document.documentElement.style.overflow = 'hidden';
}

/**
 * Releases the lock and re-measures every ScrollTrigger.
 *
 * The hero's pin is created while the page is still frozen, so its start/end were measured
 * against a document that could not scroll. Refreshing on the way out is what makes the pin
 * land on the right pixels the first time rather than after the first scroll corrects it.
 */
export function unlockScroll() {
  instance?.start();
  document.documentElement.style.overflow = '';
  ScrollTrigger.refresh();
}
