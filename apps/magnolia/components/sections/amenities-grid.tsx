'use client';
import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/journey/motion';
import { useLocale } from '@/components/shared/locale-provider';
import { openPlace } from '@/lib/journey/overlay-store';

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
      className='bg-charcoal-950 relative z-10 -mt-[100svh] px-5 pt-[22svh] pb-[26svh] md:px-8'
    >
      <p className='text-champagne-400 text-center text-[10.5px] tracking-luxe uppercase md:text-[11.5px]'>
        {t.amenities.eyebrow}
      </p>
      <h2
        data-heading
        className='font-display text-ivory mx-auto mt-6 mb-14 max-w-[44rem] text-center text-[clamp(2.1rem,3.4vw,3.4rem)] leading-[1.1] text-balance md:mb-20'
      >
        {locale === 'vi'
          ? 'Năm nơi trên cùng một hành trình'
          : 'Five places on one journey'}
      </h2>

      <ul className='mx-auto flex max-w-[75.5rem] flex-wrap justify-center gap-4'>
        {t.amenities.items.map((item, i) => (
          <li
            key={item.title}
            data-card
            className='border-charcoal-700 bg-charcoal-900 flex w-full flex-col border sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]'
          >
            <button
              type='button'
              onClick={() =>
                openPlace({
                  title: item.title,
                  body: item.body,
                  src: CARDS[i],
                  tour: TOURS[i],
                })
              }
              className='group flex h-full w-full flex-col text-left'
            >
              <span className='relative block aspect-[1176/936] w-full overflow-hidden'>
                <Image
                  src={CARDS[i]}
                  alt={item.title}
                  fill
                  sizes='(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 392px'
                  className='object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.04]'
                />
              </span>
              <span className='flex flex-1 flex-col gap-2 px-7 py-7'>
                <span className='font-display text-ivory text-[22px] leading-tight'>
                  {item.title}
                </span>
                <span className='text-champagne-50/60 text-[13px] leading-[1.6]'>
                  {item.body}
                </span>
                <span className='text-champagne-400 mt-3 text-[10.5px] tracking-luxe uppercase group-hover:underline'>
                  {t.amenities.explore}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
