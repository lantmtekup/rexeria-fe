'use client';

import { useEffect, useRef } from 'react';
import { gsap, MOTION_CONDITIONS, type MotionConditions } from '../lib/motion';

export default function FooterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef);

    mm.add(MOTION_CONDITIONS, context => {
      const { reduce } = context.conditions as MotionConditions;

      // Ảnh fade in; dải trắng wipe height từ dưới lên — không pin, giữ size content.
      gsap.set(frameRef.current, { opacity: 0 });
      gsap.set(veilRef.current, { height: '100%' });

      if (reduce) {
        gsap.set(frameRef.current, { opacity: 1 });
        gsap.set(veilRef.current, { height: '0%' });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          end: 'bottom bottom',
          scrub: 0.45,
        },
      });

      tl.to(veilRef.current, { height: '0%', duration: 1 }, 0).to(
        frameRef.current,
        { opacity: 1, duration: 1 },
        0
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className='relative overflow-hidden bg-white'>
      <div ref={frameRef} className='absolute inset-0 opacity-0'>
        <img
          src='/footer-bg.png'
          alt=''
          aria-hidden
          className='h-full w-full object-cover'
        />
      </div>

      {/* Dải trắng wipe — neo top, height 100%→0% → lộ ảnh từ dưới lên */}
      <div
        ref={veilRef}
        className='absolute inset-x-0 top-0 z-10 h-full bg-white'
      />

      <div className='relative z-20 flex flex-col items-center gap-5 px-6 py-10 md:gap-6 md:py-12'>
        <img
          src='/icon-footer.svg'
          alt=''
          aria-hidden
          className='w-[52vw] md:w-[20vw] md:min-w-52'
        />
        <h2 className='max-w-[46ch] text-center font-(family-name:--font-display) text-xl leading-snug text-neutral-900 md:text-3xl'>
          Sign Up For Notifications To See More
          <br />
          Of Our Interesting Stories.
        </h2>
        <button
          type='button'
          className='cursor-pointer border border-neutral-900 px-10 py-3 font-sans text-xs tracking-[0.2em] text-neutral-900 uppercase transition-colors duration-500 hover:bg-neutral-900 hover:text-white md:px-14 md:text-sm'
        >
          Sign Up
        </button>
      </div>
    </section>
  );
}
