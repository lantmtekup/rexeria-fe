'use client';

import { useEffect, useRef } from 'react';
import { gsap, MOTION_CONDITIONS, type MotionConditions } from '../lib/motion';

const TEXT =
  "There's a version of this project that could have been beautiful and forgettable, another polished lake house with good bones and safe choices. What makes the Lake Wehapa retreat compelling is its refusal of the obvious at every turn. The architecture looks settled, as though it grew there; the interiors feel both scholarly and deeply liveable. The whole compound earns what Brown calls its rate of return: they live in every square inch of that house.";

const V = {
  // Mobile: panel full-width; bàn căn giữa dưới panel (không lệch phải).
  // bgFrom < fill: wrap (xám + mask) nhỏ ở tâm; scroll phase B scale lên
  // bgScale — cửa sổ ellipse nở, xám phủ viewport.
  mobile: {
    bgFrom: 0.1,
    bgScale: 8.5,
    titleLeft: '5%',
    titleScale: 1,
    prodX: 0,
    prodY: '32vh',
    scrollEnd: '+=175%',
  },
  desktop: {
    bgFrom: 0.1,
    bgScale: 6,
    titleLeft: '7%',
    titleScale: 1.25,
    // Desktop: prodX đo từ cạnh phải panel → đúng tâm bàn (xem getProdX).
    prodY: '8vh',
    scrollEnd: '+=260%',
  },
};

/** Desktop: dịch bàn sao cho tâm ảnh (= tâm bàn) trùng cạnh phải khung trắng. */
const getDesktopProdX = (
  section: HTMLElement,
  panelWrap: HTMLElement
): number => {
  const sectionRect = section.getBoundingClientRect();
  const panelRect = panelWrap.getBoundingClientRect();
  // product: left 50% + xPercent -50 → tâm nằm giữa section khi x = 0
  const productCenterAtRest = sectionRect.left + sectionRect.width / 2;
  return panelRect.right - productCenterAtRest;
};

export default function ProductSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgWrapRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const panelWrapRef = useRef<HTMLDivElement>(null);
  const panelFillRef = useRef<HTMLDivElement>(null);
  const panelTextRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef);

    mm.add(MOTION_CONDITIONS, context => {
      const { isMobile, reduce } = context.conditions as MotionConditions;
      const v = isMobile ? V.mobile : V.desktop;
      const section = sectionRef.current;
      const bgWrap = bgWrapRef.current;
      const panelWrap = panelWrapRef.current;
      const panelFill = panelFillRef.current;
      const panelText = panelTextRef.current;
      const product = productRef.current;
      if (
        !section ||
        !bgWrap ||
        !panelWrap ||
        !panelFill ||
        !panelText ||
        !product
      )
        return;

      const getProdX = () =>
        isMobile ? V.mobile.prodX : getDesktopProdX(section, panelWrap);

      // Căn giữa bằng GSAP (không dùng class translate của Tailwind —
      // TW4 dùng CSS property `translate` riêng, cộng dồn với transform
      // của GSAP gây lệch gấp đôi).
      // yPercent -26 + origin 50% 26%: tâm ellipse mặt bàn = tâm viewport.
      // Scale wrap — xám chỉ lộ qua cửa sổ; ngoài wrap = trắng section.
      gsap.set(bgWrap, {
        xPercent: -50,
        yPercent: -26,
        scale: v.bgFrom,
        transformOrigin: '50% 26%',
        visibility: 'visible',
      });
      gsap.set(product, {
        xPercent: -50,
        yPercent: -50,
        scale: v.bgFrom,
        transformOrigin: '50% 40%',
        visibility: 'visible',
      });
      gsap.set(titleRef.current, { xPercent: -50 });
      gsap.set(panelFill, { scale: 0, transformOrigin: 'left top' });
      gsap.set(panelText, { autoAlpha: 0 });

      if (reduce) {
        gsap.set(bgWrap, { scale: v.bgScale });
        gsap.set(titleRef.current, {
          autoAlpha: 1,
          left: v.titleLeft,
          xPercent: 0,
          color: '#111111',
          scale: v.titleScale,
          transformOrigin: 'left center',
        });
        gsap.set(product, { x: getProdX(), y: v.prodY, scale: 1 });
        gsap.set(panelFill, {
          scale: 1,
          transformOrigin: 'left top',
        });
        gsap.set(panelText, { autoAlpha: 1 });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: v.scrollEnd,
          scrub: 0.6,
          pin: true,
          invalidateOnRefresh: true,
        },
      });

      // B: title hiện, wrap + product scale ở tâm — ellipse nở, xám phủ viewport
      tl.fromTo(bgWrap, { scale: v.bgFrom }, { scale: v.bgScale, duration: 1 })
        .fromTo(product, { scale: v.bgFrom }, { scale: 1, duration: 1 }, '<')
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
        .to(product, { x: () => getProdX(), y: v.prodY, duration: 1 }, '<')
        // Lớp trắng: nở từ gốc trên-trái — cả chiều ngang và dọc.
        .fromTo(
          panelFill,
          { scale: 0, transformOrigin: 'left top' },
          { scale: 1, duration: 0.8 },
          '<0.3'
        )
        .fromTo(
          panelText,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.5 },
          '<0.25'
        );
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-section='architecture'
      className='relative h-svh overflow-hidden bg-white'
    >
      {/* Wrap = xám + mask cùng scale. Ngoài wrap = bg trắng section
          (không lộ xám quanh khung khi bgFrom < 1). Scale lên → cửa sổ
          ellipse nở, xám phủ kín viewport. */}
      <div
        ref={bgWrapRef}
        className='invisible absolute top-1/2 left-1/2 aspect-[1440/840] w-[185vh] max-w-none md:aspect-auto md:h-svh md:w-screen'
      >
        <div className='absolute inset-0 bg-[#f1f1f2]' aria-hidden />
        <img
          src='/bg-product.png'
          alt=''
          aria-hidden
          className='absolute inset-0 h-full w-full object-cover'
        />
      </div>
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
        className='invisible absolute top-[54%] left-1/2 z-30 w-[76vw] max-w-full md:top-[56%] md:w-[36vw]'
      />
      <div
        ref={panelWrapRef}
        className='absolute top-[18%] left-[5%] z-20 w-[90%] px-5 py-5 md:top-[24%] md:left-[6%] md:w-[64vw] md:px-12 md:py-14 lg:top-[26%] lg:left-[7%] lg:w-[60vw] lg:px-16 lg:py-20'
      >
        <div
          ref={panelFillRef}
          aria-hidden
          className='absolute inset-0 origin-top-left bg-white'
        />
        <p
          ref={panelTextRef}
          className='relative font-(family-name:--font-display) text-sm leading-relaxed text-neutral-900 opacity-0 md:max-w-[72%] md:text-base lg:max-w-[70%] lg:text-xl'
        >
          {TEXT}
        </p>
      </div>
    </section>
  );
}
