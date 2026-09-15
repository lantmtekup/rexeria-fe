'use client';
import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import { gsap, MQ } from '@/lib/journey/motion';
import { useLocale } from '@/components/shared/locale-provider';
import { MagnoliaMark } from '@/components/shared/magnolia-mark';

/**
 * CẢNH KẾT — cơ chế `home-end` của trang mẫu, nhịp cuối cùng còn thiếu.
 *
 * Trang mẫu đóng hành trình bằng hai chuyển động ngược nhau cùng lúc:
 *   OUT — cảnh vừa đi qua LÙI RA SAU: z 0 → 1 (scale 1 → 0.6) và alpha → 0.5;
 *   END — một tấm khung cửa TỚI TỪ RẤT GẦN: z −3 → 0.3 (scale 2.2 → 0.88),
 *         alpha 0 → 1 trong 25% đầu.
 * Trong lòng khung vẫn thấy cảnh cũ mờ phía sau. Trang dừng ở đó.
 *
 * Ở đây cảnh lùi ra là bậc thang của Grace — đúng cảnh người xem vừa rời.
 * Tấm là lại chính tấm vòm của nhịp mở màn, nên hành trình đóng lại đúng chỗ
 * nó mở ra: đi vào qua một ngưỡng, đi ra qua cùng một ngưỡng.
 *
 * Hình học giống `aperture-gate.tsx`: tấm là khung đúng tỉ lệ, dịch sao cho
 * TÂM Ô rơi vào tâm màn, nên mark hoa mộc lan đặt ở tâm màn là nằm đúng trong
 * lòng vòm ở mọi khổ màn. Tấm tới scale 1.0 (vừa phủ kín) chứ không 0.88 —
 * nhỏ hơn 1 là hở mép ra nền.
 */
const PLATE = { w: 1672, h: 941, holeX: 0.5, holeY: 0.3905 };
/**
 * Bề rộng tối thiểu để tấm phủ kín màn SAU KHI ĐÃ DỊCH.
 *
 * Tôi tính thiếu một ràng buộc ở bản đầu và dùng `177.68vh` — đúng bằng
 * ASPECT × 100vh, tức chỉ đủ phủ màn khi tấm KHÔNG dịch. Nhưng tấm phải dịch
 * để tâm ô rơi vào tâm màn, nên phần tấm nằm TRÊN tâm ô (39.05% chiều cao
 * tấm) mới là phần phải phủ nửa màn trên:
 *
 *   0.3905 × H_tấm ≥ 0.5 × H_màn   →   H_tấm ≥ 1.2804 × H_màn
 *   0.6095 × H_tấm ≥ 0.5 × H_màn   →   H_tấm ≥ 0.8203 × H_màn   (lỏng hơn)
 *
 * Ràng buộc trên gắt hơn, nên W_tấm ≥ 1.2804 × 1.7768 × 100vh = 227.5vh.
 * Thiếu 50vh là lý do có dải đen ở mép trên khung đầu của nhịp mở màn và ở
 * mép dưới cảnh kết.
 */
const PLATE_MIN_W = `max(100vw, 228vh)`;

export function ClosingAperture() {
  const { t } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const behind = section.querySelector<HTMLElement>('[data-end-behind]');
    const plate = section.querySelector<HTMLElement>('[data-end-plate]');
    const mark = section.querySelector<HTMLElement>('[data-end-mark]');
    if (!behind || !plate || !mark) return;

    const reduce = window.matchMedia(MQ.reduce).matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set([plate, mark], { opacity: 1, scale: 1 });
        gsap.set(behind, { opacity: 0.5, scale: 0.62 });
        return;
      }

      const layers = [behind, plate];
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
          // Cùng lý do với chương: chỉ promote khi nhịp này đang chạy.
          onToggle: self => {
            for (const el of layers)
              el.style.willChange = self.isActive ? 'transform' : 'auto';
          },
        },
      });

      // Cảnh cũ lùi ra sau.
      tl.fromTo(
        behind,
        { scale: 1, opacity: 1 },
        { scale: 0.62, opacity: 0.5, duration: 0.8 },
        0
      );

      // Tấm vòm tới từ rất gần. expoScale vì đây là một cú zoom dài.
      tl.fromTo(
        plate,
        { scale: 2.6, opacity: 0 },
        { scale: 1, opacity: 1, ease: 'expoScale(2.6,1,none)', duration: 0.8 },
        0
      );
      tl.fromTo(plate, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0);

      // Mark và dòng chữ vào sau cùng, khi khung đã đứng yên.
      tl.fromTo(
        mark,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' },
        0.74
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const stage = {
    width: PLATE_MIN_W,
    aspectRatio: `${PLATE.w} / ${PLATE.h}`,
    transform: `translate(${-PLATE.holeX * 100}%, ${-PLATE.holeY * 100}%)`,
  } as const;

  return (
    <section
      ref={sectionRef}
      data-closing
      aria-label={t.hero.brand}
      className='bg-charcoal-950 relative z-0 h-[220svh]'
    >
      <div className='sticky top-0 h-svh w-full overflow-hidden'>
        {/* Cảnh vừa rời — lùi ra sau, vẫn thấy mờ trong lòng vòm. */}
        <div
          data-end-behind
          className='absolute inset-0 origin-center'
        >
          <Image
            src='/images/assets/grace/stair-04.webp'
            alt=''
            fill
            sizes='100vw'
            className='object-cover'
          />
        </div>

        {/* Tấm vòm tới từ gần. */}
        <div
          data-end-plate
          className='absolute top-1/2 left-1/2 origin-center'
          style={stage}
        >
          <Image
            src='/journey/gate/gate-plate.webp'
            alt=''
            fill
            sizes='100vw'
            className='object-fill'
          />
        </div>

        {/* Mark nằm đúng tâm ô vòm — vì tâm ô đã được dịch về tâm màn. */}
        <div
          data-end-mark
          className='pointer-events-none absolute inset-0 grid place-items-center'
        >
          <div className='flex flex-col items-center gap-6 px-6 text-center'>
            <MagnoliaMark className='text-champagne-400 h-14 w-14 md:h-20 md:w-20' />
            <p className='font-display text-ivory text-[clamp(1.5rem,2.6vw,2.6rem)] leading-[1.14] text-balance'>
              {t.hero.tagline}
            </p>
            <p className='text-champagne-50/55 tracking-luxe text-[10px] uppercase md:text-[10.5px]'>
              {t.footer.address}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
