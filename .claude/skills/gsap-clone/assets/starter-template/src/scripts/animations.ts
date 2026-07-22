import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

/**
 * Auto-generated animations live here. Translate `animations.json` from
 * the extractor into gsap.to / gsap.from / ScrollTrigger.create calls.
 *
 * Rules:
 *  1. Keep eases verbatim from the bundle (`power3.out`, not `easeOut`).
 *  2. One initSection() per logical block — easy to comment out for diffing.
 *  3. Wrap in `gsap.context()` so this can be torn down on view-transitions.
 */

export function initAnimations(scope: HTMLElement | Document = document) {
  const ctx = gsap.context(() => {
    // ── Hero ─────────────────────────────────────────────────────
    const heroTitle = scope.querySelector<HTMLElement>('.hero-title');
    if (heroTitle) {
      const split = new SplitType(heroTitle, { types: 'chars' });
      gsap.from(split.chars, {
        y: 100,
        opacity: 0,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.02,
        delay: 0.2,
      });
    }

    // ── Scroll-reveal cards ──────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('.reveal-up').forEach(el => {
      gsap.from(el, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });

    // ── Parallax images ──────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('.parallax').forEach(el => {
      gsap.to(el, {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }, scope as Element);

  return () => ctx.revert();
}
