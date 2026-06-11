'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';

// Kunai Process section — split-screen alternating timeline.
//
// Layout per step: two 50/50 columns. Title + JP label on ONE side,
// body copy on the OTHER, alternating per step (zigzag). A VERTICAL
// LINE runs down the centre of the section, drawing scaleY 0 → 1 as
// the user scrolls — it's the timeline spine connecting all steps.
//
// At every breakpoint divisor between steps a small circle dot anchors
// the line visually (matches reference screenshot).

interface Step {
  no: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    no: '01',
    title: 'The Painting',
    body: 'Tom Thomson paints The Jack Pine at Algonquin Park, capturing a windswept tree above an Ontario lake (1916–17).',
  },
  {
    no: '02',
    title: 'Engraving Sketch',
    body: 'RCM master engravers translate the brushwork into millimetric relief — every needle, crag, and ripple plotted by hand.',
  },
  {
    no: '03',
    title: 'Die Cutting',
    body: "Reverse and obverse dies are CNC-cut to the engraver's spec, then hand-finished for proof-level polish and frost zones.",
  },
  {
    no: '04',
    title: 'The Strike',
    body: '1006.1 g of .99999 fine gold blanks are struck under specialised dies designed for kilo-scale coins. Multiple strikes ensure relief depth.',
  },
  {
    no: '05',
    title: 'Presentation',
    body: 'Each coin is encapsulated and presented in a Royal Canadian Mint–branded wooden case with black beauty box and serialised certificate.',
  },
];

export default function ProcessSection() {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = ref.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // Centre line scrub — draws scaleY 0 → 1 as the section moves
      // through viewport. End is tied to the LAST step (not the section's
      // padded bottom) so the line finishes drawing exactly when the last
      // step is in view — all content shown the moment the line completes.
      const line = root.querySelector<HTMLElement>('.process-line');
      const lastStep = root.querySelector<HTMLElement>(
        '.process-step:last-child'
      );
      if (line) {
        gsap.fromTo(
          line,
          { scaleY: 0, transformOrigin: 'top center' },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top 65%',
              endTrigger: lastStep ?? root,
              end: lastStep ? 'bottom center' : 'bottom 75%',
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      // Per-step fade-up on scroll into view
      const steps = root.querySelectorAll<HTMLElement>('.process-step');
      steps.forEach(step => {
        const title = step.querySelector<HTMLElement>('.step-title');
        const body = step.querySelector<HTMLElement>('.step-body');
        const dot = step.querySelector<HTMLElement>('.step-dot');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: step,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
        if (title) {
          tl.fromTo(
            title,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
            0
          );
        }
        if (body) {
          tl.fromTo(
            body,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
            0.15
          );
        }
        if (dot) {
          tl.fromTo(
            dot,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' },
            0.3
          );
        }
      });

      // Heading char-stagger (kept)
      const heading = root.querySelector<HTMLElement>('.process-heading');
      if (heading) {
        const chars = heading.textContent?.split('') ?? [];
        heading.innerHTML = chars
          .map(
            c => `<span class="inline-block">${c === ' ' ? '&nbsp;' : c}</span>`
          )
          .join('');
        const charEls = heading.querySelectorAll<HTMLElement>('span');
        gsap.set(charEls, { yPercent: 110, opacity: 0 });
        gsap.to(charEls, {
          yPercent: 0,
          opacity: 1,
          duration: 1.6,
          ease: 'power3.out',
          stagger: 0.06,
          scrollTrigger: {
            trigger: heading,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className='process relative w-full overflow-hidden bg-[#1a1410] py-24 text-neutral-100 md:py-40'
    >
      <div className='relative mx-auto max-w-[1400px] px-6 md:px-16'>
        {/* Heading */}
        <div className='mb-16 md:mb-24'>
          <span className='mb-4 block text-[11px] tracking-[0.32em] text-[#c79119] uppercase'>
            The Making
          </span>
          <h2
            className='process-heading overflow-hidden font-serif leading-[0.95] font-light tracking-tight text-neutral-50'
            style={{ fontSize: 'clamp(56px, 9vw, 128px)' }}
          >
            From Brush to Strike
          </h2>
        </div>

        {/* Timeline — desktop: split-screen alternating w/ centre line.
            Mobile: single-column left-aligned stack (no zigzag, no
            centre line — line moves to far left). */}
        <div className='relative'>
          {/* Vertical line — outer wrapper handles position (mobile far-
              left, desktop centre); inner element handles GSAP scaleY so
              the two transforms don't conflict. */}
          <div
            aria-hidden='true'
            className='pointer-events-none absolute top-0 bottom-0 left-2 w-px md:left-1/2 md:-translate-x-1/2'
          >
            <div
              className='process-line h-full w-full bg-[#c79119]/60'
              style={{ transform: 'scaleY(0)', transformOrigin: 'top center' }}
            />
          </div>

          <ol className='relative'>
            {STEPS.map((s, i) => {
              const isTitleLeft = i % 2 === 0;
              return (
                <li
                  key={s.title}
                  className='process-step relative grid grid-cols-1 gap-4 py-12 pl-8 first:pt-0 last:pb-0 md:grid-cols-2 md:gap-16 md:py-24 md:pl-0'
                >
                  {/* Dot — mobile on left line, desktop on centre line */}
                  <span
                    aria-hidden='true'
                    className='step-dot absolute bottom-0 left-2 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-[#c79119] md:left-1/2'
                  />

                  {/* Title — mobile always left, desktop alternates */}
                  <div
                    className={`flex flex-col justify-center ${
                      isTitleLeft
                        ? 'md:items-end md:pr-12 md:text-right'
                        : 'md:order-2 md:items-start md:pl-12 md:text-left'
                    }`}
                  >
                    <div className='step-title'>
                      <div className='mb-3 text-[11px] tracking-[0.32em] text-[#c79119] uppercase'>
                        Step {s.no}
                      </div>
                      <h3
                        className='font-serif leading-[1.05] font-bold tracking-tight text-neutral-50'
                        style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}
                      >
                        {s.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body — mobile always left, desktop alternates */}
                  <div
                    className={`flex flex-col justify-center ${
                      isTitleLeft
                        ? 'md:pl-12'
                        : 'md:order-1 md:items-end md:pr-12 md:text-right'
                    }`}
                  >
                    <p
                      className={`step-body max-w-md text-base leading-relaxed text-neutral-200 md:text-lg ${
                        !isTitleLeft ? 'md:ml-auto' : ''
                      }`}
                    >
                      {s.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
