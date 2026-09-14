'use client';
import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import { gsap, MQ } from '@/lib/journey/motion';

/**
 * KHUNG CỬA — cơ chế mở màn của trang mẫu, đặt ngay sau phim.
 *
 * Trang mẫu dựng cả trang quanh một tấm khắc có ô khoét trong suốt: camera
 * phóng xuyên qua ô đó để vào cảnh phía sau, rồi tấm mờ hẳn. Đây là bản đó
 * với vật liệu của Magnolia — vòm travertine, lòng vòm alpha = 0.
 *
 * Nó thay cho outro cũ của phim (thu vào một card bo góc 32px trên nền đen).
 * Card nhỏ trên nền đen rồi nhảy sang một section ivory full-bleed là cú vấp
 * tông nặng nhất của trang; đi xuyên một ngưỡng thì không có cú vấp nào.
 *
 * HÌNH HỌC — chỗ dễ sai nhất:
 *
 * Tâm ô khoét của tấm vòm nằm ở 50.0% / 39.05% chiều tấm (đo bằng flood-fill
 * vùng đen: x 401–1269, y 71–664 trong ảnh 1672×941). Muốn phóng "xuyên qua
 * ô" thì tâm ô phải nằm đúng tâm màn TRƯỚC khi scale, nếu không camera sẽ
 * phóng vào một điểm lệch và ô trượt ra khỏi khung.
 *
 * Nên tấm không dùng `object-cover` — cover cắt ảnh theo khổ màn, tâm ô sẽ
 * dịch theo và không tính được. Thay vào đó tấm là một khung ĐÚNG TỈ LỆ, rộng
 * `max(100vw, 177.68vh)` để luôn phủ kín màn, rồi dịch đi sao cho tâm ô rơi
 * vào tâm màn. Camera bọc ngoài scale quanh tâm chính nó.
 */
const PLATE = { w: 1672, h: 941, holeX: 0.5, holeY: 0.3905 };
const ASPECT = PLATE.w / PLATE.h; // 1.7768

/** Phóng tới mức lòng vòm phủ hết bề ngang màn, cộng một chút để qua hẳn. */
const ZOOM = 3.1;

export function ApertureGate({
  behindSrc,
  behindAlt,
}: {
  behindSrc: string;
  behindAlt: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const cam = section.querySelector<HTMLElement>('[data-gate-cam]');
    const plate = section.querySelector<HTMLElement>('[data-gate-plate]');
    const behind = section.querySelector<HTMLElement>('[data-gate-behind]');
    if (!cam || !plate || !behind) return;

    const reduce = window.matchMedia(MQ.reduce).matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set(behind, { opacity: 1 });
        gsap.set(plate, { opacity: 0 });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      // expoScale giữ tốc độ phóng CẢM NHẬN đều suốt đoạn. Ease thẳng làm
      // nửa sau thấy nhanh gấp mấy lần nửa đầu vì mỗi bước scale phủ nhiều
      // pixel hơn — đúng cái làm hỏng mọi cú zoom dài.
      tl.fromTo(
        cam,
        { scale: 1 },
        { scale: ZOOM, ease: `expoScale(1,${ZOOM},none)`, duration: 1 },
        0
      );

      // Cảnh sau ô: mờ 0.66 lúc còn nhìn qua ô, rõ hẳn khi tấm đã tan.
      tl.fromTo(behind, { opacity: 0.66 }, { opacity: 1, duration: 0.55 }, 0.3);

      // Tấm vòm tan ở 1/3 cuối — trước đó nó vẫn phải kín để lòng vòm còn là
      // một cái ô, không phải một mảng sáng.
      tl.fromTo(plate, { opacity: 1 }, { opacity: 0, duration: 0.3 }, 0.64);
    }, section);

    return () => ctx.revert();
  }, []);

  // Khung đúng tỉ lệ, phủ kín màn, dịch sao cho TÂM Ô rơi vào tâm màn.
  const stage = {
    width: `max(100vw, ${(100 * ASPECT).toFixed(2)}vh)`,
    aspectRatio: `${PLATE.w} / ${PLATE.h}`,
    transform: `translate(${-PLATE.holeX * 100}%, ${-PLATE.holeY * 100}%)`,
  } as const;

  return (
    <section
      ref={sectionRef}
      data-gate
      aria-hidden
      className='bg-charcoal-950 relative z-0 h-[260svh]'
    >
      <div className='sticky top-0 h-svh w-full overflow-hidden'>
        <div
          data-gate-cam
          className='absolute inset-0 origin-center will-change-transform'
        >
          {/* Cảnh sau ô — nhìn xuyên lòng vòm. */}
          <div data-gate-behind className='absolute inset-0'>
            <Image
              src={behindSrc}
              alt={behindAlt}
              fill
              priority
              sizes='100vw'
              className='scale-[1.12] object-cover'
            />
          </div>

          {/* Tấm vòm. Lòng vòm alpha = 0 nên cảnh sau lộ ra qua đó. */}
          <div
            data-gate-plate
            className='absolute top-1/2 left-1/2'
            style={stage}
          >
            <Image
              src='/journey/gate/gate-plate.png'
              alt=''
              fill
              priority
              sizes='100vw'
              className='object-fill'
            />
          </div>
        </div>
      </div>
    </section>
  );
}
