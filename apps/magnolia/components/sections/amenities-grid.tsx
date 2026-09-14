'use client';
import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/journey/motion';
import { useLocale } from '@/components/shared/locale-provider';
import { openPlace } from '@/lib/journey/overlay-store';
import { HouseCard } from '@/components/journey/house-card';

/**
 * Năm tiện ích — nội dung và link tour 360° giữ nguyên của
 * `horizontal-slide.tsx`; chỉ đổi cách trình bày.
 *
 * Trước: một pinned horizontal track riêng, tức là nhịp lướt ngang thứ hai
 * ngay sau chương Sảnh đón — hai lần lướt ngang liền nhau, và năm nơi đó vừa
 * được đi qua ở chương trước.
 *
 * Giờ: khối nội dung `-mt-100svh` TRỒI LÊN ĐÈ lên cảnh đang ghim, cảnh tự mờ
 * đi theo. Không có đường ranh giữa cảnh và nội dung — đúng cơ chế
 * `c-home__cards` của trang mẫu. Card vào theo lô, stagger 0.08s.
 */
const TOURS = [
  'https://themagnolia360.vistax.vn/?s=pano10&/tong-the-01.html',
  'https://themagnolia360.vistax.vn/?s=pano33273&/sanh-don-tiep-pavillion.html',
  'https://themagnolia360.vistax.vn/?s=pano36996&/sanh-don-tiep-pavillion.html',
  'https://themagnolia360.vistax.vn/?s=pano36994&/khu-trung-bay-sieu-xe-tang-b1.html',
  'https://themagnolia360.vistax.vn/?s=pano36997&/vuon-rieng-tang-5.html',
];

const CARDS = [
  '/journey/cards/amenity-1.jpg',
  '/journey/cards/amenity-2.jpg',
  '/journey/cards/amenity-3.jpg',
  '/journey/cards/amenity-4.jpg',
  '/journey/cards/amenity-5.jpg',
];

export function AmenitiesGrid() {
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
      id='amenities'
      ref={ref}
      aria-label={t.amenities.eyebrow}
      className='bg-charcoal-950 relative z-10 -mt-[100svh]'
    >
      <div className='mx-auto max-w-[1440px] px-5 pt-[20svh] pb-[24svh] md:px-8'>
        <h2
          data-heading
          className='font-display text-ivory max-w-[36rem] text-[clamp(1.88rem,3.32vw,3.48rem)] leading-[1.05] tracking-[-0.015em]'
        >
          {locale === 'vi'
            ? 'Năm nơi trên cùng một hành trình'
            : 'Five places on one journey'}
        </h2>

        <ul className='mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:mt-24'>
          {t.amenities.items.map((item, i) => (
            <li key={item.title} data-card>
              <HouseCard
                src={CARDS[i]}
                title={item.title}
                body={item.body}
                chip={t.amenities.eyebrow}
                cta={t.amenities.explore}
                onOpen={() =>
                  openPlace({
                    title: item.title,
                    body: item.body,
                    src: CARDS[i],
                    tour: TOURS[i],
                  })
                }
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
