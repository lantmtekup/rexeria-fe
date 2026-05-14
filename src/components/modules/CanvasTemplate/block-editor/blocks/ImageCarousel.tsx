'use client';

import * as React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  ImageCarouselContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

// Swiper CSS — must be imported once. Subsequent uses are free.
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ImageCarouselProps {
  content: ImageCarouselContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function ImageCarousel({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: ImageCarouselProps) {
  const slides = content.slides ?? [];
  const showNav = content.showNavArrows ?? true;
  const showPag = content.showPagination ?? true;
  const autoplayMs = content.autoplayMs ?? 0;

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  return (
    <div
      className={cn(
        'flex flex-col gap-4 bg-neutral-950 px-6 py-8 text-white',
        className
      )}
      style={blockBackgroundStyle(background)}
    >
      {/* Optional header (eyebrow + title + description) */}
      {(content.eyebrow || content.title || content.description) && (
        <header className='flex flex-col gap-1.5'>
          {content.eyebrow ? (
            <p
              data-element-key='eyebrow'
              className={selectableClass(
                activeKey === 'eyebrow',
                'text-[11px] tracking-[0.18em] text-white/60 uppercase'
              )}
              style={styleOf('eyebrow')}
            >
              {content.eyebrow}
            </p>
          ) : null}
          {content.title ? (
            <h2
              data-element-key='title'
              className={selectableClass(
                activeKey === 'title',
                'text-2xl leading-tight font-semibold'
              )}
              style={styleOf('title')}
            >
              {content.title}
            </h2>
          ) : null}
          {content.description ? (
            <p
              data-element-key='description'
              className={selectableClass(
                activeKey === 'description',
                'max-w-2xl text-sm text-white/70'
              )}
              style={styleOf('description')}
            >
              {content.description}
            </p>
          ) : null}
        </header>
      )}

      {/* Carousel */}
      <div
        data-element-key='slides'
        className={selectableClass(activeKey === 'slides', 'relative')}
        style={styleOf('slides')}
      >
        {slides.length === 0 ? (
          <div className='flex aspect-[16/9] items-center justify-center rounded-md bg-white/5 text-xs text-white/40'>
            Chưa có slide. Bấm “Slides” trong sidebar để thêm.
          </div>
        ) : (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            slidesPerView={1}
            spaceBetween={0}
            loop={slides.length > 1}
            navigation={
              showNav && slides.length > 1
                ? {
                    nextEl: '.rx-carousel-next',
                    prevEl: '.rx-carousel-prev',
                  }
                : false
            }
            pagination={
              showPag && slides.length > 1
                ? { clickable: true, type: 'fraction' }
                : false
            }
            autoplay={
              autoplayMs && autoplayMs > 0
                ? { delay: autoplayMs, disableOnInteraction: false }
                : false
            }
            speed={600}
            className='!aspect-[16/9] w-full rounded-md'
          >
            {slides.map(s => (
              <SwiperSlide key={s.id}>
                <div className='relative size-full'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.imageUrl}
                    alt={s.altText || s.caption || ''}
                    className='size-full object-cover'
                  />
                  {s.caption ? (
                    <div className='absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent px-6 py-4'>
                      <p className='text-sm font-medium'>{s.caption}</p>
                    </div>
                  ) : null}
                </div>
              </SwiperSlide>
            ))}
            {showNav && slides.length > 1 ? (
              <>
                <button
                  type='button'
                  className='rx-carousel-prev absolute top-1/2 left-3 z-10 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60'
                  aria-label='Slide trước'
                >
                  <ChevronLeft className='size-4' />
                </button>
                <button
                  type='button'
                  className='rx-carousel-next absolute top-1/2 right-3 z-10 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60'
                  aria-label='Slide tiếp'
                >
                  <ChevronRight className='size-4' />
                </button>
              </>
            ) : null}
          </Swiper>
        )}
      </div>
    </div>
  );
}
