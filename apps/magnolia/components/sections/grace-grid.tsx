'use client';
import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/journey/motion';
import { useLocale } from '@/components/shared/locale-provider';
import { openPlace } from '@/lib/journey/overlay-store';
import { HouseCard } from '@/components/journey/house-card';

/**
 * Effortless Grace — section chủ đề, nhịp cuối của hệ bản mẫu còn dùng cơ chế
 * riêng của Magnolia.
 *
 * Trước: cross-fade 3 ảnh bậc thang trong một khối sticky 300svh, mỗi ảnh một
 * câu chữ chồng lên. Ba câu đó là toàn bộ nội dung của cả đoạn — ba trăm phần
 * trăm chiều cao màn cho ba dòng chữ, và người xem không làm được gì với nó.
 *
 * Giờ: tiêu đề chủ đề → lưới card, đúng cấu trúc `c-home__cards` của trang
 * mẫu. Ba câu chữ trở thành tiêu đề của ba card; bấm vào mở lớp phủ có ảnh
 * lớn và đoạn mô tả. Nội dung không mất câu nào, và `stair-03` — ảnh trước
 * đây không được render ở đâu cả — giờ có chỗ.
 *
 * `stair-04` vẫn đang là cảnh lùi ra ở `closing-aperture.tsx`, nên ở đây nó
 * đứng cuối lưới: người xem gặp nó lần nữa ngay sau đó, ở nhịp kết.
 */
const CARDS: Array<{
  src: string;
  vi: { title: string; body: string };
  en: { title: string; body: string };
}> = [
  {
    src: '/images/assets/grace/stair-01.webp',
    vi: {
      title: 'Phong vị sống thương gia',
      body: 'Thang chính dẫn lên tầng sinh hoạt: một trục đứng duy nhất, đá và đồng, không chi tiết nào thừa.',
    },
    en: {
      title: 'A life in business class',
      body: 'The main stair to the living level: one vertical axis in stone and bronze, with nothing spare in it.',
    },
  },
  {
    src: '/images/assets/grace/stair-02.webp',
    vi: {
      title: 'Khi chuẩn xác trở thành thước đo của cảm giác',
      body: 'Từng bậc, từng mối nối, từng khe sáng đều được tính. Cái người ở cảm nhận được là sự chuẩn xác đó.',
    },
    en: {
      title: 'When precision becomes the measure of feeling',
      body: 'Every tread, every joint, every reveal is set out. What a resident feels is that precision.',
    },
  },
  {
    src: '/images/assets/grace/stair-03.webp',
    vi: {
      title: 'Ánh sáng đi theo bậc thang',
      body: 'Khe sáng chạy dọc tay thang, đủ để dẫn đường mà không cần một ngọn đèn nào lộ ra.',
    },
    en: {
      title: 'Light follows the stair',
      body: 'A slot of light runs the length of the handrail — enough to lead the way with no fitting in sight.',
    },
  },
  {
    src: '/images/assets/grace/stair-04.webp',
    vi: {
      title: 'Phong cách sống cũng cần một "hạng" tương xứng',
      body: 'Không phải nhiều hơn, mà là đúng mức. Đó là thước đo duy nhất còn lại sau khi mọi thứ khác đã cũ.',
    },
    en: {
      title: 'A way of living deserves a class of its own',
      body: 'Not more, but right. That is the only measure left once everything else has dated.',
    },
  },
];

export function GraceGrid() {
  const { t, locale } = useLocale();
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;

    const mm = gsap.matchMedia(section);
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const heading = section.querySelector<HTMLElement>('[data-heading]');
      if (heading)
        gsap.fromTo(
          heading,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: heading, start: 'top 85%', once: true },
          }
        );

      const cards = gsap.utils.toArray<HTMLElement>('[data-card]', section);
      gsap.set(cards, { autoAlpha: 0, y: 48 });
      const batch = ScrollTrigger.batch(cards, {
        start: 'top 90%',
        once: true,
        onEnter: els =>
          gsap.to(els, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.08,
            overwrite: true,
          }),
      });
      return () => batch.forEach(tr => tr.kill());
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      id='grace'
      ref={ref}
      aria-labelledby='grace-heading'
      className='bg-charcoal-950 relative z-10 -mt-[100svh]'
    >
      <div className='mx-auto max-w-[1440px] px-5 pt-[20svh] pb-[24svh] md:px-8'>
        <p className='text-champagne-400 tracking-luxe text-[10.5px] uppercase md:text-[11.5px]'>
          {t.grace.title}
        </p>
        <h2
          id='grace-heading'
          data-heading
          className='font-display text-ivory mt-6 max-w-[36rem] text-[clamp(1.88rem,3.32vw,3.48rem)] leading-[1.05] tracking-[-0.015em]'
        >
          {t.grace.subtitle}
        </h2>

        <ul className='mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-24'>
          {CARDS.map(card => {
            const c = card[locale];
            return (
              <li key={card.src} data-card>
                <HouseCard
                  src={card.src}
                  title={c.title}
                  body={c.body}
                  cta={t.units.explore}
                  aspect='1672 / 941'
                  onOpen={() =>
                    openPlace({ title: c.title, body: c.body, src: card.src })
                  }
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
