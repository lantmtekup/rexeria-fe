'use client';

/**
 * PNJ · Variant — sticky-track + scrub product-view chapters (image + copy).
 * Port từ apps/pnj ProductVariantSection.
 *
 * Motion R1–R6:
 * - useLandingMotion (scroller + requestRefresh)
 * - Live (desktop + mobile): CSS sticky track + scrub crossfade (no GSAP pin)
 * - Editor canvas (`active-block-preview`): lưới N card editable (pattern
 *   ScrollMattis) — mọi ảnh/nhãn/mô tả/highlights selectable; không scrub
 * - Scrub length scale theo số variants (track height)
 * - KHÔNG gsap.registerPlugin
 */

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  PnjVariantContent,
  PnjVariantItem,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useLandingMotion } from '../motion/LandingMotion';
import { PnjDiscoverPanel } from './PnjDiscoverPanel';
import { useContainerMobile } from './useContainerMobile';

const RESPONSIVE = {
  padX: 'clamp(24px, 4cqi, 64px)',
  padY: 'clamp(80px, 10cqi, 96px)',
  stageH: 'clamp(280px, 58cqi, 58vh)',
  gap: 'clamp(32px, 4cqi, 56px)',
  titleFont: 'clamp(24px, 3.2cqi, 30px)',
  descFont: 'clamp(14px, 1.6cqi, 16px)',
  navFont: 'clamp(12px, 1.3cqi, 13px)',
  ctaFont: 'clamp(13px, 1.5cqi, 14px)',
  radius: 'clamp(16px, 2.5cqi, 24px)',
  canvasTitle: 'clamp(18px, 2.4cqi, 22px)',
  canvasDesc: 'clamp(12px, 1.5cqi, 14px)',
} as const;

const pad2 = (n: number) => String(n + 1).padStart(2, '0');

interface Props {
  content: PnjVariantContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function PnjVariant({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const behindRef = React.useRef<HTMLDivElement>(null);
  const tlRef = React.useRef<gsap.core.Timeline | null>(null);
  const activeIndexRef = React.useRef(0);
  const { hasRoot, scroller, requestRefresh } = useLandingMotion();
  const variants = content.variants ?? [];
  const [discoverOpen, setDiscoverOpen] = React.useState(false);
  const [discoverViewKey, setDiscoverViewKey] = React.useState(
    variants[0]?.key ?? ''
  );
  const isMobile = useContainerMobile(sectionRef);

  // Chỉ BlockPreview editor — KHÔNG PreviewMode/Play (cũng có scroller).
  const [isCanvas, setIsCanvas] = React.useState(true);
  React.useLayoutEffect(() => {
    if (!hasRoot) {
      setIsCanvas(false);
      return;
    }
    setIsCanvas(
      !!sectionRef.current?.closest('[data-testid="active-block-preview"]')
    );
  }, [hasRoot]);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const syncNavDom = React.useCallback((root: HTMLElement, idx: number) => {
    if (idx === activeIndexRef.current) return;
    activeIndexRef.current = idx;
    root.querySelectorAll<HTMLElement>('[role="tab"]').forEach((btn, i) => {
      const on = i === idx;
      btn.dataset.active = on ? 'true' : 'false';
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      btn.tabIndex = on ? 0 : -1;
    });
  }, []);

  React.useEffect(() => {
    const root = sectionRef.current;
    if (!root || variants.length === 0) return;
    // Mini-preview / editor canvas / reduced-motion: không scrub.
    if (isCanvas || !hasRoot) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      gsap.set(root.querySelectorAll('.pnj-variant__img'), { autoAlpha: 1 });
      gsap.set(root.querySelectorAll('.pnj-variant__copy'), {
        autoAlpha: 1,
        y: 0,
      });
      return;
    }

    const imgs = gsap.utils.toArray<HTMLElement>('.pnj-variant__img', root);
    const copies = gsap.utils.toArray<HTMLElement>('.pnj-variant__copy', root);
    const count = imgs.length;
    if (count === 0) return;

    const triggerEl = trackRef.current ?? root;
    activeIndexRef.current = -1;
    syncNavDom(root, 0);

    const ctx = gsap.context(() => {
      gsap.set(imgs, { autoAlpha: 0 });
      gsap.set(copies, { autoAlpha: 0, y: 8 });
      gsap.set(imgs[0], { autoAlpha: 1 });
      gsap.set(copies[0], { autoAlpha: 1, y: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerEl,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
          onUpdate: self => {
            const idx = Math.min(count - 1, Math.floor(self.progress * count));
            syncNavDom(root, idx);
          },
        },
      });

      tlRef.current = tl;

      const segment = 1;
      for (let i = 0; i < count - 1; i++) {
        const at = i * segment;
        tl.to({}, { duration: segment * 0.4 }, at);
        tl.to(
          imgs[i],
          { autoAlpha: 0, duration: segment * 0.25, ease: 'none' },
          at + segment * 0.4
        );
        tl.to(
          copies[i],
          { autoAlpha: 0, y: -4, duration: segment * 0.2, ease: 'none' },
          at + segment * 0.4
        );
        tl.fromTo(
          imgs[i + 1],
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: segment * 0.25, ease: 'none' },
          at + segment * 0.4
        );
        tl.fromTo(
          copies[i + 1],
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: segment * 0.25, ease: 'none' },
          at + segment * 0.45
        );
        tl.to({}, { duration: segment * 0.35 }, at + segment * 0.65);
      }
    }, root);

    requestRefresh();

    return () => {
      tlRef.current = null;
      ctx.revert();
    };
  }, [
    variants,
    isCanvas,
    hasRoot,
    isMobile,
    scroller,
    requestRefresh,
    syncNavDom,
  ]);

  const handleSeek = (index: number) => {
    const tl = tlRef.current;
    const root = sectionRef.current;
    if (root) syncNavDom(root, index);
    if (!tl) return;
    const count = variants.length;
    if (count <= 1) return;
    const progress = (index + 0.5) / count;
    const st = tl.scrollTrigger;
    if (!st) return;
    const top = st.start + (st.end - st.start) * progress;
    const scrollerEl = scroller as HTMLElement | undefined;
    if (scrollerEl && 'scrollTo' in scrollerEl) {
      scrollerEl.scrollTo({ top, behavior: 'smooth' });
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleOpenDiscover = () => {
    const idx = activeIndexRef.current;
    const key = variants[idx]?.key ?? variants[0]?.key ?? '';
    setDiscoverViewKey(key);
    setDiscoverOpen(true);
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSeek(index);
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleSeek(Math.min(index + 1, variants.length - 1));
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      handleSeek(Math.max(index - 1, 0));
    }
  };

  if (variants.length === 0) return null;

  const trackVh = Math.round(
    100 + Math.max(variants.length, 1) * (isMobile ? 55 : 65)
  );

  const sectionClass = cn(
    'pnj-variant @container relative w-full border-t border-neutral-200/80 bg-neutral-50',
    className
  );

  // ── Editor canvas: lưới card — mọi góc hiện đủ để chọn/sửa (ScrollMattis) ──
  if (isCanvas) {
    return (
      <section
        ref={sectionRef}
        id='information'
        style={blockBackgroundStyle(background)}
        className={sectionClass}
      >
        <div className='relative min-h-[480px] w-full py-4'>
          <div className='mb-3 flex items-center justify-between gap-3 px-3'>
            <span className='text-[10px] font-semibold tracking-[0.14em] text-neutral-400 uppercase'>
              Góc nhìn · {variants.length}
            </span>
            <CanvasCta
              text={content.ctaText}
              activeKey={activeKey}
              styleOf={styleOf}
              className='mt-2'
            />
          </div>

          <div className='grid grid-cols-1 gap-3 px-3 @2xl:grid-cols-3'>
            {variants.map((v, i) => (
              <CanvasVariantCard
                key={v.key || i}
                variant={v}
                index={i}
                activeKey={activeKey}
                styleOf={styleOf}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Live: sticky track + scrub stacked chapters ─────────────────────────
  const viewNav = (
    <nav
      data-element-key='variants'
      className={selectableClass(
        activeKey === 'variants',
        'pointer-events-auto flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-2 @2xl:justify-start @2xl:gap-x-8'
      )}
      style={styleOf('variants')}
      role='tablist'
      aria-label='Góc nhìn sản phẩm'
    >
      {variants.map((v, i) => (
        <button
          key={v.key}
          type='button'
          role='tab'
          tabIndex={i === 0 ? 0 : -1}
          aria-label={v.label}
          aria-selected={i === 0}
          data-active={i === 0 ? 'true' : 'false'}
          onClick={() => handleSeek(i)}
          onKeyDown={e => handleTabKeyDown(e, i)}
          className='font-light text-neutral-400 transition-colors duration-300 data-[active=true]:font-normal data-[active=true]:text-[#003468]'
          style={{
            fontSize: RESPONSIVE.navFont,
            letterSpacing: '0.14em',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          {v.label}
        </button>
      ))}
    </nav>
  );

  const discoverCta = (
    <CanvasCta
      text={content.ctaText}
      activeKey={activeKey}
      styleOf={styleOf}
      onClick={handleOpenDiscover}
    />
  );

  const copyBlock = (
    <div className='relative w-full max-w-sm'>
      <CopyBlockSizer variants={variants} />
      {variants.map((v, i) => (
        <LiveVariantCopy
          key={v.key}
          variant={v}
          index={i}
          activeKey={activeKey}
          styleOf={styleOf}
        />
      ))}
    </div>
  );

  const imageStage = (
    <div
      className='pnj-variant__stage relative w-full overflow-hidden bg-neutral-100'
      style={{
        height: RESPONSIVE.stageH,
        borderRadius: RESPONSIVE.radius,
      }}
    >
      {variants.map((v, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={v.key}
          src={v.image}
          alt={v.label}
          data-element-key={`variants[${i}].image`}
          className={selectableClass(
            activeKey === `variants[${i}].image`,
            'pnj-variant__img pointer-events-auto absolute inset-0 h-full w-full object-cover'
          )}
          style={{
            zIndex: i + 1,
            ...styleOf(`variants[${i}].image`),
          }}
        />
      ))}
    </div>
  );

  const liveGrid = (
    <div
      className='mx-auto grid w-full max-w-6xl grid-cols-1 items-center @2xl:grid-cols-12'
      style={{ gap: RESPONSIVE.gap }}
    >
      <div className='order-1 flex flex-col gap-4 @2xl:col-span-7 @2xl:gap-5'>
        {imageStage}
        {viewNav}
      </div>
      <div className='order-2 flex flex-col items-start gap-6 @2xl:col-span-5'>
        {copyBlock}
        {discoverCta}
      </div>
    </div>
  );

  const livePad: React.CSSProperties = {
    paddingLeft: RESPONSIVE.padX,
    paddingRight: RESPONSIVE.padX,
    paddingTop: RESPONSIVE.padY,
    paddingBottom: RESPONSIVE.padY,
  };

  return (
    <section
      ref={sectionRef}
      id='information'
      style={blockBackgroundStyle(background)}
      className={sectionClass}
    >
      <div
        ref={trackRef}
        className='relative w-full'
        style={{ height: `${trackVh}svh` }}
      >
        <div className='sticky top-0 flex min-h-[100svh] w-full items-center overflow-hidden'>
          <div ref={behindRef} className='w-full' style={livePad}>
            {liveGrid}
          </div>
        </div>
      </div>

      <PnjDiscoverPanel
        open={discoverOpen}
        onClose={() => setDiscoverOpen(false)}
        variants={variants}
        initialViewKey={discoverViewKey}
        isMobile={isMobile}
        behindRef={behindRef}
      />
    </section>
  );
}

/** Canvas card — 1 góc nhìn, mọi field hiện đủ + selectable. */
function CanvasVariantCard({
  variant,
  index,
  activeKey,
  styleOf,
}: {
  variant: PnjVariantItem;
  index: number;
  activeKey?: string | null;
  styleOf: (key: string) => React.CSSProperties | undefined;
}) {
  const imageKey = `variants[${index}].image`;
  const labelKey = `variants[${index}].label`;
  const descKey = `variants[${index}].desc`;
  const hlKey = `variants[${index}].highlights`;

  return (
    <div className='flex min-w-0 flex-col gap-2 rounded-xl bg-white p-2 ring-1 ring-neutral-200/80'>
      <div
        data-element-key={imageKey}
        style={styleOf(imageKey)}
        className={selectableClass(
          activeKey === imageKey,
          'relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-100'
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={variant.image}
          alt={variant.label}
          className='pointer-events-none h-full w-full object-cover'
          draggable={false}
        />
        <span className='pointer-events-none absolute top-2 left-2 rounded bg-[#003468]/85 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase'>
          {pad2(index)}
        </span>
      </div>

      <h3
        data-element-key={labelKey}
        style={composeStyle(
          {
            margin: 0,
            fontSize: RESPONSIVE.canvasTitle,
            fontWeight: 300,
            color: '#003468',
            letterSpacing: '-0.02em',
          },
          styleOf(labelKey)
        )}
        className={selectableClass(
          activeKey === labelKey,
          'truncate px-1 font-light'
        )}
      >
        {variant.label || `Góc ${index + 1}`}
      </h3>

      <p
        data-element-key={descKey}
        style={composeStyle(
          {
            margin: 0,
            fontSize: RESPONSIVE.canvasDesc,
            lineHeight: 1.55,
            fontWeight: 300,
            color: '#525252',
          },
          styleOf(descKey)
        )}
        className={selectableClass(
          activeKey === descKey,
          'line-clamp-4 px-1 font-light'
        )}
      >
        {variant.desc || 'Mô tả…'}
      </p>

      <ul
        data-element-key={hlKey}
        style={styleOf(hlKey)}
        className={selectableClass(
          activeKey === hlKey,
          'm-0 flex list-none flex-col px-1 py-0.5'
        )}
      >
        {(variant.highlights.length > 0
          ? variant.highlights
          : ['(highlights)']
        ).map((item, hi) => (
          <li
            key={`${item}-${hi}`}
            className='border-b border-neutral-200/90 py-1.5 text-[11px] font-light text-neutral-600 last:border-b-0'
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Invisible sizer — giữ chiều cao copy rail theo variant dài nhất (tránh đè CTA). */
function CopyBlockSizer({ variants }: { variants: PnjVariantItem[] }) {
  const tallest = variants.reduce<PnjVariantItem | null>((best, v) => {
    if (!best) return v;
    const score = v.desc.length + v.highlights.length * 24;
    const bestScore = best.desc.length + best.highlights.length * 24;
    return score > bestScore ? v : best;
  }, null);
  if (!tallest) return null;

  return (
    <div
      aria-hidden
      className='pointer-events-none invisible flex flex-col gap-5'
    >
      <h2
        style={{
          margin: 0,
          fontSize: RESPONSIVE.titleFont,
          fontWeight: 300,
        }}
      >
        {tallest.label}
      </h2>
      <p
        style={{
          margin: 0,
          fontSize: RESPONSIVE.descFont,
          lineHeight: 1.7,
          fontWeight: 300,
        }}
      >
        {tallest.desc}
      </p>
      {tallest.highlights.length > 0 && (
        <ul className='m-0 flex list-none flex-col p-0'>
          {tallest.highlights.map(item => (
            <li
              key={item}
              className='border-b border-neutral-200/90 py-2.5 font-light'
              style={{ fontSize: RESPONSIVE.descFont }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CanvasCta({
  text,
  activeKey,
  styleOf,
  onClick,
  className,
}: {
  text: string;
  activeKey?: string | null;
  styleOf: (key: string) => React.CSSProperties | undefined;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type='button'
      data-element-key='ctaText'
      onClick={onClick}
      onKeyDown={e => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={selectableClass(
        activeKey === 'ctaText',
        cn(
          'group pointer-events-auto inline-flex items-center gap-2 border-b border-[#003468] pb-1 uppercase',
          className
        )
      )}
      style={composeStyle(
        {
          fontSize: RESPONSIVE.ctaFont,
          letterSpacing: '0.16em',
          color: '#003468',
          background: 'none',
          cursor: 'pointer',
        },
        styleOf('ctaText')
      )}
      aria-label={text || 'Xem chi tiết'}
    >
      {text || 'Xem chi tiết'}
      <svg
        width='12'
        height='12'
        viewBox='0 0 24 24'
        fill='none'
        aria-hidden
        className='transition-transform duration-300 group-hover:translate-x-0.5'
      >
        <path
          d='M5 12h14M13 6l6 6-6 6'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </button>
  );
}

function LiveVariantCopy({
  variant,
  index,
  activeKey,
  styleOf,
}: {
  variant: PnjVariantItem;
  index: number;
  activeKey?: string | null;
  styleOf: (key: string) => React.CSSProperties | undefined;
}) {
  const labelKey = `variants[${index}].label`;
  const descKey = `variants[${index}].desc`;
  const hlKey = `variants[${index}].highlights`;

  return (
    <div className='pnj-variant__copy absolute inset-x-0 top-0 flex flex-col gap-5'>
      <h2
        data-element-key={labelKey}
        className={selectableClass(
          activeKey === labelKey,
          'pointer-events-auto font-light tracking-tight'
        )}
        style={composeStyle(
          {
            margin: 0,
            fontSize: RESPONSIVE.titleFont,
            fontWeight: 300,
            color: '#003468',
            letterSpacing: '-0.02em',
          },
          styleOf(labelKey)
        )}
      >
        {variant.label}
      </h2>
      <p
        data-element-key={descKey}
        className={selectableClass(
          activeKey === descKey,
          'pointer-events-auto font-light'
        )}
        style={composeStyle(
          {
            margin: 0,
            fontSize: RESPONSIVE.descFont,
            lineHeight: 1.7,
            fontWeight: 300,
            color: '#525252',
          },
          styleOf(descKey)
        )}
      >
        {variant.desc}
      </p>
      {variant.highlights.length > 0 && (
        <ul
          data-element-key={hlKey}
          className={selectableClass(
            activeKey === hlKey,
            'pointer-events-auto m-0 flex list-none flex-col p-0'
          )}
          style={styleOf(hlKey)}
        >
          {variant.highlights.map(item => (
            <li
              key={item}
              className='border-b border-neutral-200/90 py-2.5 font-light text-neutral-700 last:border-b-0'
              style={{ fontSize: RESPONSIVE.descFont }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
