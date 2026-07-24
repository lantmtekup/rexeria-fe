'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import {
  gsap,
  ScrollTrigger,
  MOTION_CONDITIONS,
  type MotionConditions,
} from '../lib/motion';

const SHOWCASE = {
  title: 'PENTHOUSE B',
  description:
    'Perched atop The Westly, Penthouse B is a sky home above the Upper West Side, a 3,059 square foot residence offering the rarest combination in Manhattan new construction: genuine grandeur and genuine warmth. Four bedrooms, three and a half bathrooms, eleven-foot ceilings, and a private rooftop terrace that stretches over 1,000 square feet above the city.',
  images: {
    sketch: { src: '/s2-p1.png', alt: 'Penthouse B interior sketch' },
    overlay: { src: '/s2-p2.png', alt: '' },
    photo: { src: '/s2-p3.png', alt: 'Penthouse B living room' },
  },
  reveal: {
    show: 'SEE FULL\nPICTURE',
    hide: 'BACK TO\nSKETCH',
  },
} as const;

export default function ProductShowcase() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mm = gsap.matchMedia(section);

    mm.add(MOTION_CONDITIONS, ctx => {
      const { isDesktop, finePointer, reduce } =
        ctx.conditions as MotionConditions;

      const stack = section.querySelector<HTMLElement>('[data-layer="stack"]');
      const photo = section.querySelector<HTMLElement>('[data-layer="photo"]');
      const sketch = section.querySelector<HTMLElement>(
        '[data-layer="sketch"]'
      );
      const overlay = section.querySelector<HTMLElement>(
        '[data-layer="overlay"]'
      );
      const copy = section.querySelector<HTMLElement>('[data-layer="copy"]');
      const ui = section.querySelectorAll<HTMLElement>('[data-ui]');
      const reveal = section.querySelector<HTMLButtonElement>('[data-reveal]');
      const label = section.querySelector<HTMLElement>('[data-reveal-label]');
      if (!stack || !photo || !sketch || !overlay || !copy || !reveal || !label)
        return;

      gsap.set(photo, { autoAlpha: 0 });

      gsap
        .timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: section, start: 'top 75%', once: true },
        })
        .fromTo(
          stack,
          { autoAlpha: 0, y: reduce ? 0 : 32 },
          { autoAlpha: 1, y: 0, duration: reduce ? 0 : 1.1 }
        );

      if (reduce) {
        gsap.set(ui, { autoAlpha: 1, y: 0 });
      } else {
        const resetUi = () => {
          gsap.killTweensOf(ui);
          gsap.set(ui, { autoAlpha: 0, y: 24 });
        };
        const playUi = () => {
          gsap.killTweensOf(ui);
          gsap.fromTo(
            ui,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              stagger: 0.12,
              duration: 0.9,
              ease: 'power3.out',
              delay: 0.4,
              overwrite: true,
            }
          );
        };

        resetUi();
        ScrollTrigger.create({
          trigger: section,
          start: 'top 75%',
          onEnter: playUi,
          onEnterBack: playUi,
          onLeaveBack: resetUi,
        });
      }

      if (!reduce) {
        gsap.fromTo(
          overlay,
          { yPercent: isDesktop ? -14 : -8 },
          {
            yPercent: isDesktop ? 14 : 8,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );

        // Copy panel drifts opposite the overlay for depth.
        // Stay under bottom until section top hits viewport top, then push up.
        gsap.fromTo(
          copy,
          { yPercent: isDesktop ? 6 : 3 },
          {
            yPercent: isDesktop ? -42 : -22,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }

      let revealed = false;
      const onReveal = () => {
        revealed = !revealed;
        const duration = reduce ? 0 : 0.7;

        gsap.to(photo, {
          autoAlpha: revealed ? 1 : 0,
          duration,
          ease: 'power2.inOut',
        });
        gsap.to([sketch, overlay], {
          autoAlpha: revealed ? 0 : 1,
          scale: revealed ? 1.02 : 1,
          duration,
          ease: 'power2.inOut',
          stagger: 0.08,
        });
        label.textContent = revealed
          ? SHOWCASE.reveal.hide
          : SHOWCASE.reveal.show;
        reveal.setAttribute('aria-pressed', String(revealed));
      };

      reveal.addEventListener('click', onReveal);

      if (finePointer && !reduce) {
        const follow = { duration: 0.8, ease: 'power3.out' } as const;
        const overlayX = gsap.quickTo(overlay, 'x', follow);
        const overlayY = gsap.quickTo(overlay, 'y', follow);

        const onMove = (e: MouseEvent) => {
          const r = stack.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
          const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
          overlayX(nx * 14);
          overlayY(ny * 8);
        };
        const onLeave = () => {
          gsap.to(overlay, { x: 0, y: 0, duration: 1, ease: 'power3.out' });
        };

        stack.addEventListener('mousemove', onMove);
        stack.addEventListener('mouseleave', onLeave);
        return () => {
          reveal.removeEventListener('click', onReveal);
          stack.removeEventListener('mousemove', onMove);
          stack.removeEventListener('mouseleave', onLeave);
        };
      }

      return () => reveal.removeEventListener('click', onReveal);
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id='explore'
      className='relative flex min-h-svh w-full items-center justify-center overflow-x-hidden bg-[#F3F1EA] py-14 sm:py-16 lg:h-screen lg:overflow-hidden lg:py-0'
    >
      <div className='mx-auto flex w-full max-w-[1440px] flex-col items-stretch px-5 sm:px-8 lg:flex-row lg:items-center lg:px-10'>
        <div
          data-layer='stack'
          className='relative aspect-[816/536] w-full shrink-0 overflow-hidden lg:w-[58%]'
        >
          <div
            data-layer='photo'
            className='absolute inset-0 will-change-transform'
            aria-hidden
          >
            <Image
              src={SHOWCASE.images.photo.src}
              alt={SHOWCASE.images.photo.alt}
              fill
              sizes='(max-width: 1023px) 100vw, 58vw'
            />
          </div>

          <div
            data-layer='overlay'
            className='absolute inset-0 will-change-transform'
          >
            <Image
              src={SHOWCASE.images.overlay.src}
              alt={SHOWCASE.images.overlay.alt}
              fill
              sizes='(max-width: 1023px) 100vw, 58vw'
            />
          </div>

          <div
            data-layer='sketch'
            className='absolute inset-0 will-change-transform'
          >
            <Image
              src={SHOWCASE.images.sketch.src}
              alt={SHOWCASE.images.sketch.alt}
              fill
              priority
              sizes='(max-width: 1023px) 100vw, 58vw'
            />
          </div>

          <button
            data-reveal
            type='button'
            aria-pressed='false'
            aria-label='Toggle the full picture'
            className='group absolute top-0 left-0 z-10 h-[88px] w-[88px] cursor-pointer overflow-hidden sm:h-[100px] sm:w-[100px] lg:h-[120px] lg:w-[120px]'
          >
            <span
              aria-hidden
              className='absolute -top-[60%] -left-[60%] h-[120%] w-[120%] rotate-45 bg-[#6E7A6F] transition-colors group-hover:bg-[#5c6a5d]'
            />
            <span
              data-reveal-label
              className='absolute top-[28px] left-[28px] w-[80px] -translate-x-1/2 -translate-y-1/2 -rotate-45 text-center text-[10px] leading-none font-semibold tracking-[0.18em] whitespace-pre-line text-white uppercase sm:top-[32px] sm:left-[32px] sm:w-[88px] sm:text-[11px] lg:top-[38px] lg:left-[38px] lg:w-[100px] lg:text-[12px] lg:tracking-[0.2em]'
            >
              {SHOWCASE.reveal.show}
            </span>
          </button>
        </div>

        <article
          data-layer='copy'
          className='relative z-10 -mt-8 w-[min(100%,28rem)] self-center border border-[#6E7A6F33] bg-white px-6 py-8 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.22)] will-change-transform sm:-mt-10 sm:px-8 sm:py-10 lg:-bottom-24 lg:-left-10 lg:mt-0 lg:w-full lg:max-w-140 lg:self-auto lg:p-20'
        >
          <h2
            data-ui
            className='text-3xl font-medium text-[#6E7A6F] sm:text-4xl lg:text-5xl'
          >
            {SHOWCASE.title}
          </h2>
          <p
            data-ui
            className='mt-5 text-[15px] leading-relaxed text-[#6E7A6F] sm:mt-6 lg:mt-12.5 lg:text-base'
          >
            {SHOWCASE.description}
          </p>
        </article>
      </div>
    </section>
  );
}
