'use client';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, MQ } from '@/lib/journey/motion';
import { useLocale } from '@/components/shared/locale-provider';
import {
  OVERVIEW,
  PHASES,
  PHASE_COPY,
  WORLD,
} from '@/lib/journey/day-canvas';

/**
 * "Một ngày tại Magnolia" — CUỘN để đi từ tranh tổng thể vào từng chi tiết,
 * hết bốn thời điểm là hết ngày.
 *
 * Năm chặng: tranh tổng thể → Sáng → Trưa → Chiều → Tối. Người xem không bấm
 * gì, không kéo gì; cuộn là camera đi. Đây là cùng một cơ chế với nhịp khung
 * cửa và hai chương lướt ngang — một khung ghim, tiến độ cuộn ghi trực tiếp
 * vào transform — nên nó nằm cùng hệ với cả trang.
 *
 * NHỊP GIỮA HAI CHẶNG. Không pan thẳng từ chi tiết này sang chi tiết kia: ở
 * mức zoom 2.7× thì pan ngang qua nửa bức tranh vừa nhanh vừa mất phương
 * hướng. Mỗi lần chuyển chặng là LÙI RA rồi LAO VÀO — zoom hạ về 1.45× ở giữa
 * đường. Người xem thấy lại toàn cảnh một nhịp, biết mình đang đi đâu, rồi
 * mới vào chi tiết tiếp theo.
 *
 * ĐỘ NÉT THEO TẦNG. Tranh tổng thể là nền; ảnh render gốc 2400px của từng
 * vùng chỉ hiện trong chặng của nó, và chỉ được gán `src` khi chặng đó sắp
 * tới — 8 ảnh là 3.9MB, tải hết từ đầu là tranh băng thông với chính tranh
 * tổng thể.
 *
 * Toạ độ camera là hàm (`() => ...`) chứ không phải số: `fit` đổi theo khổ
 * màn, và `invalidateOnRefresh` bắt GSAP tính lại khi resize.
 */

/** Ngân sách cuộn cho mỗi chặng, đơn vị: chiều cao màn. */
const HOLD = 0.55; // dừng lại ngắm một chặng
const TRAVEL = 0.95; // đi từ chặng này sang chặng kế
const TOTAL = 0.7 + PHASES.length * (TRAVEL + HOLD);

/** Mức zoom khi đã vào một chặng, và mức hạ xuống giữa hai chặng. */
const IN = 2.7;
const BETWEEN = 1.45;

export function DayScroll() {
  const { t, locale } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const cam = useRef({ x: WORLD.w / 2, y: WORLD.h / 2, s: 1 });
  const fit = useRef(1);

  const draw = useCallback(() => {
    const host = sectionRef.current?.querySelector<HTMLElement>('[data-stage]');
    const world = worldRef.current;
    if (!host || !world) return;
    const W = host.clientWidth;
    const H = host.clientHeight;
    const c = cam.current;
    world.style.transform = `translate3d(${W / 2 - c.x * c.s}px, ${H / 2 - c.y * c.s}px, 0) scale(${c.s})`;
  }, []);

  /** `cover` chứ không `contain`: tranh phải phủ kín khung, không viền đen. */
  const measure = useCallback(() => {
    const host = sectionRef.current?.querySelector<HTMLElement>('[data-stage]');
    if (!host) return;
    fit.current = Math.max(
      host.clientWidth / WORLD.w,
      host.clientHeight / WORLD.h
    );
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduce = window.matchMedia(MQ.reduce).matches;

    measure();
    cam.current = { x: WORLD.w / 2, y: WORLD.h / 2, s: fit.current };
    draw();

    if (reduce) {
      // Không cuộn-điều-khiển: giữ toàn cảnh, hiện hết nhãn.
      gsap.set(section.querySelectorAll('[data-copy]'), { autoAlpha: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onRefresh: measure,
          onUpdate: draw,
        },
      });

      // Chặng 0 — ngắm toàn cảnh.
      tl.to({}, { duration: 0.7 });

      PHASES.forEach((p, i) => {
        const prev = i === 0 ? { cx: 0.5, cy: 0.5 } : PHASES[i - 1];
        const layer = `[data-phase="${p.id}"]`;
        const copy = `[data-copy="${p.id}"]`;

        // Lùi ra: zoom hạ về BETWEEN ở điểm giữa đường đi.
        tl.to(cam.current, {
          x: () => ((prev.cx + p.cx) / 2) * WORLD.w,
          y: () => ((prev.cy + p.cy) / 2) * WORLD.h,
          s: () => fit.current * BETWEEN,
          duration: TRAVEL * 0.45,
          ease: 'power1.inOut',
        });
        // Lao vào chặng.
        tl.to(cam.current, {
          x: () => p.cx * WORLD.w,
          y: () => p.cy * WORLD.h,
          s: () => fit.current * IN,
          duration: TRAVEL * 0.55,
          ease: 'power1.inOut',
        });
        // Ảnh gốc và nhãn của chặng hiện lên trong lúc lao vào.
        tl.fromTo(
          layer,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: TRAVEL * 0.4 },
          `-=${TRAVEL * 0.5}`
        );
        tl.fromTo(
          copy,
          { autoAlpha: 0, y: 26 },
          { autoAlpha: 1, y: 0, duration: TRAVEL * 0.3, ease: 'power2.out' },
          `-=${TRAVEL * 0.28}`
        );

        // Dừng lại ngắm.
        tl.to({}, { duration: HOLD });

        // Rời chặng: nhãn đi trước, ảnh gốc mờ sau — chặng cuối thì giữ lại.
        if (i < PHASES.length - 1) {
          tl.to(copy, { autoAlpha: 0, y: -22, duration: TRAVEL * 0.22 });
          tl.to(layer, { autoAlpha: 0, duration: TRAVEL * 0.3 }, '<');
        }
      });
    }, section);

    const ro = new ResizeObserver(() => {
      measure();
      ScrollTrigger.refresh();
    });
    const host = section.querySelector<HTMLElement>('[data-stage]');
    if (host) ro.observe(host);

    return () => {
      ro.disconnect();
      ctx.revert();
    };
  }, [draw, measure]);

  return (
    <section
      id='day'
      ref={sectionRef}
      aria-label={t.gallery.ariaLabel}
      className='bg-charcoal-950 relative z-0'
      style={{ height: `${TOTAL * 100}svh` }}
    >
      <div
        data-stage
        className='sticky top-0 h-svh w-full overflow-hidden'
      >
        <div
          ref={worldRef}
          className='absolute top-0 left-0 origin-top-left will-change-transform'
          style={{ width: WORLD.w, height: WORLD.h }}
        >
          {/* Nền: tranh tổng thể. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={OVERVIEW}
            alt={t.gallery.ariaLabel}
            draggable={false}
            className='absolute inset-0 h-full w-full select-none'
          />

          {/* Ảnh render gốc từng vùng — chỉ hiện trong chặng của nó. */}
          {PHASES.map(p => (
            <div
              key={p.id}
              data-phase={p.id}
              className='absolute inset-0 opacity-0'
            >
              {p.details.map(d => (
                <DetailImg key={d.src} box={d} />
              ))}
            </div>
          ))}
        </div>

        {/* Dải tối trên/dưới — cùng scrim với mọi panel ảnh khác của trang. */}
        <div aria-hidden className='bg-panel-scrim absolute inset-0' />

        {/* Nhãn từng chặng. Chồng lên nhau ở cùng một chỗ, timeline bật tắt. */}
        <div className='pointer-events-none absolute inset-x-0 bottom-[16svh] grid place-items-center px-6'>
          {PHASES.map(p => (
            <div
              key={p.id}
              data-copy={p.id}
              className='max-w-[38rem] text-center opacity-0 [grid-area:1/1]'
            >
              <p className='text-champagne-400 tracking-luxe text-[10px] uppercase md:text-[11px]'>
                {t.gallery.phases[p.id]}
              </p>
              <p className='font-display text-ivory mt-3 text-[clamp(1.4rem,2.7vw,2.4rem)] leading-[1.16] text-balance'>
                {PHASE_COPY[p.id][locale].title}
              </p>
              <p className='text-champagne-50/65 mx-auto mt-4 max-w-[30rem] text-[13.5px] leading-[1.6]'>
                {PHASE_COPY[p.id][locale].body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Một ảnh render gốc đè lên nền, tan mép bốn phía.
 *
 * Không tan mép thì nó là một hình chữ nhật cắt cứng dán lên tranh — thấy
 * ngay mép, và thấy đường ghép giữa hai ảnh trong cùng một ô.
 * `maskComposite: intersect` là chỗ dễ sai: mặc định `add` cho mép mờ ở góc
 * nhưng vẫn cứng ở cạnh.
 *
 * `loading='lazy'`: ảnh nằm trong lớp world đã ở trong khung nên
 * IntersectionObserver báo "đã thấy" ngay; nhưng chính lớp `[data-phase]` bọc
 * ngoài có `opacity: 0` và trình duyệt vẫn hoãn ảnh lazy trong nhánh chưa
 * hiện, nên 3.9MB không về cùng lúc với tranh tổng thể.
 */
function DetailImg({
  box,
}: {
  box: { src: string; x: number; y: number; w: number; h: number; feather?: number };
}) {
  const mask = box.feather
    ? `linear-gradient(to right, transparent, #000 ${box.feather}%, #000 ${100 - box.feather}%, transparent), linear-gradient(to bottom, transparent, #000 ${box.feather}%, #000 ${100 - box.feather}%, transparent)`
    : undefined;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={box.src}
      alt=''
      loading='lazy'
      decoding='async'
      draggable={false}
      className='absolute select-none'
      style={{
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        objectFit: 'cover',
        ...(mask
          ? {
              maskImage: mask,
              WebkitMaskImage: mask,
              maskComposite: 'intersect',
              WebkitMaskComposite: 'source-in',
            }
          : null),
      }}
    />
  );
}
