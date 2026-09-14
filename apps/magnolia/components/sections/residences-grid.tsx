'use client';
import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/journey/motion';
import { useLocale } from '@/components/shared/locale-provider';
import { openPlace } from '@/lib/journey/overlay-store';
import { HouseCard } from '@/components/journey/house-card';

/**
 * Căn hộ — nội dung giữ nguyên của `units.tsx`; đổi cách trình bày.
 *
 * Trước: một pinned horizontal track nữa (track thứ ba của trang, sau hai
 * chương lướt ngang) cộng một khối ImageStagger riêng.
 *
 * Giờ dùng hai cơ chế của trang mẫu:
 *   - CARD NỔI BẬT trồi lên: bắt đầu lệch xuống 0.2 chiều cao màn với
 *     scale 0.92 rồi trồi về đúng chỗ theo scroll — cảm giác card "đi lên"
 *     chứ không chỉ bị cuộn tới. Rời nó thì lớp TRONG lùi về 0.94 như lùi ra
 *     sau. Hai tween phải ghi lên hai lớp khác nhau: hai scrub cùng ghi
 *     `scale` lên một element sẽ giành nhau.
 *   - LƯỚI CARD vào theo lô, stagger 0.08s, mỗi card mở lớp phủ khi bấm.
 *
 * Dải ba ảnh dọc giữ nhịp lệch tầng của ImageStagger cũ bằng `mt` xen kẽ.
 */
const UNIT_CARDS: Record<string, string> = {
  '3 Bedroom': '/images/assets/units/card-3br.webp',
  Penthouse: '/images/assets/units/card-penthouse.webp',
  Duplex: '/images/assets/units/card-duplex.webp',
};

/** Từ điển chỉ có tiêu đề cho mỗi loại căn; phần mô tả viết ở đây như bản cũ. */
const UNIT_BODY: Record<'vi' | 'en', Record<string, string>> = {
  vi: {
    '3 Bedroom':
      'Phòng khách hướng sông, mặt bằng sâu — bố cục dành cho một gia đình đang lớn lên cùng căn nhà.',
    Penthouse:
      'Tầng trên cùng, nhìn qua thành phố. Không gian mở tối đa và một tầm nhìn không bị chắn.',
    Duplex:
      'Hai tầng nối bằng thang riêng: khu sinh hoạt và khu nghỉ tách nhau rõ ràng trong cùng một căn.',
  },
  en: {
    '3 Bedroom':
      'A river-facing living room and a deep plan — laid out for a family growing into the home.',
    Penthouse:
      'The top floor, over the city. Maximum open volume and an unobstructed view.',
    Duplex:
      'Two levels joined by a private stair: living and resting clearly apart within one residence.',
  },
};

const STRIPS = [
  { src: '/images/assets/units/strip-1.webp', aspect: '1800 / 2388' },
  { src: '/images/assets/units/strip-2.webp', aspect: '1800 / 1167' },
  { src: '/images/assets/units/strip-3.webp', aspect: '1800 / 2388' },
];

const TOWNHOUSE = '/images/assets/units/townhouse-hero.webp';
const FEATURED_RISE = 0.2;

export function ResidencesGrid() {
  const { t, locale } = useLocale();
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;

    const mm = gsap.matchMedia(section);
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const card = section.querySelector<HTMLElement>('[data-featured]');
      const inner = section.querySelector<HTMLElement>('[data-featured-inner]');

      if (card && inner) {
        // fromTo + scrub để cuộn ngược trả đúng trạng thái đầu.
        gsap.fromTo(
          card,
          { y: () => window.innerHeight * FEATURED_RISE, scale: 0.92 },
          {
            y: 0,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'top top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
        gsap.fromTo(
          inner,
          { scale: 1 },
          {
            scale: 0.94,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: card,
              start: 'bottom 85%',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }

      const heads = gsap.utils.toArray<HTMLElement>('[data-heading]', section);
      heads.forEach(h =>
        gsap.fromTo(
          h,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: h, start: 'top 85%', once: true },
          }
        )
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

  const townhouseBody =
    locale === 'vi'
      ? 'Bộ sưu tập giới hạn: nhà phố thấp tầng trong lòng dự án, có sân riêng và lối vào riêng — số lượng đếm trên đầu ngón tay.'
      : 'A limited edition: low-rise townhouses inside the development, each with its own courtyard and private entrance — a handful in total.';

  return (
    <section
      id='units'
      ref={ref}
      aria-labelledby='units-heading'
      className='bg-charcoal-950 relative'
    >
      <div className='mx-auto max-w-[1440px] px-5 pt-[14svh] pb-[22svh] md:px-8'>
        <h2
          id='units-heading'
          data-heading
          className='font-display text-ivory max-w-[36rem] text-[clamp(1.88rem,3.32vw,3.48rem)] leading-[1.05] tracking-[-0.015em]'
        >
          {locale === 'vi' ? (
            <>
              Không gian sống được
              <br />
              tinh chỉnh
            </>
          ) : (
            t.units.heading
          )}
        </h2>

        {/* Card nổi bật — The Townhouse, dùng cơ chế trồi lên của trang mẫu. */}
        <div data-featured className='mt-16 will-change-transform md:mt-24'>
          <div data-featured-inner>
            <HouseCard
              src={TOWNHOUSE}
              title={t.units.hero.title}
              body={townhouseBody}
              chip={t.units.hero.eyebrow}
              cta={t.units.hero.explore}
              aspect='3200 / 1500'
              eager
              onOpen={() =>
                openPlace({
                  title: t.units.hero.title,
                  body: townhouseBody,
                  src: TOWNHOUSE,
                })
              }
            />
          </div>
        </div>

        {/* Câu chốt hai dòng — `t.units.divider`. */}
        <p
          data-heading
          className='font-display text-ivory/85 mx-auto mt-28 max-w-[40rem] text-center text-[clamp(1.6rem,2.8vw,2.6rem)] leading-[1.24] italic md:mt-36'
        >
          {t.units.divider[0]}
          <br />
          {t.units.divider[1]}
        </p>

        {/* Ba loại căn. */}
        <ul className='mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:mt-28'>
          {t.units.types.map(({ title }) => (
            <li key={title} data-card>
              <HouseCard
                src={UNIT_CARDS[title]}
                title={title}
                body={UNIT_BODY[locale][title]}
                cta={t.units.explore}
                aspect='1400 / 933'
                onOpen={() =>
                  openPlace({
                    title,
                    body: UNIT_BODY[locale][title] ?? '',
                    src: UNIT_CARDS[title],
                  })
                }
              />
            </li>
          ))}
        </ul>

        {/* Dải ba ảnh dọc — giữ nhịp lệch tầng của ImageStagger cũ. */}
        <div className='mt-28 grid grid-cols-1 gap-5 sm:grid-cols-3 md:mt-36'>
          {STRIPS.map(({ src, aspect }, i) => (
            <div
              key={src}
              data-card
              className={i === 1 ? 'sm:mt-24' : i === 2 ? 'sm:mt-12' : ''}
            >
              <span
                className='relative block w-full overflow-hidden'
                style={{ aspectRatio: aspect }}
              >
                <Image
                  src={src}
                  alt={t.units.divider.join(' \u00b7 ')}
                  fill
                  sizes='(max-width: 639px) 100vw, 33vw'
                  className='object-cover'
                />
                <span aria-hidden className='bg-panel-scrim absolute inset-0' />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
