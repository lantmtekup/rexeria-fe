'use client';

import { useEffect, useRef } from 'react';
import { gsap, MOTION_CONDITIONS, type MotionConditions } from '../lib/motion';

const TEXT =
  "There's a version of this project that could have been beautiful and forgettable, another polished lake house with good bones and safe choices. What makes the Lake Wehapa retreat compelling is its refusal of the obvious at every turn. The architecture looks settled, as though it grew there; the interiors feel both scholarly and deeply liveable. The whole compound earns what Brown calls its rate of return: they live in every square inch of that house.";

const V = {
  // Mobile: product lệch phải-dưới, chừa khe bên phải panel (panel ~70%)
  // để không bị tấm trắng đè mất.
  // bgFrom > 1: asset 1440×840 landscape fill svh sẽ crop mạnh hai bên và
  // phóng khoảng trắng trên/dưới — zoom nhẹ lúc đầu để tỷ lệ silhouette
  // gần desktop hơn.
  mobile: {
    bgFrom: 1.55,
    bgScale: 8.5,
    titleLeft: '5%',
    titleScale: 1,
    prodX: '38vw',
    prodY: '28vh',
  },
  desktop: {
    bgFrom: 1,
    bgScale: 6,
    titleLeft: '7%',
    titleScale: 1.25,
    prodX: '24vw',
    prodY: '10vh',
  },
};

export default function ProductSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const productRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef);

    mm.add(MOTION_CONDITIONS, context => {
      const { isMobile, reduce } = context.conditions as MotionConditions;
      const v = isMobile ? V.mobile : V.desktop;

      // Căn giữa bằng GSAP (không dùng class translate của Tailwind —
      // TW4 dùng CSS property `translate` riêng, cộng dồn với transform
      // của GSAP gây lệch gấp đôi).
      // Origin đặt tại tâm ellipse mặt bàn trong mask: khi scale, cửa sổ
      // ellipse nở quanh chính nó và phủ kín viewport.
      gsap.set(bgRef.current, {
        xPercent: -50,
        yPercent: -50,
        scale: v.bgFrom,
        transformOrigin: '50% 26%',
        visibility: 'visible',
      });
      gsap.set(productRef.current, {
        xPercent: -50,
        yPercent: -50,
        visibility: 'visible',
      });
      gsap.set(titleRef.current, { xPercent: -50 });

      if (reduce) {
        gsap.set(bgRef.current, { scale: v.bgScale });
        gsap.set(titleRef.current, {
          autoAlpha: 1,
          left: v.titleLeft,
          xPercent: 0,
          color: '#111111',
          scale: v.titleScale,
          transformOrigin: 'left center',
        });
        gsap.set(productRef.current, { x: v.prodX, y: v.prodY });
        gsap.set(panelRef.current, { autoAlpha: 1 });
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

      // B: title hiện, background scale tràn full màn hình
      tl.fromTo(
        bgRef.current,
        { scale: v.bgFrom },
        { scale: v.bgScale, duration: 1 }
      )
        .fromTo(
          titleRef.current,
          { autoAlpha: 0, y: -40 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          '<0.2'
        )
        // C: title qua trái (đen, to hơn), product qua phải-dưới, panel text
        // trắng hiện. Nối ngay sau phase B — chèn khoảng nghỉ ở đây sẽ tạo
        // một đoạn scroll đứng hình vì màn lúc đó chỉ còn nền xám tĩnh.
        .to(titleRef.current, {
          left: v.titleLeft,
          xPercent: 0,
          color: '#111111',
          scale: v.titleScale,
          transformOrigin: 'left center',
          duration: 1,
        })
        .to(productRef.current, { x: v.prodX, y: v.prodY, duration: 1 }, '<')
        .fromTo(
          panelRef.current,
          { autoAlpha: 0, y: 60 },
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
      {/* Lớp xám dưới cùng; mask trắng bg-product.png (có cửa sổ hình bàn)
          đè lên — scale mask thì cửa sổ nở ra để lộ nền xám tràn màn */}
      <div className='absolute inset-0 bg-[#f1f1f2]' />
      <img
        ref={bgRef}
        src='/bg-product.png'
        alt=''
        aria-hidden
        className='invisible absolute top-1/2 left-1/2 h-auto w-[185vh] max-w-none md:h-svh md:w-screen md:object-cover'
      />
      <h2
        ref={titleRef}
        className='absolute top-[6%] left-1/2 z-10 font-(family-name:--font-display) text-3xl whitespace-nowrap text-[#6b7280] opacity-0 md:top-[8%] md:text-7xl'
      >
        Interior Design
      </h2>
      <img
        ref={productRef}
        src='/product.png'
        alt='A round dining table with a whitewashed top and stone pedestal base'
        className='invisible absolute top-[54%] left-1/2 z-30 w-[82vw] md:top-[56%] md:z-10 md:w-[36vw]'
      />
      <div
        ref={panelRef}
        className='absolute top-[18%] left-[5%] z-20 w-[68%] bg-white p-5 opacity-0 md:top-[28%] md:left-[7%] md:w-[56vw] md:p-8 lg:top-[36%] lg:left-[8%] lg:w-[46vw] lg:p-12'
      >
        <p className='font-(family-name:--font-display) text-sm leading-relaxed text-neutral-900 md:text-base lg:text-xl'>
          {TEXT}
        </p>
      </div>
      <span
        className='absolute top-1/2 right-6 z-20 hidden -translate-y-1/2 font-sans text-[11px] tracking-[0.2em] text-neutral-800 uppercase md:block'
        style={{ writingMode: 'vertical-rl' }}
      >
        03 - Architecture
      </span>
    </section>
  );
}
