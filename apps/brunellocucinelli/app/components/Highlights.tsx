'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/motion';
import type { Highlight } from '../lib/highlights';
import ArtworkPreview from './ArtworkPreview';
import CardGrid from './CardGrid';
import { openStory } from '../lib/story';

// Card nổi bật bắt đầu lệch xuống thêm chừng này × chiều cao màn rồi trồi về 0
// (hết khi mép trên section chạm mép trên màn). Hero đọc để biết lúc card ló.
export const FEATURED_RISE = 0.2;

type HighlightsProps = { items: Highlight[]; artwork?: Highlight | null };

/**
 * Section nối sau Hero. margin-top -100svh: nó bắt đầu trồi lên khi hero còn
 * ghim ở khung nhà (hero tự mờ theo trigger #highlights). Không có nền riêng —
 * nền trang cùng màu #F8F8F6 nên hero mờ xong là liền một mảng.
 *
 * Nhịp: card nổi bật (ảnh 01) lên giữa màn → heading → grid các card còn lại.
 */
export default function Highlights({ items, artwork }: HighlightsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [featured, ...rest] = items;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const featuredCard = section.querySelector<HTMLElement>('[data-featured]');
    const featuredInner = section.querySelector<HTMLElement>(
      '[data-featured-inner]'
    );
    const heading = section.querySelector<HTMLElement>('[data-heading]');
    const cards = gsap.utils.toArray<HTMLElement>(
      '[data-card], [data-artwork]',
      section
    );
    if (!featuredCard || !featuredInner || !heading) return;

    const mm = gsap.matchMedia(section);
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Card nổi bật: vừa đi theo scroll vừa tự trồi thêm (y lệch dần về 0)
      // và phóng nhẹ — cảm giác card "đi lên" chứ không chỉ bị cuộn tới.
      // fromTo + scrub để cuộn ngược trả đúng trạng thái đầu.
      gsap.fromTo(
        featuredCard,
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

      // Rời card nổi bật để xuống grid: lùi nhẹ ra sau. Ghi lên lớp trong —
      // lớp ngoài đang do tween trồi lên giữ scale, hai scrub cùng một
      // thuộc tính trên cùng element sẽ giành nhau.
      gsap.fromTo(
        featuredInner,
        { scale: 1 },
        {
          scale: 0.94,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: featuredCard,
            start: 'bottom 85%',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

      gsap.fromTo(
        heading,
        { autoAlpha: 0, y: 32 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: heading, start: 'top 85%', once: true },
        }
      );

      // Grid: card vào khung thì lên theo lô, stagger theo hàng.
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

      return () => batch.forEach(t => t.kill());
    });

    return () => mm.revert();
  }, []);

  if (!featured) return null;

  return (
    <section
      id='highlights'
      ref={sectionRef}
      className='relative z-10 -mt-[100svh] px-4 pt-[6.25rem] pb-24 md:px-8'
    >
      {/* Card nổi bật — vừa khít một màn: bề ngang chặn theo chiều cao màn
          (trừ header ~6.25rem, caption 6rem, chừa đáy 2rem) theo tỉ lệ ảnh. */}
      <div
        data-featured
        className='mx-auto will-change-transform'
        style={{
          width: `min(52.875rem, 100%, calc((100svh - 14.25rem) * ${featured.w} / ${featured.h}))`,
        }}
      >
        <article
          data-featured-inner
          role='button'
          tabIndex={0}
          aria-label={featured.title}
          onClick={openStory}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openStory();
            }
          }}
          className='group cursor-pointer bg-white'
        >
          <div
            className='relative w-full overflow-hidden'
            style={{ aspectRatio: `${featured.w} / ${featured.h}` }}
          >
            <Image
              src={featured.src}
              alt={featured.title}
              fill
              sizes='(max-width: 767px) 100vw, 846px'
              className='object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]'
            />
          </div>
          <p className='flex h-24 items-center justify-center px-6 text-center text-[17px] leading-snug text-neutral-900'>
            {featured.title}
          </p>
        </article>
      </div>

      <header
        data-heading
        className='mt-20 mb-10 text-center md:mt-28 md:mb-14'
      >
        <p className='font-ui text-[11px] tracking-[0.3em] text-neutral-800 uppercase md:text-[13px]'>
          Brunello Cucinelli
        </p>
        <h2 className='text-[48px] leading-none font-light text-[#8a8a88] md:text-[72px]'>
          Highlights
        </h2>
      </header>

      <CardGrid items={rest} />

      {/* Artwork — hàng riêng dưới grid, không nằm trong flex của card. */}
      {artwork && <ArtworkPreview artwork={artwork} />}
    </section>
  );
}
