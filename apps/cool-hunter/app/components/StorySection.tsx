'use client';

import { useEffect, useRef } from 'react';
import { gsap, MOTION_CONDITIONS, type MotionConditions } from '../lib/motion';

const TEXT_1 =
  "There's a house on a peninsula in rural Alabama that watches the water from three sides. Its architect, Jeffrey Dungan, says he thought of it as a camera, a device for framing and cropping the world outside. Inside, designer Betsy Brown stripped everything back until only the essential remained. What they produced together is something rare: a family home that feels both deeply rooted in place and entirely its own.";

const TEXT_2 =
  "Lake Wehapa isn't a name you'll find on many design world itineraries. That's part of the point. Dungan's Birmingham-based practice has long been drawn to the particular poetry of the American South, its craft traditions, its materials, its slow pace, and this project, a retreat conceived around the rhythms of rest, connection, and multi-generational gathering, distils that sensibility down to something almost elemental.";

export default function StorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const p1Ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const p2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef);

    mm.add(MOTION_CONDITIONS, context => {
      const { isMobile, reduce } = context.conditions as MotionConditions;
      const p1 = p1Ref.current;
      const frame = frameRef.current;
      const p2 = p2Ref.current;

      if (isMobile) {
        // Mobile: cùng 4 beat nhưng chạy theo trục dọc (portrait không đủ
        // bề ngang cho hai cột text/ảnh cạnh nhau).
        gsap.set(frame, { top: '52%', height: '40%', yPercent: 0 });

        if (reduce) {
          gsap.set(p1, { autoAlpha: 0 });
          gsap.set(frame, { top: '12%', height: '42%' });
          gsap.set(p2, { autoAlpha: 1 });
          return;
        }

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=300%',
            scrub: 0.6,
            pin: true,
          },
        });

        tl.from(p1, { y: '80vh', duration: 1 })
          // B: text đẩy lên trên, ảnh vào từ dưới
          .to(p1, { y: '-30vh', duration: 1 }, '+=0.4')
          .from(frame, { yPercent: 120, duration: 1 }, '<')
          // C: text 1 thoát, ảnh nở cao
          .to(p1, { autoAlpha: 0, duration: 0.5 }, '+=0.4')
          .to(frame, { top: '12%', height: '74%', duration: 1 }, '<')
          // D: ảnh co lại phía trên, text 2 hiện bên dưới
          .to(frame, { height: '42%', duration: 1 }, '+=0.4')
          .fromTo(
            p2,
            { autoAlpha: 0, y: 40 },
            { autoAlpha: 1, y: 0, duration: 0.8 },
            '<0.3'
          );
        return;
      }

      // Desktop: trục ngang
      gsap.set(frame, {
        left: '105%',
        top: '21%',
        width: '47%',
        height: '58%',
      });

      if (reduce) {
        gsap.set(p1, { autoAlpha: 0 });
        gsap.set(frame, { left: '9%', width: '50%' });
        gsap.set(p2, { autoAlpha: 1 });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=260%',
          scrub: 0.6,
          pin: true,
        },
      });

      // A: text 1 trồi từ dưới lên
      tl.from(p1, { y: '90vh', duration: 1 })
        // B: text trượt sang trái, ảnh kéo vào từ phải
        .to(p1, { x: '-47vw', duration: 1 }, '+=0.4')
        .to(frame, { left: '48%', duration: 1 }, '<')
        // C: text 1 thoát, ảnh nở gần full ngang
        .to(p1, { autoAlpha: 0, duration: 0.5 }, '+=0.4')
        .to(frame, { left: '9%', width: '83%', duration: 1 }, '<')
        // D: ảnh co về cột trái, text 2 hiện ra
        .to(frame, { width: '50%', duration: 1 }, '+=0.4')
        .fromTo(
          p2,
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          '<0.3'
        );
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className='relative h-svh overflow-hidden bg-white'
    >
      <div
        ref={p1Ref}
        className='absolute top-[10%] left-[7%] w-[86%] font-(family-name:--font-display) text-lg leading-relaxed text-neutral-900 md:top-[22%] md:left-[51%] md:w-[32%] md:text-2xl'
      >
        {TEXT_1}
      </div>
      <div
        ref={frameRef}
        className='absolute left-[7%] w-[86%] overflow-hidden md:left-auto md:w-auto'
      >
        <img
          src='/section-2.png'
          alt='A calm living room with a fireplace, oak cabinetry and leaded windows'
          className='h-full w-full object-cover'
        />
      </div>
      <div
        ref={p2Ref}
        className='absolute top-[58%] left-[7%] w-[86%] font-(family-name:--font-display) text-base leading-relaxed text-neutral-900 opacity-0 md:top-[30%] md:left-[66%] md:w-[26%] md:text-xl'
      >
        {TEXT_2}
      </div>
      <span
        className='absolute top-1/2 right-6 hidden -translate-y-1/2 font-sans text-[11px] tracking-[0.2em] text-neutral-800 uppercase md:block'
        style={{ writingMode: 'vertical-rl' }}
      >
        01 - Welcome
      </span>
    </section>
  );
}
