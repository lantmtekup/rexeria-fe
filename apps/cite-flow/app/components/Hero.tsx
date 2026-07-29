'use client';

import { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from '../lib/motion';
import Header from './Header';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headerWrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(imageRef.current, { scale: 1.15 });
      gsap.set(headingRef.current, { opacity: 0 });

      gsap
        .timeline()
        .to(imageRef.current, { scale: 1, duration: 1.4, ease: 'power3.out' })
        .to(
          headingRef.current,
          {
            opacity: 1,
            duration: 1.4,
            ease: 'sine.out',
          },
          0.45
        );
    }, sectionRef);

    const mm = gsap.matchMedia();
    mm.add('(min-width: 1279px)', () => {
      const scrollTrigger = {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      };

      gsap.to(sectionRef.current, {
        y: window.innerHeight * 0.5,
        ease: 'none',
        scrollTrigger,
      });

      gsap.to(headerWrapRef.current, {
        y: -window.innerHeight * 0.5,
        ease: 'none',
        scrollTrigger,
      });
    });

    return () => {
      ctx.revert();
      mm.revert();
    };
  }, []);

  return (
    <div className='relative'>
      <section
        ref={sectionRef}
        className='relative h-screen w-full overflow-hidden'
      >
        <div className='absolute inset-0'>
          <Image
            ref={imageRef}
            src='/assets/hero-bg.webp'
            alt='Cite Flow development aerial view'
            fill
            priority
            className='object-cover'
          />
        </div>

        <div className='relative flex h-full flex-col items-center justify-center px-5 xl:items-start xl:justify-end xl:pt-15 xl:pb-12.5'>
          <h1
            ref={headingRef}
            className='relative w-full text-center text-[40px] leading-[1.1] text-white lg:text-[85px] xl:left-10.75 xl:w-204.75 xl:max-w-225'
          >
            Live with Nature
            <br />
            Bathe in Serenity
          </h1>
        </div>
      </section>

      <div
        ref={headerWrapRef}
        className='fixed inset-x-0 top-0 z-10 lg:absolute'
      >
        <Header />
      </div>
    </div>
  );
}
