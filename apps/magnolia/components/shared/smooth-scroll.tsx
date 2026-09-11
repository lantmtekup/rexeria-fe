'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { registerLenis } from '@/lib/scroll-control';

gsap.registerPlugin(ScrollTrigger);

/**
 * Global smooth scroll.
 *
 * Native scrolling arrives as discrete jumps: a wheel notch moves the page ~100 px in one
 * step. Every scroll-linked effect on this page reads `scrollY`, so those steps land directly
 * in the animation — and the scrubbed hero film is the worst case, because a 100 px step asks
 * for a frame most of a second away. Lenis replaces that with a rAF loop that eases the real
 * scroll position toward the target, so scroll advances in small per-frame deltas.
 *
 * Two things make it cooperate with GSAP rather than fight it:
 *
 * - **One clock.** Lenis runs on `gsap.ticker` (`autoRaf: false`) instead of its own
 *   `requestAnimationFrame`. With two loops, Lenis can move the page after ScrollTrigger has
 *   already read the position for that frame, and a pinned section lags a frame behind the
 *   scroll — visible as the pinned element shivering against the page.
 * - **`ScrollTrigger.update` on every Lenis scroll.** ScrollTrigger otherwise listens to the
 *   native `scroll` event, which is throttled and arrives late relative to the eased position.
 *
 * `lagSmoothing(0)` stops GSAP from silently skipping time after a long frame — useful for a
 * tween, wrong for a scroll position, which must stay pinned to where the page really is.
 *
 * `lerp` is the fraction of remaining distance covered each frame: lower glides longer. 0.1
 * matches `website-magnolia`, whose hero scrub pacing this page now shares.
 */
const LERP = 0.1;

export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    // Never hijack scrolling for someone who asked for reduced motion.
    if (reduced) return;

    const lenis = new Lenis({
      autoRaf: false,
      lerp: LERP,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Touch devices already scroll smoothly and momentum-scroll fights an rAF lerp.
      syncTouch: false,
    });
    registerLenis(lenis);

    const tick = (time: number) => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.off('scroll', ScrollTrigger.update);
      registerLenis(null);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
