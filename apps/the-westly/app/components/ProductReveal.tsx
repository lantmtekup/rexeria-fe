'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import {
  gsap,
  ScrollTrigger,
  MOTION_CONDITIONS,
  type MotionConditions,
} from '../lib/motion';

const SHOWCASE = {
  eyebrow: 'ROOFTOP',
  title: 'A Private Rooftop Above the Upper West Side',
  description:
    'Designed for memorable gatherings and quiet mornings alike, this is the outdoor space the Upper West Side has never been able to offer, until now. It is not an amenity. It is an extension of the home.',
  images: {
    // Foreground terrace line-drawing (transparent sky) — sits on top.
    foreground: { src: '/s6-p1.png', alt: 'The Terrace interior sketch' },
    // Clouds strip — floats in the sky, offset ~30px from top-right.
    clouds: { src: '/s6-p2.png', alt: '' },
    // City skyline — back layer, visible through the transparent sky.
    skyline: { src: '/s6-p3.png', alt: '' },
    // Finished photo, revealed on toggle.
    photo: { src: '/s6-p4.png', alt: 'The Terrace at dusk' },
  },
} as const;

export default function ProductReveal() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mm = gsap.matchMedia(section);

    mm.add(MOTION_CONDITIONS, ctx => {
      const { isDesktop, isMobile, finePointer, reduce } =
        ctx.conditions as MotionConditions;

      const bg = section.querySelector<HTMLElement>('[data-layer="bg"]');
      const stack = section.querySelector<HTMLElement>('[data-layer="stack"]');
      const photo = section.querySelector<HTMLElement>('[data-layer="photo"]');
      const foreground = section.querySelector<HTMLElement>(
        '[data-layer="foreground"]'
      );
      const clouds = section.querySelector<HTMLElement>(
        '[data-layer="clouds"]'
      );
      const skyline = section.querySelector<HTMLElement>(
        '[data-layer="skyline"]'
      );
      const copy = section.querySelector<HTMLElement>('[data-layer="copy"]');
      const ui = section.querySelectorAll<HTMLElement>('[data-ui]');
      if (!stack || !photo || !foreground || !clouds || !skyline || !copy)
        return;

      gsap.set(photo, { autoAlpha: 0 });

      if (bg && !reduce) {
        // The sticky SceneReveal shows through this section until the
        // background is solid. Ships opaque in the markup (correct without JS)
        // and fades in only *after* that section's veil has finished, i.e. onto
        // an already-flat cream viewport — cream over cream is invisible, so
        // this never draws a hard edge across the scene.
        gsap.fromTo(
          bg,
          { opacity: 0 },
          {
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top 30%',
              end: 'top 16%',
              scrub: 0.4,
            },
          }
        );
      }

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
        // Clouds drift gently on scroll — small enough to stay ~30px from the edge.
        gsap.fromTo(
          clouds,
          { yPercent: isDesktop ? -6 : isMobile ? -5 : -4 },
          {
            yPercent: isDesktop ? 6 : isMobile ? 5 : 4,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );

        if (isMobile) {
          // Skyline moves opposite clouds for layered depth — mobile only.
          gsap.fromTo(
            skyline,
            { yPercent: 2 },
            {
              yPercent: -2,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            }
          );
        }

        // Copy panel drifts opposite for depth — matches ProductShowcase.
        gsap.fromTo(
          copy,
          { yPercent: isDesktop ? 6 : isMobile ? 4 : 3 },
          {
            yPercent: isDesktop ? -42 : isMobile ? -16 : -22,
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
      const onToggle = () => {
        revealed = !revealed;
        const duration = reduce ? 0 : 0.7;

        gsap.to(photo, {
          autoAlpha: revealed ? 1 : 0,
          duration,
          ease: 'power2.inOut',
        });
        gsap.to([foreground, clouds, skyline], {
          autoAlpha: revealed ? 0 : 1,
          scale: revealed ? 1.02 : 1,
          duration,
          ease: 'power2.inOut',
          stagger: 0.08,
        });
        stack.setAttribute('aria-pressed', String(revealed));
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        onToggle();
      };

      // The image stack is the toggle target — a click anywhere on it flips the reveal.
      stack.addEventListener('click', onToggle);
      stack.addEventListener('keydown', onKeyDown);

      if (finePointer && !reduce) {
        const follow = { duration: 0.8, ease: 'power3.out' } as const;
        // p1 foreground (near) + p2 clouds (far) — opposite axes for depth.
        const fgX = gsap.quickTo(foreground, 'x', follow);
        const fgY = gsap.quickTo(foreground, 'y', follow);
        const cloudsX = gsap.quickTo(clouds, 'x', follow);
        const cloudsY = gsap.quickTo(clouds, 'y', follow);

        const onMove = (e: MouseEvent) => {
          if (revealed) return;
          const r = stack.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
          const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
          fgX(-nx * 10);
          fgY(-ny * 6);
          cloudsX(nx * 18);
          cloudsY(ny * 10);
        };
        const onLeave = () => {
          if (revealed) return;
          gsap.to([foreground, clouds], {
            x: 0,
            y: 0,
            duration: 1,
            ease: 'power3.out',
          });
        };

        stack.addEventListener('mousemove', onMove);
        stack.addEventListener('mouseleave', onLeave);
        return () => {
          stack.removeEventListener('click', onToggle);
          stack.removeEventListener('keydown', onKeyDown);
          stack.removeEventListener('mousemove', onMove);
          stack.removeEventListener('mouseleave', onLeave);
        };
      }

      return () => {
        stack.removeEventListener('click', onToggle);
        stack.removeEventListener('keydown', onKeyDown);
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-blend-next
      className='relative z-10 flex min-h-svh w-full items-center justify-center overflow-x-hidden py-14 max-lg:min-h-0 max-lg:items-stretch max-lg:justify-start max-lg:py-12 max-lg:pb-16 sm:py-16 sm:max-lg:py-16 sm:max-lg:pb-20 lg:h-screen lg:overflow-hidden lg:py-0'
    >
      {/* Background as its own layer so it can fade in over the sticky scene. */}
      <div
        data-layer='bg'
        aria-hidden
        className='absolute inset-0 -z-10 bg-[#F3F1EA]'
      />

      <div className='mx-auto flex w-full max-w-[1440px] flex-col items-stretch px-5 max-lg:px-4 sm:px-8 lg:flex-row lg:items-center lg:px-10'>
        <div
          data-layer='stack'
          data-cursor-id='reveal-stack'
          role='button'
          tabIndex={0}
          aria-pressed='false'
          aria-label='Toggle the finished view'
          className='relative aspect-[816/552] w-full shrink-0 cursor-pointer overflow-hidden max-lg:mx-auto max-lg:max-w-[min(100%,34rem)] sm:max-lg:max-w-[min(100%,40rem)] md:max-lg:max-w-none lg:w-[58%]'
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
              className='object-cover'
            />
          </div>

          <div
            data-layer='skyline'
            className='absolute inset-0 will-change-transform'
          >
            <Image
              src={SHOWCASE.images.skyline.src}
              alt={SHOWCASE.images.skyline.alt}
              fill
              sizes='(max-width: 1023px) 100vw, 58vw'
              className='object-cover'
            />
          </div>

          <div
            data-layer='clouds'
            className='absolute top-[3.7%] right-[3.7%] aspect-[738/171] w-[88%] will-change-transform max-lg:top-[2.5%] max-lg:right-[2.5%] max-lg:w-[90%]'
          >
            <Image
              src={SHOWCASE.images.clouds.src}
              alt={SHOWCASE.images.clouds.alt}
              fill
              sizes='(max-width: 1023px) 88vw, 51vw'
              className='object-contain'
            />
          </div>

          <div
            data-layer='foreground'
            className='absolute inset-0 will-change-transform'
          >
            <Image
              src={SHOWCASE.images.foreground.src}
              alt={SHOWCASE.images.foreground.alt}
              fill
              sizes='(max-width: 1023px) 100vw, 58vw'
              className='object-cover'
            />
          </div>
        </div>

        <article
          data-layer='copy'
          className='relative z-10 -mt-8 w-[min(100%,28rem)] self-center border border-[#6E7A6F33] bg-white px-6 py-8 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.22)] will-change-transform max-lg:mx-auto max-lg:-mt-5 max-lg:w-[min(calc(100%-0.5rem),26rem)] max-lg:px-5 max-lg:py-7 sm:-mt-10 sm:px-8 sm:py-10 sm:max-lg:-mt-7 sm:max-lg:w-[min(100%,28rem)] md:max-lg:-mt-9 lg:-bottom-24 lg:-left-10 lg:mt-0 lg:w-full lg:max-w-140 lg:self-auto lg:p-20'
        >
          <p
            data-ui
            className='font-ui text-xs leading-none font-medium tracking-[0.2em] text-[#6E7A6F] uppercase'
          >
            {SHOWCASE.eyebrow}
          </p>
          <h2
            data-ui
            className='mt-3 text-3xl font-medium text-[#6E7A6F] max-sm:mt-2.5 max-sm:text-[1.75rem] max-sm:leading-tight sm:text-4xl lg:mt-5 lg:text-5xl'
          >
            {SHOWCASE.title}
          </h2>
          <p
            data-ui
            className='font-ui mt-5 text-[15px] leading-relaxed text-[#6E7A6F] max-sm:mt-4 max-sm:text-[14px] sm:mt-6 lg:mt-8 lg:text-base'
          >
            {SHOWCASE.description}
          </p>
        </article>
      </div>
    </section>
  );
}
