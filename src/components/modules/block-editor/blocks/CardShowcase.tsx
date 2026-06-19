'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  CardShowcaseContent,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface CardShowcaseProps {
  content: CardShowcaseContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Card Showcase — lưới thẻ (ảnh + tiêu đề + phụ đề) reveal fade-up theo
 * IntersectionObserver, stagger theo index. Mô hình B (tự chạy, vanilla + CSS),
 * tôn trọng `prefers-reduced-motion`. Port từ pattern FeaturedProjects/TeamCards/
 * ClientReviews lặp ~15 tháng CodeGrid.
 */
export function CardShowcase({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: CardShowcaseProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const cards = content.cards ?? [];

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root
        .querySelectorAll<HTMLElement>('[data-card]')
        .forEach(el => el.setAttribute('data-in', ''));
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.setAttribute('data-in', '');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    root
      .querySelectorAll<HTMLElement>('[data-card]')
      .forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [cards.length]);

  return (
    <div
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container relative w-full overflow-hidden rounded-md bg-[#0e0f13] px-6 py-14 duration-500 ease-out @2xl:px-10',
        className
      )}
    >
      {content.title && (
        <h2
          data-element-key='title'
          style={styleOf('title')}
          className={selectableClass(
            activeKey === 'title',
            'mb-8 text-3xl font-bold tracking-tight text-white @2xl:text-5xl'
          )}
        >
          {content.title}
        </h2>
      )}

      <div className='grid grid-cols-1 gap-5 @md:grid-cols-2 @4xl:grid-cols-3'>
        {cards.map((card, i) => (
          <article
            key={i}
            data-card
            style={{ transitionDelay: `${i * 0.08}s` }}
            className='group translate-y-8 opacity-0 transition-[opacity,transform] duration-700 ease-out [&[data-in]]:translate-y-0 [&[data-in]]:opacity-100'
          >
            <div className='relative aspect-[4/3] overflow-hidden rounded-lg bg-white/5'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.imageUrl}
                alt={card.title}
                className='h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105'
                loading='lazy'
              />
            </div>
            <h3 className='mt-3 text-lg font-semibold text-white'>
              {card.title}
            </h3>
            {card.subtitle && (
              <p className='mt-1 text-sm text-white/60'>{card.subtitle}</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
