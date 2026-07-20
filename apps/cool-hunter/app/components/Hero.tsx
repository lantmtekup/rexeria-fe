'use client';

import { useEffect, useRef } from 'react';
import { gsap, MOTION_CONDITIONS, type MotionConditions } from '../lib/motion';
import Header from './Header';

/** Mobile: khung cao hơn để mép dưới ảnh sát title / đáy viewport. */
const FRAME_START_MOBILE = { width: '92%', height: '78%' };
const FRAME_START_DESKTOP = { width: '78%', height: '75%' };
const FRAME_END = { width: '100%', height: '100%' };

const TITLE_CLASS =
  'absolute bottom-[4%] left-[6%] font-(family-name:--font-display) text-[1.65rem] font-medium leading-[1.1] sm:text-[1.85rem] md:bottom-[5%] md:left-[7%] md:text-5xl lg:bottom-[6%] lg:text-6xl';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef);

    mm.add(MOTION_CONDITIONS, context => {
      const { isMobile, reduce } = context.conditions as MotionConditions;
      const start = isMobile ? FRAME_START_MOBILE : FRAME_START_DESKTOP;

      gsap.set(frameRef.current, start);

      if (reduce) {
        gsap.set(frameRef.current, FRAME_END);
        return;
      }

      gsap.to(frameRef.current, {
        ...FRAME_END,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: isMobile ? '+=55%' : '+=70%',
          scrub: 0.6,
          pin: true,
        },
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className='relative h-svh overflow-hidden bg-white'
    >
      {/* Header trong vùng pin → không bị jump khi ScrollTrigger pin */}
      <div className='pointer-events-none absolute inset-x-0 top-0 z-20'>
        <div className='pointer-events-auto'>
          <Header />
        </div>
      </div>

      {/* Bản đen: hiện ở phần nền trắng ảnh chưa phủ tới */}
      <h1 className={`${TITLE_CLASS} text-black`}>
        A House Built
        <br />
        Like a Camera
      </h1>
      <div
        ref={frameRef}
        className='absolute top-0 left-0 z-10 h-[78%] w-[92%] overflow-hidden md:h-[75%] md:w-[78%]'
      >
        <img
          src='/hero.png'
          alt='A house on a lakeshore surrounded by trees'
          className='h-full w-full object-cover'
        />
        {/* Stage cùng kích thước section để bản trắng trùng khít vị trí bản
            đen; khung overflow-hidden clip nó theo mép ảnh → màu chữ chuyển
            per-pixel đúng chỗ ảnh phủ qua, không bị nhoè đen trên ảnh. */}
        <div aria-hidden className='absolute top-0 left-0 h-svh w-screen'>
          <h1 className={`${TITLE_CLASS} text-white`}>
            A House Built
            <br />
            Like a Camera
          </h1>
        </div>
      </div>
    </section>
  );
}
