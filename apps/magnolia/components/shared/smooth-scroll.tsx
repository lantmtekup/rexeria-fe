'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { useReducedMotion } from 'framer-motion';

/**
 * Global smooth scroll.
 *
 * Native scrolling arrives as discrete jumps: a wheel notch moves the page ~100 px in one
 * step. Every scroll-linked effect on this page reads `scrollY`, so those steps land directly
 * in the animation — and the scrubbed hero film is the worst case, because a 100 px step asks
 * the video to jump nearly a second of footage at once, which no decoder makes look smooth.
 *
 * Lenis replaces that with a rAF loop that eases the real scroll position toward the target.
 * Scroll then advances in small per-frame deltas, so transforms move continuously and the
 * video is asked for the next frame rather than a distant seek. This is the root fix; the
 * per-section springs only smooth what is already a step.
 *
 * `lerp` is the fraction of remaining distance covered each frame: lower glides longer.
 * 0.085 is a long, cinematic glide without feeling disconnected from the wheel.
 */
const LERP = 0.085;

export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    // Never hijack scrolling for someone who asked for reduced motion.
    if (reduced) return;

    const lenis = new Lenis({
      lerp: LERP,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Touch devices already scroll smoothly and momentum-scroll fights an rAF lerp.
      syncTouch: false,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // The hero resets scroll to the top when the film finishes. Lenis keeps its own internal
    // position, so a raw window.scrollTo would leave the two disagreeing and the next wheel
    // event would snap back. Route those resets through Lenis instead.
    const onReset = () => lenis.scrollTo(0, { immediate: true });
    window.addEventListener('magnolia:scroll-reset', onReset);

    return () => {
      window.removeEventListener('magnolia:scroll-reset', onReset);
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
