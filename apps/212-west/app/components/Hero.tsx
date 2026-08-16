'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import Header from '@/app/components/Header';
import {
  gsap,
  MOTION_CONDITIONS,
  type MotionConditions,
} from '@/app/lib/motion';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const image = section.querySelector<HTMLElement>('[data-hero-image]');
    const nav = section.querySelector<HTMLElement>('[data-hero-nav]');
    const title = section.querySelector<HTMLElement>('[data-hero-title]');
    if (!image || !nav || !title) return;

    gsap.set(image, { scale: 1.2 });
    gsap.set(nav, { y: 0, yPercent: -100, autoAlpha: 0 });
    gsap.set(title, { y: 0, yPercent: 100, autoAlpha: 0 });

    const mm = gsap.matchMedia(section);

    mm.add(MOTION_CONDITIONS, ctx => {
      const { reduce } = ctx.conditions as MotionConditions;

      const tl = gsap.timeline({
        defaults: {
          ease: 'power3.out',
          duration: reduce ? 0 : 1.4,
        },
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          once: true,
        },
      });

      tl.to(image, { scale: 1 }, 0)
        .to(nav, { yPercent: 0, autoAlpha: 1 }, 0)
        .to(title, { yPercent: 0, autoAlpha: 1 }, 0);
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id='hero'
      className='relative h-[80svh] max-h-170 min-h-110 w-full overflow-hidden bg-[#0F0F0E] md:h-[90svh] md:max-h-220 lg:h-svh lg:max-h-none'
    >
      <Header />

      <div
        data-hero-image
        className='absolute inset-0 will-change-transform'
        style={{ transform: 'scale(1.2)' }}
      >
        <Image
          src='/assets/background-hero.jpg'
          alt=''
          fill
          priority
          sizes='100vw'
          className='object-cover'
        />
      </div>

      <div className='absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/35 to-transparent' />

      <div className='absolute inset-x-0 bottom-1'>
        <div className='mx-auto w-full max-w-360 px-5 pb-2 lg:px-10 lg:pb-4'>
          <div>
            <h1
              data-hero-title
              className='font-display text-center text-[15vw] leading-[1.12] font-medium tracking-[-0.02em] text-[#ffffff] will-change-transform md:text-[11vw] xl:text-[min(11vw,158px)]'
              style={{ transform: 'translateY(100%)', opacity: 0 }}
            >
              Light-Filled Interiors
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
