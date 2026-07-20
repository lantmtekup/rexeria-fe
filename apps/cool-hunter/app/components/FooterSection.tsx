'use client';

import { useEffect, useRef } from 'react';
import { gsap, MOTION_CONDITIONS, type MotionConditions } from '../lib/motion';

export default function FooterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef);

    mm.add(MOTION_CONDITIONS, context => {
      const { reduce } = context.conditions as MotionConditions;

      gsap.set(layerRef.current, { yPercent: 100, visibility: 'visible' });

      if (reduce) {
        gsap.set(layerRef.current, { yPercent: 0 });
        return;
      }

      // Không pin — ảnh nền dâng từ dưới lên theo đà scroll tới cuối trang
      gsap.to(layerRef.current, {
        yPercent: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          end: 'bottom bottom',
          scrub: 0.6,
        },
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className='relative overflow-hidden bg-white'>
      {/* Ảnh nền dâng dần từ dưới lên khi scroll */}
      <div ref={layerRef} className='invisible absolute inset-0'>
        <img
          src='/footer-bg.png'
          alt=''
          aria-hidden
          className='h-full w-full object-cover'
        />
      </div>
      <div className='relative z-10 flex flex-col items-center gap-5 px-6 py-10 md:gap-6 md:py-12'>
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
          className='border border-neutral-900 px-10 py-3 font-sans text-xs tracking-[0.2em] text-neutral-900 uppercase transition-colors hover:bg-neutral-900 hover:text-white md:px-14 md:text-sm'
        >
          Sign Up
        </button>
      </div>
    </section>
  );
}
