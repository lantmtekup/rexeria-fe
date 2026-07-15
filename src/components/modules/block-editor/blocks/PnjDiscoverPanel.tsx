/* eslint-disable no-restricted-syntax */
'use client';

/**
 * PNJ · Discover drawer — port từ apps/pnj DiscoverPanel.
 * Portal to document.body; scales `behindRef` content on open (giống HotspotDrawer).
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';

import type { PnjVariantItem } from '../types';
import { useDrawerScrollLock } from './PnjHeroHotspots';

interface Props {
  open: boolean;
  onClose: () => void;
  variants: PnjVariantItem[];
  initialViewKey?: string;
  isMobile: boolean;
  behindRef?: React.RefObject<HTMLElement | null>;
}

const buildViewImages = (
  variants: PnjVariantItem[],
  viewKey: string
): string[] => {
  const primary = variants.find(v => v.key === viewKey);
  const rest = variants.filter(v => v.key !== viewKey).map(v => v.image);
  if (!primary) return variants.map(v => v.image);
  return [primary.image, ...rest.filter(src => src !== primary.image)];
};

export function PnjDiscoverPanel({
  open,
  onClose,
  variants,
  initialViewKey,
  isMobile,
  behindRef,
}: Props) {
  const [viewKey, setViewKey] = React.useState(
    initialViewKey ?? variants[0]?.key ?? ''
  );
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const tlRef = React.useRef<gsap.core.Timeline | null>(null);
  const didInitRef = React.useRef(false);
  const [mounted, setMounted] = React.useState(false);
  const [portalAlive, setPortalAlive] = React.useState(false);

  useDrawerScrollLock(open ? 'pnj-discover' : null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) setPortalAlive(true);
  }, [open]);

  React.useEffect(() => {
    if (!portalAlive) didInitRef.current = false;
  }, [portalAlive]);

  React.useEffect(() => {
    if (!initialViewKey) return;
    setViewKey(initialViewKey);
  }, [initialViewKey]);

  const activeVariant =
    variants.find(v => v.key === viewKey) ?? variants[0] ?? null;
  const slides = activeVariant
    ? buildViewImages(variants, activeVariant.key)
    : [];

  useIsomorphicLayoutEffect(() => {
    if (!portalAlive) return;
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (!backdrop || !panel) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduceMotion ? 0 : 0.55;
    const behind = behindRef?.current ?? null;

    const behindOpen = isMobile
      ? { scale: 0.96, x: 0, borderRadius: 12 }
      : { scale: 0.92, x: -28, borderRadius: 16 };

    tlRef.current?.kill();

    if (!didInitRef.current) {
      gsap.set(backdrop, { autoAlpha: 0 });
      if (isMobile) gsap.set(panel, { yPercent: 100, xPercent: 0 });
      else gsap.set(panel, { xPercent: 100, yPercent: 0 });
      didInitRef.current = true;
      if (!open) return;
    }

    if (behind) {
      gsap.set(behind, {
        transformOrigin: '50% 50%',
        willChange: 'transform',
      });
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut', duration },
      onComplete: () => {
        if (!open) setPortalAlive(false);
      },
    });
    tlRef.current = tl;

    if (open) {
      if (behind) tl.to(behind, { ...behindOpen }, 0);
      tl.to(backdrop, { autoAlpha: 0.5 }, 0);
      if (isMobile) tl.to(panel, { yPercent: 0, xPercent: 0 }, 0);
      else tl.to(panel, { xPercent: 0, yPercent: 0 }, 0);
    } else {
      if (behind)
        tl.to(
          behind,
          {
            scale: 1,
            x: 0,
            borderRadius: 0,
            clearProps: 'transform,borderRadius',
          },
          0
        );
      tl.to(backdrop, { autoAlpha: 0 }, 0);
      if (isMobile) tl.to(panel, { yPercent: 100, xPercent: 0 }, 0);
      else tl.to(panel, { xPercent: 100, yPercent: 0 }, 0);
    }

    return () => {
      tl.kill();
      if (tlRef.current === tl) tlRef.current = null;
    };
  }, [open, isMobile, behindRef, portalAlive]);

  React.useEffect(() => {
    const behind = behindRef?.current;
    return () => {
      if (behind) {
        gsap.set(behind, { clearProps: 'transform,borderRadius,willChange' });
      }
    };
  }, [behindRef]);

  if (!mounted || !portalAlive || variants.length === 0) return null;

  return createPortal(
    <>
      <div
        ref={backdropRef}
        className='fixed inset-0 z-[1900] bg-black'
        style={{ pointerEvents: open ? 'auto' : 'none' }}
        onClick={onClose}
        aria-hidden='true'
        data-lenis-prevent
      />
      <div
        ref={panelRef}
        className={`fixed z-[1950] flex bg-white shadow-2xl ${
          isMobile
            ? 'right-0 bottom-0 left-0 h-[88svh] w-full flex-col rounded-t-2xl'
            : 'top-0 right-0 h-screen w-[80%] flex-row lg:w-[75%]'
        }`}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
        role='dialog'
        aria-modal='true'
        aria-hidden={!open}
        onClick={e => e.stopPropagation()}
        data-lenis-prevent
      >
        <div className='relative min-h-[40vh] min-w-0 flex-1 overflow-hidden bg-neutral-100 md:min-h-full'>
          {slides.length > 0 && (
            <Swiper
              key={viewKey}
              modules={[Navigation, Pagination]}
              navigation={{
                prevEl: '.pnj-discover-prev',
                nextEl: '.pnj-discover-next',
              }}
              pagination={{ clickable: true }}
              className='h-full w-full'
              style={
                {
                  '--swiper-pagination-color': '#1a1a1a',
                } as React.CSSProperties
              }
            >
              {slides.map((src, i) => (
                <SwiperSlide key={`${viewKey}-${i}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${activeVariant?.label ?? 'Chi tiết'} ${i + 1}`}
                    className='h-full w-full object-contain'
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          <button
            type='button'
            aria-label='Ảnh trước'
            className='pnj-discover-prev absolute top-1/2 left-4 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md ring-1 ring-black/10 backdrop-blur-sm transition-colors duration-200 hover:bg-white'
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
            aria-label='Ảnh sau'
            className='pnj-discover-next absolute top-1/2 right-4 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md ring-1 ring-black/10 backdrop-blur-sm transition-colors duration-200 hover:bg-white'
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

        <div className='flex w-full flex-col overflow-y-auto bg-white px-8 py-10 md:w-[420px] lg:w-[460px]'>
          <button
            type='button'
            onClick={onClose}
            data-cta-id='discover-close'
            className='mb-4 self-end p-2 hover:opacity-60'
            aria-label='Đóng'
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
            <span className='text-sm'>
              {activeVariant?.label ?? 'Góc nhìn'}
            </span>
            <div className='flex gap-2'>
              {variants.map(v => (
                <button
                  key={v.key}
                  type='button'
                  onClick={() => setViewKey(v.key)}
                  data-cta-id={`discover-view-${v.key}`}
                  className={`h-6 w-6 overflow-hidden rounded-full border ${
                    viewKey === v.key
                      ? 'border-black ring-1 ring-black ring-offset-2'
                      : 'border-black/20'
                  }`}
                  style={{
                    backgroundImage: `url(${v.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  aria-label={`Chọn ${v.label}`}
                  aria-pressed={viewKey === v.key}
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

          {activeVariant?.highlights.length ? (
            <ul className='mb-6 space-y-2 border-t border-black/10 pt-4 text-sm text-neutral-600'>
              {activeVariant.highlights.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}

          <details className='border-t border-black/10 py-4'>
            <summary className='flex cursor-pointer list-none justify-between text-sm'>
              <span>Chi tiết</span>
              <span className='text-lg leading-none'>+</span>
            </summary>
            <div className='pt-4 text-sm text-neutral-600'>
              <p>REF. EM1006-51Y</p>
              <p className='mt-3'>{activeVariant?.desc}</p>
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
    </>,
    document.body
  );
}
