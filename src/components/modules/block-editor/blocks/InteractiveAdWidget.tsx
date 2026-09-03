'use client';

/**
 * Interactive ad creative — clone tính năng "quảng cáo tương tác" từ
 * 360-admin-cms (xem docs/be-spec-interactive-ad-creative-2026-07-02.md).
 * Một block atomic: nhiều slide, mỗi slide có ảnh/video nền + hotspot định vị
 * theo % (component `Hotspot` bên dưới, phỏng theo `MintDiscover.tsx`) + nút
 * CTA. Carousel dùng lại đúng thiết lập Swiper của `ImageCarousel.tsx`.
 *
 * Tracking: bắn 6 loại event qua `tracker.emit()` có sẵn (không dựng tracker
 * riêng) — ad_impression (mount), ad_viewable (IntersectionObserver riêng,
 * ngưỡng ≥50%/≥1000ms, khác ngưỡng chung của `useBlockTracking`), ad_interaction
 * (đổi slide), ad_cta_click (bấm hotspot/CTA), ad_close, ad_outbound (điều
 * hướng ra ngoài — flush bằng sendBeacon trước khi navigate). Hotspot/CTA
 * dùng `data-element-id` + `data-element-role='cta'` (KHÔNG phải
 * `data-rexer-cta` như bản gốc MintDiscover từng copy nhầm từ code-template —
 * đó là convention khác, không được `useBlockTracking()` bắt).
 */
import * as React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper/types';
import { X } from 'lucide-react';

import { cn } from '@/lib/cn';
import { tracker } from '@/lib/analytics/tracker';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  InteractiveAdWidgetContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface InteractiveAdWidgetProps {
  content: InteractiveAdWidgetContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Chấm định vị theo % — phỏng theo `MintDiscover.tsx` Hotspot, đổi sang
 * `data-element-id` để `useBlockTracking()`/click-capture bắt được đúng. */
function Hotspot({
  xPct,
  yPct,
  label,
  id,
  onClick,
}: {
  xPct: number;
  yPct: number;
  label: string;
  id: string;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      data-element-id={id}
      data-element-role='cta'
      onClick={onClick}
      className='group absolute flex -translate-x-1/2 -translate-y-1/2 items-center'
      style={{ left: `${xPct}%`, top: `${yPct}%`, touchAction: 'manipulation' }}
      aria-label={label}
    >
      <span className='relative flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm ring-2 ring-white/40 transition-transform duration-300 group-hover:scale-125'>
        <span className='block h-1.5 w-1.5 rounded-full bg-violet-600' />
      </span>
      {label ? (
        <span className='text-2xs ml-3 -translate-x-1 rounded-full bg-black/70 px-3 py-1 whitespace-nowrap text-white opacity-0 shadow-sm transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100'>
          {label}
        </span>
      ) : null}
    </button>
  );
}

export function InteractiveAdWidget({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: InteractiveAdWidgetProps) {
  const slides = Array.isArray(content.slides) ? content.slides : [];
  const autoplayMs = content.autoplayMs ?? 0;
  const closeable = content.closeable ?? true;

  const [closed, setClosed] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const viewableFiredRef = React.useRef(false);
  const impressionFiredRef = React.useRef(false);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  // ad_impression — once per mount.
  React.useEffect(() => {
    if (impressionFiredRef.current) return;
    impressionFiredRef.current = true;
    tracker.emit({ event_type: 'ad_impression' });
  }, []);

  // ad_viewable — own IntersectionObserver, ≥50% area sustained ≥1000ms.
  // Deliberately not reusing useBlockTracking's 250ms/no-dwell threshold —
  // "viewable" here follows the ad-industry MRC definition, a different bar.
  React.useEffect(() => {
    const el = rootRef.current;
    if (
      !el ||
      viewableFiredRef.current ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }
    let timer: ReturnType<typeof setTimeout> | null = null;
    const io = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry.intersectionRatio >= 0.5) {
          timer = setTimeout(() => {
            if (viewableFiredRef.current) return;
            viewableFiredRef.current = true;
            tracker.emit({ event_type: 'ad_viewable' });
            io.disconnect();
          }, 1000);
        } else if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleSlideChange = (swiper: SwiperInstance) => {
    tracker.emit({
      event_type: 'ad_interaction',
      action: 'slide_change',
      meta: { dimensions: { slide_index: swiper.realIndex } },
    });
  };

  const handleCtaClick = (
    slideIndex: number,
    kind: 'hotspot' | 'cta',
    elementId: string,
    href: string
  ) => {
    tracker.emit({
      event_type: 'ad_cta_click',
      element_id: elementId,
      element_role: 'cta',
      meta: {
        dimensions: { slide_index: slideIndex, kind, cta_id: elementId },
      },
    });
    if (!href || href === '#') return;
    // ad_outbound — flush via sendBeacon before the browser navigates away;
    // a plain fetch() here would be cancelled mid-flight by the navigation.
    tracker.emit({ event_type: 'ad_outbound', element_id: elementId });
    tracker.flush(true);
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    tracker.emit({ event_type: 'ad_close' });
    setClosed(true);
  };

  if (closed) return null;

  return (
    <div
      ref={rootRef}
      className={cn(
        '@container relative flex flex-col bg-neutral-950 text-white',
        className
      )}
      style={blockBackgroundStyle(background)}
    >
      <div
        data-element-key='slides'
        className={selectableClass(activeKey === 'slides', 'relative')}
        style={styleOf('slides')}
      >
        {closeable ? (
          <button
            type='button'
            onClick={handleClose}
            aria-label='Đóng quảng cáo'
            className='absolute top-3 right-3 z-20 inline-flex size-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70'
          >
            <X className='size-4' />
          </button>
        ) : null}

        {slides.length === 0 ? (
          <div className='flex aspect-[16/9] items-center justify-center bg-white/5 text-xs text-white/40'>
            Chưa có slide. Thêm slide trong sidebar để dựng quảng cáo.
          </div>
        ) : (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            slidesPerView={1}
            spaceBetween={0}
            loop={slides.length > 1}
            pagination={slides.length > 1 ? { clickable: true } : false}
            autoplay={
              autoplayMs > 0
                ? { delay: autoplayMs, disableOnInteraction: false }
                : false
            }
            speed={500}
            onSlideChange={handleSlideChange}
            className='!aspect-[16/9] w-full'
          >
            {slides.map((slide, slideIndex) => (
              <SwiperSlide key={slide.id}>
                <div className='relative size-full'>
                  {slide.backgroundType === 'video' ? (
                    <video
                      src={slide.backgroundUrl}
                      className='size-full object-cover'
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={slide.backgroundUrl}
                      alt=''
                      className='size-full object-cover'
                    />
                  )}

                  {slide.hotspots.map(h => {
                    const cta = slide.ctas.find(c => c.id === h.ctaId);
                    return (
                      <Hotspot
                        key={h.id}
                        id={h.id}
                        xPct={h.xPct}
                        yPct={h.yPct}
                        label={h.label}
                        onClick={() =>
                          handleCtaClick(
                            slideIndex,
                            'hotspot',
                            h.id,
                            cta?.href ?? ''
                          )
                        }
                      />
                    );
                  })}

                  {slide.ctas.length > 0 ? (
                    <div className='absolute right-0 bottom-4 left-0 flex flex-wrap justify-center gap-2 px-4'>
                      {slide.ctas.map(c => (
                        <button
                          key={c.id}
                          type='button'
                          data-element-id={c.id}
                          data-element-role='cta'
                          onClick={() =>
                            handleCtaClick(slideIndex, 'cta', c.id, c.href)
                          }
                          className={cn(
                            'rounded-full px-5 py-2 text-sm font-semibold transition-colors',
                            c.style === 'secondary'
                              ? 'border border-white/70 bg-transparent text-white hover:bg-white/10'
                              : 'bg-violet-600 text-white hover:bg-violet-500'
                          )}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
}
