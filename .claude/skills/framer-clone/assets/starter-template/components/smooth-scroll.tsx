'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Lenis smooth-scroll provider. Mount once inside <body>. Closest match to
 * the "Framer default" feel is `lerp: 0.1`; lower = snappier.
 */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      lerp: 0.1,
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
