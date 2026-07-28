'use client';

/**
 * Mint · Discover drawer — port từ apps/mintcoin DiscoverPanel.
 * Portal vào device frame (preview) hoặc document.body (/p) để không bị clip
 * bởi @container trên block root; scroll-lock frame-aware; scale `behindRef`
 * khi mở (giống PnjDiscoverPanel).
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';

import type {
  ElementStylesMap,
  MintDiscoverInfo,
  MintVariantItem,
} from '../types';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import { elementStyleOf } from './applyStyle';
import { useDrawerScrollLock } from './PnjHeroHotspots';

/** Fallback khi content cũ (seed trước drawer CMS) chưa có `discover`. */
export const DISCOVER_FALLBACK: MintDiscoverInfo = {
  title: 'The Jack Pine by Tom Thomson — 1 Kilo Pure Gold Coin',
  badge: 'Mintage 75',
  subtitle: '99.99% Pure Gold · Proof',
  dimensions: 'Weight: 1006.1 g / Diameter: 101.6 mm / Edge: Serrated',
  faceValue: 'CAD $2,500',
  detailsText: 'REF. 252469\nComposition: 99.99% pure gold\nFinish: proof',
  packagingText:
    'Encapsulated and presented in a Royal Canadian Mint-branded wooden case with black beauty box.',
  shippingText:
    'Shipped fully insured. International availability subject to Royal Canadian Mint regional policies.',
};

interface Props {
  open: boolean;
  onClose: () => void;
  variants: MintVariantItem[];
  discover?: MintDiscoverInfo;
  initialViewKey?: string;
  isMobile: boolean;
  behindRef?: React.RefObject<HTMLElement | null>;
  /** Style override từ toolbar (áp cho field drawer khi mở ở preview/live). */
  styles?: ElementStylesMap;
}

export function MintDiscoverPanel({
  open,
  onClose,
  variants,
  discover,
  initialViewKey,
  isMobile,
  behindRef,
  styles,
}: Props) {
  // Merge theo field (xem MintVariants) — tránh mất field khi content thiếu.
  const info = { ...DISCOVER_FALLBACK, ...discover };
  const styleOf = (key: string) => elementStyleOf(styles, key);
  const [viewKey, setViewKey] = React.useState(
    initialViewKey ?? variants[0]?.key ?? ''
  );
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const tlRef = React.useRef<gsap.core.Timeline | null>(null);
  const didInitRef = React.useRef(false);
  const [mounted, setMounted] = React.useState(false);
  const [portalAlive, setPortalAlive] = React.useState(false);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);

  useDrawerScrollLock(open ? 'mint-discover' : null, isMobile);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useLayoutEffect(() => {
    if (!mounted) return;
    setPortalHost(resolveDrawerPortalHost(behindRef?.current ?? null));
  }, [mounted, behindRef, open]);

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

  if (!mounted || !portalAlive || !portalHost || variants.length === 0)
    return null;

  const inFrame = isDeviceFrameHost(portalHost);
  const posClass = inFrame ? 'absolute' : 'fixed';

  return createPortal(
    <>
      <div
        ref={backdropRef}
        className={`${posClass} inset-0 z-[1900] bg-black`}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
        onClick={onClose}
        aria-hidden='true'
        data-lenis-prevent
      />
      <div
        ref={panelRef}
        className={`${posClass} z-[1950] flex bg-white shadow-2xl ${
          isMobile
            ? 'right-0 bottom-0 left-0 h-[88%] max-h-[88svh] w-full flex-col rounded-t-2xl'
            : 'top-0 right-0 h-full w-[80%] flex-row @4xl:w-[75%]'
        }`}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
        role='dialog'
        aria-modal='true'
        aria-hidden={!open}
        onClick={e => e.stopPropagation()}
        data-lenis-prevent
      >
        {/* 1:1 — mỗi item (view) đúng 1 ảnh; view-picker bên dưới đổi item. */}
        <div className='relative flex min-h-[40vh] min-w-0 flex-1 items-center justify-center overflow-hidden bg-neutral-100 @2xl:min-h-full'>
          {activeVariant && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={activeVariant.key}
              src={activeVariant.image}
              alt={activeVariant.label}
              className='h-full w-full object-contain p-6 @2xl:p-10'
            />
          )}
        </div>

        <div className='flex w-full flex-col overflow-y-auto bg-white px-8 py-10 @2xl:w-[420px] @4xl:w-[460px]'>
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
            <h2
              data-element-key='discover.title'
              style={styleOf('discover.title')}
              className='text-2xl leading-tight font-light tracking-tight @2xl:text-[26px]'
            >
              {info.title}
            </h2>
            <span
              data-element-key='discover.badge'
              style={styleOf('discover.badge')}
              className='mt-1 shrink-0 border border-black/20 px-3 py-1.5 text-[10px] tracking-[0.18em] whitespace-nowrap uppercase'
            >
              {info.badge}
            </span>
          </div>
          <p
            data-element-key='discover.subtitle'
            style={styleOf('discover.subtitle')}
            className='mb-8 text-sm text-neutral-500 italic'
          >
            {info.subtitle}
          </p>

          {/* Row: view picker */}
          <div className='flex items-center justify-between border-t border-black/10 py-5'>
            <span className='text-sm capitalize'>
              {activeVariant?.label ?? 'View'}
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
                    backgroundImage: `url(${v.swatch})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  aria-label={`Select ${v.label}`}
                  aria-pressed={viewKey === v.key}
                />
              ))}
            </div>
          </div>

          <div className='flex items-start justify-between gap-6 border-t border-black/10 py-5 text-sm'>
            <span className='shrink-0'>Dimensions</span>
            <span
              data-element-key='discover.dimensions'
              style={styleOf('discover.dimensions')}
              className='text-right whitespace-pre-line text-neutral-700'
            >
              {info.dimensions}
            </span>
          </div>

          <div className='mb-8 flex items-center justify-between border-t border-b border-black/10 py-5 text-sm'>
            <span>Face Value</span>
            <span
              data-element-key='discover.faceValue'
              style={styleOf('discover.faceValue')}
              className='text-neutral-700'
            >
              {info.faceValue}
            </span>
          </div>

          <details className='border-t border-black/10 py-4'>
            <summary className='flex cursor-pointer list-none justify-between text-sm'>
              <span>Details</span>
              <span className='text-lg leading-none'>+</span>
            </summary>
            <div
              data-element-key='discover.detailsText'
              style={styleOf('discover.detailsText')}
              className='pt-4 text-sm text-neutral-600'
            >
              <ul className='list-inside list-disc space-y-1'>
                {info.detailsText
                  .split('\n')
                  .map(line => line.trim())
                  .filter(Boolean)
                  .map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
              </ul>
            </div>
          </details>
          <details className='border-t border-black/10 py-4'>
            <summary className='flex cursor-pointer list-none justify-between text-sm'>
              <span>Packaging</span>
              <span className='text-lg leading-none'>+</span>
            </summary>
            <p
              data-element-key='discover.packagingText'
              style={styleOf('discover.packagingText')}
              className='pt-4 text-sm whitespace-pre-line text-neutral-600'
            >
              {info.packagingText}
            </p>
          </details>
          <details className='border-t border-b border-black/10 py-4'>
            <summary className='flex cursor-pointer list-none justify-between text-sm'>
              <span>Shipping</span>
              <span className='text-lg leading-none'>+</span>
            </summary>
            <p
              data-element-key='discover.shippingText'
              style={styleOf('discover.shippingText')}
              className='pt-4 text-sm whitespace-pre-line text-neutral-600'
            >
              {info.shippingText}
            </p>
          </details>
        </div>
      </div>
    </>,
    portalHost
  );
}
