'use client';

import { useEffect, useRef } from 'react';
import { gsap, MOTION_CONDITIONS, type MotionConditions } from '../lib/motion';

const QUOTE =
  '“Modern without being cold, rooted without being backward-looking, and entirely alive to the extraordinary setting it inhabits.”';

export default function QuoteSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef);

    mm.add(MOTION_CONDITIONS, context => {
      const { reduce } = context.conditions as MotionConditions;

      gsap.set(frameRef.current, { xPercent: 100, visibility: 'visible' });

      if (reduce) {
        gsap.set(frameRef.current, { xPercent: 0 });
        gsap.set(veilRef.current, { opacity: 0 });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=165%',
          scrub: 0.6,
          pin: true,
        },
      });

      // Ảnh kéo từ phải qua trái phủ dần màn hình; lớp mờ (màu nền) nhạt
      // dần để ảnh rõ lên khi đã phủ gần hết.
      tl.to(frameRef.current, { xPercent: 0, duration: 1.2 }).to(
        veilRef.current,
        { opacity: 0, duration: 0.6 },
        '-=0.5'
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className='relative h-svh overflow-hidden bg-[#e8e3d8]'
    >
      <div className='absolute inset-0 flex items-center justify-center px-[7%]'>
        <h2 className='max-w-[86vw] text-center font-(family-name:--font-display) text-2xl leading-snug text-neutral-900 md:max-w-[62vw] md:text-6xl'>
          {QUOTE}
        </h2>
      </div>
      <div ref={frameRef} className='invisible absolute inset-0'>
        <img
          src='/section-6.png'
          alt='A stone patio with charred-wood chairs, a round table and a built-in bench'
          className='h-full w-full object-cover'
        />
        {/* Lớp mờ màu nền phủ trên ảnh, nhạt dần khi scroll */}
        <div
          ref={veilRef}
          className='absolute inset-0 bg-[#e8e3d8] opacity-80'
        />
      </div>
      <span
        className='absolute top-1/2 right-6 z-10 hidden -translate-y-1/2 font-sans text-[11px] tracking-[0.2em] text-neutral-800 uppercase md:block'
        style={{ writingMode: 'vertical-rl' }}
      >
        <span className='mb-3 inline-block h-10 w-px bg-neutral-800' />
        04 - Interior Design
      </span>
    </section>
  );
}
