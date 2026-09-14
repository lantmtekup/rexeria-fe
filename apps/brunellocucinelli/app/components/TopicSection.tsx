'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/motion';
import type { Topic } from '../lib/highlights';
import ArtworkPreview from './ArtworkPreview';
import CardGrid from './CardGrid';

/**
 * Section chủ đề (trang mẫu: c-home__cards) — nối sau mỗi cảnh lướt ngang.
 * margin-top −100svh: trồi lên đè cảnh còn đang ghim; PanelJourney tự làm mờ
 * cảnh theo trigger id của section này. Không nền riêng.
 *
 * Nhịp: tiêu đề chủ đề → artwork (tiêu đề dưới, nếu có) → grid card.
 */
export default function TopicSection({
  id,
  topic,
}: {
  id: string;
  topic: Topic;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
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

      // Artwork + card: vào khung thì lên theo lô, stagger theo hàng.
      const items = gsap.utils.toArray<HTMLElement>(
        '[data-artwork], [data-card]',
        section
      );
      gsap.set(items, { autoAlpha: 0, y: 48 });
      const batch = ScrollTrigger.batch(items, {
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

  return (
    <section
      id={id}
      ref={sectionRef}
      className='relative z-10 -mt-[100svh] px-4 pt-[20svh] pb-[50svh] md:px-8'
    >
      <h2
        data-heading
        className='mx-auto mb-12 max-w-[56rem] text-center text-[36px] leading-[1.1] font-light text-balance text-neutral-900 md:mb-20 md:text-[56px]'
      >
        {topic.title}
      </h2>

      {topic.artwork && (
        <ArtworkPreview
          artwork={topic.artwork}
          titlePosition='bottom'
          className='pb-10 md:pb-14'
        />
      )}

      <CardGrid items={topic.cards} />
    </section>
  );
}
