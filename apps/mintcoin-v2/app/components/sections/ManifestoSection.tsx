'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';

// Manifesto block — cloned from kunai.framer.website (red "shokunin
// spirit" statement), adapted to the Jack Pine coin.
//
// Two-phase scroll choreography (faithful to source):
//   PHASE 1 (on enter): red panel, serif copy reveals word-by-word from
//   a line mask; 4 vertical white guide stripes draw down.
//   PHASE 2 (scroll-pinned scrub): the 4 stripes "open" — gray panels
//   expand right→left from each stripe until the screen is fully gray,
//   split into 4 columns by thin red seams. (Original: red → gray wipe.)
//
// Pinning uses CSS position:sticky (NOT GSAP pin) so transforms don't
// fight the iOS compositor. Respects prefers-reduced-motion.

const MANIFESTO =
  'Forged in 99.99% pure Canadian gold — mastery in every detail, artistry in every strike. We refine, we honour, we endure.';

const PANELS = [0, 1, 2, 3]; // 4 quarter columns
// Initial cluster offsets (vw) — stripes start bunched on the right, then
// "run" left to their quarter positions (natural left = (i+1)*25%).
const CLUSTER_X = [63, 41, 19, -3];

export default function ManifestoSection() {
  const ref = useRef<HTMLElement>(null);
  const splitRef = useRef<SplitType | null>(null);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = ref.current;
    if (!root) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const ctx = gsap.context(() => {
      const copy = root.querySelector<HTMLElement>('.manifesto-copy');
      const lines = gsap.utils.toArray<HTMLElement>('.guide-line');
      const panels = gsap.utils.toArray<HTMLElement>('.reveal-panel');

      // Split copy into lines (mask) + words.
      let words: HTMLElement[] = [];
      if (copy) {
        splitRef.current = new SplitType(copy, { types: 'lines,words' });
        (splitRef.current.lines ?? []).forEach(l => {
          l.style.overflow = 'hidden';
        });
        words = splitRef.current.words ?? [];
      }

      if (reduce) {
        // Static end: gray cover + copy visible (no motion).
        gsap.set(words, { opacity: 1 });
        gsap.set(panels, { scaleX: 1 });
        gsap.set(lines, { opacity: 0, x: 0 });
        return;
      }

      // ── PHASE 1 — entrance (plays once when block scrolls in) ──────────
      // Stripes start CLUSTERED on the right (x offset) and draw down.
      gsap.set(lines, {
        x: (i: number) => `${CLUSTER_X[i]}vw`,
        scaleY: 0,
        transformOrigin: 'top center',
      });
      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 60%',
          toggleActions: 'play none none reverse',
        },
      });
      intro.to(
        lines,
        { scaleY: 1, duration: 1.2, ease: 'expo.out', stagger: 0.12 },
        0
      );
      if (words.length) {
        gsap.set(words, { yPercent: 110, opacity: 0 });
        intro.to(
          words,
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.0,
            ease: 'power4.out',
            stagger: 0.04,
          },
          0.2
        );
      }

      // ── PHASE 2 — scroll-pinned scrub ─────────────────────────────────
      //   A) stripes "run" left from the right cluster to their quarter
      //      positions (x → 0).
      //   B) THEN gray panels expand right→left into a solid gray cover;
      //      copy + stripes fade.
      gsap.set(panels, { scaleX: 0, transformOrigin: 'right center' });
      const wipe = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });
      wipe
        // A) spread (first ~45% of the scrub)
        .to(
          lines,
          {
            x: 0,
            ease: 'power2.inOut',
            duration: 0.45,
            stagger: { each: 0.05, from: 'end' },
          },
          0
        )
        // B) gray opens, emanating from the right (rightmost panel first)
        .to(
          panels,
          {
            scaleX: 1,
            ease: 'power2.inOut',
            duration: 0.55,
            stagger: { each: 0.08, from: 'end' },
          },
          0.45
        )
        .to(lines, { opacity: 0, duration: 0.2 }, 0.5)
        .to(copy, { opacity: 0, duration: 0.3 }, 0.5);
    }, root);

    return () => {
      ctx.revert();
      splitRef.current?.revert();
      splitRef.current = null;
    };
  }, []);

  return (
    // Tall section gives scroll room; inner stage is sticky-pinned.
    <section
      ref={ref}
      className='manifesto relative z-10 h-[230vh] w-full bg-[#c79119]'
    >
      <div className='sticky top-0 h-screen w-full overflow-hidden text-[#dadada]'>
        {/* Manifesto copy — bottom-left (z-10, covered by panels on scroll) */}
        <div className='absolute bottom-0 left-0 z-10 max-w-[820px] px-6 pb-12 md:px-12 md:pb-16'>
          <p
            className='manifesto-copy leading-[1.45] font-light tracking-[0.01em]'
            style={{
              // recon: desktop 34px → mobile 16px (Yuji Syuku, #dadada)
              fontFamily: "'Yuji Syuku', serif",
              fontSize: 'clamp(16px, 2.4vw, 34px)',
            }}
          >
            {MANIFESTO}
          </p>
        </div>

        {/* Gray reveal panels — 4 quarter columns, expand on scroll into a
            SOLID gray cover (no seams). +1px width overlap avoids sub-pixel
            gaps so the end state is fully gray. */}
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 z-20'
        >
          {PANELS.map(i => (
            <div
              key={i}
              className='reveal-panel absolute top-0 bottom-0 bg-[#dadada] will-change-transform'
              style={{
                left: `${i * 25}%`,
                width: 'calc(25% + 1px)',
              }}
            />
          ))}
        </div>

        {/* Vertical guide stripes — anchored at quarter positions; start
            offset (clustered right via GSAP x), then "run" to position. */}
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 z-30'
        >
          {PANELS.map(i => (
            <span
              key={i}
              className='guide-line absolute top-0 bottom-0 w-px bg-[#f9f9f8]/60 will-change-transform'
              style={{ left: `calc(${(i + 1) * 25}% - 1px)` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
