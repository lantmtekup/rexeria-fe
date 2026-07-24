'use client';

import { useEffect, useRef } from 'react';
import {
  gsap,
  ScrollTrigger,
  MOTION_CONDITIONS,
  type MotionConditions,
} from '@/app/lib/motion';

export default function BrewingProcess() {
  const rootRef = useRef<HTMLElement>(null);
  const cupWrapRef = useRef<HTMLDivElement>(null);
  const cupInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add(MOTION_CONDITIONS, ctx => {
      const { reduce, isMobile } = ctx.conditions as MotionConditions;
      const leftCol = root.querySelector<HTMLElement>('[data-reveal-left]');
      const rightCol = root.querySelector<HTMLElement>('[data-reveal-right]');
      const leftParts = gsap.utils.toArray<HTMLElement>(
        '[data-reveal-left-part]',
        root
      );

      if (!leftCol || !rightCol) return;

      if (reduce) {
        gsap.set([leftCol, rightCol, ...leftParts], {
          autoAlpha: 1,
          x: 0,
          y: 0,
        });
        return;
      }

      const tl = gsap.timeline({
        paused: true,
        scrollTrigger: {
          trigger: root,
          start: 'top 72%',
          end: 'bottom 28%',
          toggleActions: 'restart reverse restart reverse',
        },
      });

      tl.from(leftCol, {
        x: isMobile ? 0 : -56,
        duration: 0.9,
        ease: 'power3.out',
      })
        .from(
          leftParts,
          {
            autoAlpha: 0,
            y: 28,
            duration: 0.65,
            stagger: 0.1,
            ease: 'power2.out',
          },
          0.12
        )
        .from(
          rightCol,
          {
            autoAlpha: 0,
            x: isMobile ? 0 : 56,
            y: 32,
            duration: 0.9,
            ease: 'power3.out',
          },
          0.2
        );
    });

    return () => mm.revert();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const cupWrap = cupWrapRef.current;
    const cupInner = cupInnerRef.current;
    if (!root || !cupWrap || !cupInner) return;

    // Hai giai đoạn, dựa trên vị trí thật của section trong viewport (r.top):
    //  1) Reveal (r.top > 0): ly đứng yên canh giữa, MASK theo mép trên section đen
    //     đang trồi lên → phần ly nằm trên section beige bị cắt.
    //  2) Khi đã lộ đủ (r.top <= 0, section lấp đầy viewport): bỏ mask, cho ly CUỘN
    //     LÊN theo section (translateY = r.top) — trôi ra cùng section.
    const HIDDEN = 'inset(100% 0px 0px 0px)';
    cupWrap.style.clipPath = HIDDEN;

    const update = () => {
      const r = root.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.top > 0) {
        cupInner.style.transform = 'translateY(0px)';
        cupWrap.style.clipPath = `inset(${Math.min(vh, r.top)}px 0px 0px 0px)`;
      } else {
        cupInner.style.transform = `translateY(${r.top}px)`;
        cupWrap.style.clipPath = 'inset(0px 0px 0px 0px)';
      }
    };

    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top bottom',
      end: 'bottom top',
      invalidateOnRefresh: true,
      onEnter: update,
      onEnterBack: update,
      onUpdate: update,
      onRefresh: update,
      onLeave: () => {
        cupWrap.style.clipPath = HIDDEN;
      },
      onLeaveBack: () => {
        cupWrap.style.clipPath = HIDDEN;
      },
    });

    update();

    return () => st.kill();
  }, []);

  return (
    <>
      <section
        id='brewing-process'
        ref={rootRef}
        className='relative z-40 h-screen w-full overflow-x-hidden bg-[#0a0705]'
      >
        {/* Video nền */}
        <video
          className='absolute inset-0 h-full w-full object-cover'
          src='/assets/videos/cup.mp4'
          autoPlay
          muted
          loop
          playsInline
          preload='auto'
        />
        {/* Scrim nhẹ cho legibility */}
        <div className='absolute inset-0 bg-black/40' />

        {/* Text — mobile: đẩy title lên / body xuống để nhường giữa cho cup overlay */}
        <div className='relative z-10 flex h-full min-w-0 flex-col justify-between px-6 pt-20 pb-10 md:px-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-8 lg:px-20 lg:py-0'>
          <div data-reveal-left className='max-w-xl min-w-0 shrink-0'>
            <p
              data-reveal-left-part
              className='text-sm font-medium tracking-[0.12em] text-[#EDE6D6]'
              style={{ fontFamily: 'var(--font-inter), sans-serif' }}
            >
              BREWING PROCESS
            </p>
            <h2
              data-reveal-left-part
              className='mt-4 text-4xl leading-[0.95] text-[#EDE6D6] sm:text-5xl md:mt-6 md:text-6xl lg:text-7xl'
              style={{ fontFamily: 'var(--font-bebas), sans-serif' }}
            >
              THE ART OF BELGIAN BREWING – A LEGACY IN EVERY DROP
            </h2>
          </div>

          <p
            data-reveal-right
            className='max-w-sm min-w-0 shrink-0 text-base leading-relaxed font-semibold text-[#EDE6D6]/90 lg:mt-[200px] lg:justify-self-end'
            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
          >
            From carefully selected malt to the final pour, every step in our
            brewing process is crafted for perfection. Milled grains, precise
            mashing, controlled fermentation, and expert conditioning ensure a
            smooth, flavorful beer. Whether bottled or on tap, each sip embodies
            true Belgian craftsmanship.
          </p>
        </div>
      </section>

      {/* Cup overlay — fixed, đứng yên; bị clip theo vùng section đen (reveal/mask) */}
      <div
        ref={cupWrapRef}
        aria-hidden='true'
        className='pointer-events-none fixed inset-0 z-45'
        // Ẩn ngay từ lần paint đầu (trước khi JS chạy) để không flash cái ly khi reload.
        style={{ clipPath: 'inset(100% 0px 0px 0px)' }}
      >
        <div
          ref={cupInnerRef}
          className='absolute inset-0 flex items-center justify-center will-change-transform'
        >
          <img
            src='/assets/section-3/cup.png'
            alt=''
            className='w-[min(52vw,220px)] object-contain md:w-[min(60vw,280px)]'
            decoding='async'
          />
        </div>
      </div>
    </>
  );
}
