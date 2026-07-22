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

      // Ảnh fade in; dải màu wipe width — chữ nằm trong dải, đứng yên bị cắt.
      gsap.set(frameRef.current, { opacity: 0 });
      gsap.set(veilRef.current, { width: '100%' });

      if (reduce) {
        gsap.set(frameRef.current, { opacity: 1 });
        gsap.set(veilRef.current, { width: '0%' });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=90%',
          scrub: 0.45,
          pin: true,
        },
      });

      tl.to(veilRef.current, { width: '0%', duration: 1 }, 0).to(
        frameRef.current,
        { opacity: 1, duration: 1 },
        0
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-section='interior-design'
      className='relative h-svh overflow-hidden bg-[#e8e3d8]'
    >
      <div ref={frameRef} className='absolute inset-0 opacity-0'>
        <img
          src='/section-6.png'
          alt='A stone patio with charred-wood chairs, a round table and a built-in bench'
          className='h-full w-full object-cover'
        />
      </div>

      {/* Dải màu wipe — chữ w-screen đứng yên, overflow cắt theo mép phải */}
      <div
        ref={veilRef}
        className='absolute inset-y-0 left-0 z-10 w-full overflow-hidden bg-[#e8e3d8]'
      >
        <div className='flex h-full w-screen items-center justify-center px-[7%]'>
          <h2 className='max-w-[86vw] text-center font-(family-name:--font-display) text-2xl leading-snug text-neutral-900 md:max-w-[62vw] md:text-6xl'>
            {QUOTE}
          </h2>
        </div>
      </div>
    </section>
  );
}
