'use client';

import { useEffect, useRef } from 'react';
import { gsap, MOTION_CONDITIONS, type MotionConditions } from '../lib/motion';

const ITEMS = [
  {
    src: '/gallery-1.webp',
    alt: 'An arched hallway with steel-framed glass walls and a lantern pendant',
    text: 'The approach allowed maximum square footage without an imposing footprint, while creating multiple exposures to flood the interiors with natural light. Set on a peninsula jutting into the lake, the orientation provides water views on three sides; the entire plan was optimised to frame them. "I thought of the house as a camera and tried to frame and crop as many views of the lake as possible to make the setting as picturesque as it could be."',
  },
  {
    src: '/gallery-2.webp',
    alt: 'A breakfast nook with leaded windows and built-in benches',
    text: 'The approach allowed maximum square footage without an imposing footprint, while creating multiple exposures to flood the interiors with natural light. Set on a peninsula jutting into the lake, the orientation provides water views on three sides; the entire plan was optimised to frame them.',
  },
  {
    src: '/gallery-3.webp',
    alt: 'A kitchen with oak cabinetry, marble counters and leaded windows',
    text: 'Betsy Brown’s interiors are almost monastic in their restraint, ruthlessly edited until every object asked to stay. She started with a Kaare Klint dining table, Danish modern pieces enjoyed by cognoscenti, leather because it wears, and everything else earned its place.',
  },
];

// Bề rộng các khối trong dải, đơn vị vw. Mọi offset của timeline đều suy ra từ
// đây nên đổi layout chỉ cần sửa một chỗ.
const LAYOUT = {
  mobile: { img: 78, text: 78, gap: 8, pin: '+=520%' },
  desktop: { img: 30, text: 26, gap: 4, pin: '+=280%', minTextLeft: 64 },
};

export default function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef);
    const q = gsap.utils.selector(sectionRef);

    mm.add(MOTION_CONDITIONS, context => {
      const { isMobile, reduce } = context.conditions as MotionConditions;
      const L = isMobile ? LAYOUT.mobile : LAYOUT.desktop;

      const imgs = q('[data-gallery-img]');
      const texts = q('[data-gallery-text]');

      if (reduce) {
        gsap.set(texts, { autoAlpha: 1 });
        return;
      }

      // Vị trí flex tự nhiên của ảnh / text thứ i trong dải (vw)
      const slot = (i: number) => i * (L.img + L.text + 2 * L.gap);
      const textSlot = (i: number) => slot(i) + L.img + L.gap;
      // Ảnh đầu căn giữa viewport khi cụm đã tách xong
      const spreadGap = isMobile ? 8 : L.gap;
      const firstLeft = isMobile ? (100 - L.img) / 2 : 3;
      // Khi 3 ảnh xếp thành hàng: ảnh i nằm ở firstLeft + i*(img+gap)
      const rowX = (i: number) => firstLeft + i * (L.img + spreadGap) - slot(i);
      // Trước khi tách, 3 ảnh chồng lệch nhau một chút ở mép trái. Chừa lại
      // một phần ảnh đầu trong màn để lúc mở section không thấy khung trắng.
      const stackX = (i: number) => -L.img + 12 - i * 10 + firstLeft - slot(i);

      // Phase B đặt track = firstLeft (ảnh về x:0) nên phase C chạy từ
      // firstLeft → trackEnd, không còn từ 0.
      const trackStart = firstLeft;
      const lastIndex = ITEMS.length - 1;
      // Desktop: ẩn ảnh kế cuối nhưng không kéo quá sang trái để text cuối
      // bị dính mép — lấy điểm dừng "nhẹ" hơn giữa hai ngưỡng.
      const trackEnd = isMobile
        ? firstLeft - textSlot(lastIndex)
        : Math.max(
            -(slot(lastIndex - 1) + L.img),
            LAYOUT.desktop.minTextLeft - textSlot(lastIndex)
          );
      const trackTravel = trackStart - trackEnd;
      const C_DUR = 2;
      // Thời điểm (trong phase C) mà text i vừa ló vào mép phải màn hình.
      // Phải bắt lúc nó *vào*, không phải lúc trôi tới mép trái — canh theo
      // mép trái thì chữ chỉ sáng khi sắp trôi ra khỏi màn.
      const textBeat = (i: number) =>
        gsap.utils.clamp(
          0,
          1,
          (88 - textSlot(i) - trackStart) / (trackEnd - trackStart)
        ) * C_DUR;

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: L.pin,
          scrub: 0.6,
          pin: true,
        },
      });

      // A: 3 ảnh trượt từ trái vào, đè nhau rồi tách dần thành hàng ngang
      imgs.forEach((img, i) => {
        tl.fromTo(
          img,
          { x: `${stackX(i)}vw` },
          { x: `${rowX(i)}vw`, duration: 1 },
          i === 0 ? 0 : '<'
        );
      });

      // B: mọi ảnh về slot tự nhiên (mở khe cho text). Ảnh 0 cũng về x:0
      // kèm track → firstLeft — giữ inset trái mà không ăn mất gap (trước
      // đây ảnh 0 giữ offset firstLeft nên đè text 0 trên mobile).
      tl.to(imgs, { x: 0, duration: 0.8 }, '+=0.3');
      tl.to(trackRef.current, { x: `${trackStart}vw`, duration: 0.8 }, '<');
      if (!isMobile) {
        tl.to(texts[0], { autoAlpha: 1, duration: 0.4 }, '<');
      }

      const cStart = tl.duration() + 0.4;

      if (isMobile) {
        // Mobile chỉ vừa một khối mỗi lần: đi từng chặng và dừng lại ở mỗi
        // khối. Nhịp nghỉ ở đây là có chủ đích — nó chính là lúc người đọc
        // ngắm ảnh / đọc đoạn văn, khác hẳn khoảng chết giữa hai animation.
        const stops = [
          { at: textSlot(0), text: 0 },
          { at: slot(1) },
          { at: textSlot(1), text: 1 },
          { at: slot(2) },
          { at: textSlot(2), text: 2 },
        ];
        stops.forEach((stop, k) => {
          const pos = k === 0 ? cStart : '+=0.5';
          tl.to(
            trackRef.current,
            { x: `${firstLeft - stop.at}vw`, duration: 0.9 },
            pos
          );
          if (stop.text !== undefined) {
            // Sáng sẵn từ trước lúc trượt: nếu đợi chữ vào giữa màn mới fade
            // thì nửa màn bên phải hở trắng trong lúc khối đang tới.
            tl.to(texts[stop.text], { autoAlpha: 1, duration: 0.35 }, '<-0.3');
          }
        });
        // Nhịp đọc cho đoạn cuối trước khi section nhả pin
        tl.to({}, { duration: 0.7 });
        return;
      }

      // Desktop: cả ảnh lẫn text cùng lọt màn nên dải chạy liền một mạch,
      // text sáng lên đúng lúc trôi tới chỗ đọc được.
      tl.to(trackRef.current, { x: `${trackEnd}vw`, duration: C_DUR }, cStart);
      for (let i = 1; i < texts.length; i++) {
        tl.to(
          texts[i],
          { autoAlpha: 1, duration: 0.3 },
          Math.max(cStart, cStart + textBeat(i))
        );
      }
      // Nhịp đọc cho đoạn cuối trước khi section nhả pin
      tl.to({}, { duration: 0.5 }, cStart + C_DUR);
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-section='lake-wehapa'
      className='relative h-svh overflow-hidden bg-white'
    >
      <div
        ref={trackRef}
        className='absolute top-[24%] left-0 flex h-[46vh] w-max items-center gap-[8vw] md:top-[21%] md:h-[58vh] md:gap-[4vw]'
      >
        {ITEMS.map((item, i) => (
          <div key={item.src} className='contents'>
            <div
              data-gallery-img
              className='relative h-full w-[78vw] flex-none overflow-hidden md:w-[30vw]'
              style={{ zIndex: ITEMS.length - i }}
            >
              <img
                src={item.src}
                alt={item.alt}
                className='h-full w-full object-cover'
              />
            </div>
            <div
              data-gallery-text
              className='w-[78vw] flex-none font-(family-name:--font-display) text-base leading-relaxed text-neutral-900 opacity-0 md:w-[26vw] md:text-xl'
            >
              {item.text}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
