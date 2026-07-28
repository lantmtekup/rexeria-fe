'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import gsap from 'gsap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';
import { useDrawerScrollLock, useIsMobile } from './ProductHotspotUI';

type ViewKey = 'dial' | 'profile' | 'caseback';

interface ViewImages {
  dial: string[];
  profile: string[];
  caseback: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  initialView?: ViewKey;
  images: ViewImages;
  /** Content behind the drawer — scales down + nudges left on open. */
  behindRef?: RefObject<HTMLElement | null>;
}

// Side-drawer detail panel with per-view image swiper. Slides in from
// right; scales behind content like HotspotDrawer; locks scroll via Lenis.
export default function DiscoverPanel({
  open,
  onClose,
  initialView = 'dial',
  images,
  behindRef,
}: Props) {
  const [view, setView] = useState<ViewKey>(initialView);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const didInitRef = useRef(false);
  const isMobile = useIsMobile();

  useDrawerScrollLock(open ? 'discover' : null);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useIsomorphicLayoutEffect(() => {
    const behind = behindRef?.current ?? null;
    if (!behind) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduceMotion ? 0 : 0.55;

    const behindOpen = isMobile
      ? { scale: 0.96, x: 0, borderRadius: 12 }
      : { scale: 0.92, x: -28, borderRadius: 16 };

    tlRef.current?.kill();

    // First paint / reload: keep behind idle — panel is CSS-hidden via opacity-0
    // + translate-x-full, so no FOUC of DiscoverPanel.
    if (!open && !didInitRef.current) {
      didInitRef.current = true;
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut', duration },
    });
    tlRef.current = tl;

    if (open) {
      gsap.set(behind, {
        transformOrigin: '50% 50%',
        willChange: 'transform',
      });
      tl.to(behind, { ...behindOpen }, 0);
    } else {
      tl.to(
        behind,
        {
          scale: 1,
          x: 0,
          borderRadius: 0,
          clearProps: 'transform,borderRadius,willChange',
        },
        0
      );
    }

    didInitRef.current = true;

    return () => {
      tl.kill();
      if (tlRef.current === tl) tlRef.current = null;
    };
  }, [open, isMobile, behindRef]);

  useEffect(() => {
    return () => {
      const behind = behindRef?.current;
      if (behind) {
        gsap.set(behind, { clearProps: 'transform,borderRadius,willChange' });
      }
    };
  }, [behindRef]);

  const viewList: ViewKey[] = ['dial', 'profile', 'caseback'];
  const viewLabel: Record<ViewKey, string> = {
    dial: 'Mặt số',
    profile: 'Góc nghiêng',
    caseback: 'Mặt sau',
  };

  return (
    <div
      className={`content-discover fixed inset-0 z-[1999] bg-black/50 transition-opacity duration-300 ${
        open
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0'
      }`}
      onClick={onClose}
      data-lenis-prevent
    >
      <div
        className={`absolute top-0 right-0 flex h-full w-full flex-col bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:w-[80%] md:flex-row lg:w-[75%] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role='dialog'
        aria-modal='true'
        aria-hidden={!open}
        onClick={e => e.stopPropagation()}
      >
        <div className='relative min-h-[40vh] min-w-0 flex-1 overflow-hidden bg-neutral-100 md:min-h-full'>
          <Swiper
            key={view}
            modules={[Navigation, Pagination]}
            navigation={{
              prevEl: '.discover-prev',
              nextEl: '.discover-next',
            }}
            pagination={{ clickable: true }}
            className='h-full w-full'
            style={
              { '--swiper-pagination-color': '#1a1a1a' } as React.CSSProperties
            }
          >
            {images[view].map((src, i) => (
              <SwiperSlide key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${viewLabel[view]} ${i + 1}`}
                  className='h-full w-full object-contain'
                />
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            type='button'
            aria-label='Previous image'
            className='discover-prev absolute top-1/2 left-4 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md ring-1 ring-black/10 backdrop-blur-sm transition-colors duration-200 hover:bg-white'
          >
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none'>
              <path
                d='M15 6l-6 6 6 6'
                stroke='currentColor'
                strokeWidth='1.75'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
          <button
            type='button'
            aria-label='Next image'
            className='discover-next absolute top-1/2 right-4 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md ring-1 ring-black/10 backdrop-blur-sm transition-colors duration-200 hover:bg-white'
          >
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none'>
              <path
                d='M9 6l6 6-6 6'
                stroke='currentColor'
                strokeWidth='1.75'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        </div>

        <div
          className='flex w-full flex-col overflow-y-auto bg-white px-8 py-10 md:w-[420px] lg:w-[460px]'
          data-lenis-prevent
        >
          <button
            type='button'
            onClick={onClose}
            data-cta-id='discover-close'
            className='mb-4 self-end p-2 hover:opacity-60'
            aria-label='Close'
          >
            <svg width='14' height='14' viewBox='0 0 16 16' fill='none'>
              <line x1='0.65' y1='14.65' x2='14.79' y2='0.5' stroke='black' />
              <line x1='1.35' y1='0.65' x2='15.5' y2='14.79' stroke='black' />
            </svg>
          </button>

          <div className='mb-2 flex items-start justify-between gap-4'>
            <h2 className='text-2xl leading-tight font-light tracking-tight text-[#003468] md:text-[26px]'>
              Citizen L Arcly Nữ
            </h2>
            <span className='mt-1 shrink-0 border border-[#003468]/20 px-3 py-1.5 text-[10px] tracking-[0.18em] whitespace-nowrap text-[#003468] uppercase'>
              Eco-Drive
            </span>
          </div>
          <p className='mb-8 text-sm text-neutral-500'>
            Dây kim loại · Vỏ thép không gỉ · Mặt kính sapphire
          </p>

          <div className='flex items-center justify-between border-t border-black/10 py-5'>
            <span className='text-sm'>{viewLabel[view]}</span>
            <div className='flex gap-2'>
              {viewList.map(c => (
                <button
                  key={c}
                  type='button'
                  onClick={() => setView(c)}
                  data-cta-id={`discover-view-${c}`}
                  className={`h-6 w-6 overflow-hidden rounded-full border ${
                    view === c
                      ? 'border-black ring-1 ring-black ring-offset-2'
                      : 'border-black/20'
                  }`}
                  style={{
                    backgroundImage: `url(${images[c][0]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  aria-label={`Chọn ${viewLabel[c]}`}
                />
              ))}
            </div>
          </div>

          <div className='flex items-start justify-between gap-6 border-t border-black/10 py-5 text-sm'>
            <span className='shrink-0'>Thông số</span>
            <span className='text-right text-neutral-700'>
              Máy Eco-Drive · Kính sapphire · Dây kim loại
            </span>
          </div>

          <div className='mb-8 flex items-center justify-between border-t border-b border-black/10 py-5 text-sm'>
            <span>Xuất xứ</span>
            <span className='text-neutral-700'>Nhật Bản</span>
          </div>

          <div className='mb-2' />

          <details className='border-t border-black/10 py-4'>
            <summary className='flex cursor-pointer list-none justify-between text-sm'>
              <span>Chi tiết</span>
              <span className='text-lg leading-none'>+</span>
            </summary>
            <div className='pt-4 text-sm text-neutral-600'>
              <p>REF. EM1006-51Y</p>
              <ul className='mt-2 list-inside list-disc space-y-1'>
                <li>Công nghệ Eco-Drive (năng lượng ánh sáng)</li>
                <li>Vỏ thép không gỉ hai tông màu</li>
                <li>Mặt số xà cừ hồng với họa tiết hoa</li>
                <li>Kim cương vạch giờ và ba viên kim cương nổi</li>
                <li>Mặt kính sapphire chống trầy</li>
                <li>Dây kim loại liên kết</li>
              </ul>
            </div>
          </details>
          <details className='border-t border-black/10 py-4'>
            <summary className='flex cursor-pointer list-none justify-between text-sm'>
              <span>Chất liệu</span>
              <span className='text-lg leading-none'>+</span>
            </summary>
            <p className='pt-4 text-sm text-neutral-600'>
              Thép không gỉ bạc và vàng hồng, mặt số xà cừ, kính sapphire. Hoàn
              thiện bóng cao cấp phù hợp trang phục hàng ngày và sự kiện.
            </p>
          </details>
          <details className='border-t border-b border-black/10 py-4'>
            <summary className='flex cursor-pointer list-none justify-between text-sm'>
              <span>Bảo hành</span>
              <span className='text-lg leading-none'>+</span>
            </summary>
            <p className='pt-4 text-sm text-neutral-600'>
              Bảo hành chính hãng Citizen tại hệ thống PNJ. Liên hệ cửa hàng gần
              nhất để được tư vấn kích thước và đặt hàng.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
