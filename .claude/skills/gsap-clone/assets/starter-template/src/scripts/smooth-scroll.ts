import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize Lenis smooth scroll, sync it with GSAP's ticker, and forward
 * scroll events to ScrollTrigger so scrub-driven animations stay in lockstep
 * with the smoothed scroll position.
 *
 * Returns the Lenis instance so callers can `lenis.scrollTo(...)` for anchor
 * links, or `lenis.stop()` when modals open.
 */
export function initSmoothScroll() {
  if (
    typeof window === 'undefined' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return null;
  }

  const isMobile = matchMedia('(max-width: 768px)').matches;

  const lenis = new Lenis({
    duration: 1.2,
    lerp: 0.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: !isMobile,
    smoothTouch: false,
    wheelMultiplier: 1,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor links → smooth scroll with header offset
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      e.preventDefault();
      lenis.scrollTo(id, { offset: -80, duration: 1.4 });
    });
  });

  return lenis;
}
