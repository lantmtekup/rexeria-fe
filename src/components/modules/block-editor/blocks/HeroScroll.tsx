'use client';

/**
 * Hero Scroll Reveal Cinematic — 4 ảnh (m1-m4) xếp chồng (m1 trên cùng). Cuộn →
 * ảnh active thu nhỏ từ fullscreen về khung giữa (bo góc), giữ tâm; m1 khi mới
 * vào bắt đầu hơi to (scale ~1.18) rồi fit dần về fullscreen (time-based).
 * Scroll timeline chỉ điều khiển shrink/reveal — tách riêng để không giật.
 *
 * Motion theo contract R1-R6 (docs/landing-motion-foundation.md):
 * - dùng `useBlockMotion` (scroller từ hook, invalidateOnRefresh, auto cleanup);
 * - `requestRefresh()` sau khi 4 ảnh load (đo lại vị trí scrub);
 * - bail reduced-motion + mini-preview (không root) → render tĩnh;
 * - editor canvas (`data-testid=active-block-preview`) → lưới 2×2 editable
 *   (click từng ảnh đổi URL; không scrub — BlockPreview `transform:scale` gãy sticky);
 * - PreviewMode / Play / `/p` → full scrub (KHÔNG coi là canvas dù có scroller);
 * - KHÔNG `gsap.registerPlugin` (LandingMotionRoot đã đăng ký ScrollTrigger).
 */

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';
import { HERO_SCROLL_IMAGES } from '@/assets/images/hero_scroll';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HeroScrollContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useBlockMotion, useLandingMotion } from '../motion/LandingMotion';
import { useContainerMobile } from './useContainerMobile';

interface HeroScrollProps {
  content: HeroScrollContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Hold đầu scroll timeline — chờ entrance xong / micro-scroll trước khi shrink. */
const HOLD_START = 0.12;
/** Hold cuối timeline — micro-scroll không đảo animation ngay. */
const HOLD_END = 0.25;

/** Entrance m1: ảnh hơi to khi mới vào, fit dần về fullscreen (time-based). */
const ENTRANCE_SCALE_DESKTOP = 1.18;
const ENTRANCE_SCALE_MOBILE = 1.12;
const ENTRANCE_FIT_SECONDS = 1.8;

/** Bo góc khung ảnh khi đã thu nhỏ (px). */
const FRAME_RADIUS = 24;

const IMAGE_KEYS = [
  'image1Url',
  'image2Url',
  'image3Url',
  'image4Url',
] as const;

/** 4 ô vuông trang trí ở 4 góc + màu nền khởi đầu (tĩnh khi reduced-motion). */
const BLIP_CORNERS = [
  'left-0 top-0',
  'right-0 top-0',
  'left-0 bottom-0',
  'right-0 bottom-0',
] as const;
const BLIP_BASE = ['#ff2d5329', '#ff9d0a1f', '#ffd60a29', '#34c75929'] as const;
/** Palette "màu lộn xộn" để nhấp nháy. */
const BLIP_PALETTE = [
  '#ff2d5329',
  '#ff9d0a1f',
  '#ffd60a29',
  '#34c75929',
  '#00e5ff29',
  '#0a84ff29',
  '#bf5af229',
  '#ff375f29',
  '#ffffff29',
];

const resolveImages = (content: HeroScrollContent): string[] =>
  IMAGE_KEYS.map(
    (key, i) => content[key]?.trim() || HERO_SCROLL_IMAGES[i] || ''
  ).filter(Boolean);

export function HeroScroll({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HeroScrollProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const { hasRoot, requestRefresh } = useLandingMotion();
  const isMobile = useContainerMobile(rootRef);

  // Chỉ BlockPreview editor — KHÔNG PreviewMode/Play (cũng có scroller).
  // Default `true` trước khi đo DOM: tránh flash 400dvh đen trên canvas;
  // Play//p sẽ set false trong layout effect rồi mở track dài.
  const [isCanvas, setIsCanvas] = React.useState(true);
  React.useLayoutEffect(() => {
    if (!hasRoot) {
      setIsCanvas(false);
      return;
    }
    setIsCanvas(
      !!rootRef.current?.closest('[data-testid="active-block-preview"]')
    );
  }, [hasRoot]);

  const images = React.useMemo(() => resolveImages(content), [content]);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const sTitle = styleOf('title');
  const sSubtitle = styleOf('subtitle');

  // Kích thước đích + chiều cao track theo container (R2).
  const shrinkScale = isMobile ? 0.52 : 0.4;
  const entranceScale = isMobile
    ? ENTRANCE_SCALE_MOBILE
    : ENTRANCE_SCALE_DESKTOP;
  // Canvas: 1 viewport (tránh 400dvh đen trống + sticky gãy dưới scale).
  // Play / /p: track dài cho scrub.
  const trackHeight = isCanvas ? undefined : isMobile ? '300dvh' : '400dvh';

  // Đếm ảnh đã load → refresh scrub sau khi layout ổn định (R4).
  const loadedRef = React.useRef(0);
  const handleImgLoad = () => {
    loadedRef.current += 1;
    if (loadedRef.current >= images.length) requestRefresh();
  };

  // Ambient: 4 ô góc nhấp nháy — tách khỏi scroll timeline để không rebuild ST.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const blips = Array.from(
        root.querySelectorAll<HTMLElement>('.hero-scroll__blip')
      );
      blips.forEach(el => {
        const colors = gsap.utils.shuffle([...BLIP_PALETTE]);
        const blipTl = gsap.timeline({ repeat: -1 });
        colors.forEach(c =>
          blipTl.to(el, {
            backgroundColor: c,
            duration: gsap.utils.random(0.2, 0.4),
            ease: 'none',
          })
        );
        blipTl.progress(Math.random());
      });
    }, root);

    return () => ctx.revert();
  }, []);

  useBlockMotion(
    rootRef,
    ({ scroller: motionScroller }) => {
      const root = rootRef.current;
      if (!root) return;

      // Mini-preview / editor canvas / reduced-motion: không scrub.
      // Play (PreviewMode) + /p: hasRoot, !isCanvas → chạy timeline.
      if (!hasRoot || isCanvas) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const layers = Array.from(
        root.querySelectorAll<HTMLElement>('.hero-scroll__layer')
      );
      if (layers.length === 0) return;

      const m1 = layers[0];
      const rest = layers.slice(1);

      // m1 bắt đầu hơi to; các layer sau fullscreen phía dưới.
      gsap.set(m1, {
        scale: entranceScale,
        autoAlpha: 1,
        borderRadius: 0,
        transformOrigin: 'center center',
        force3D: true,
        backfaceVisibility: 'hidden',
      });
      gsap.set(rest, {
        scale: 1,
        autoAlpha: 1,
        borderRadius: 0,
        transformOrigin: 'center center',
        force3D: true,
        backfaceVisibility: 'hidden',
      });

      // Entrance time-based (không nằm trong scroll timeline → không giật khi scroll).
      const entranceTween = gsap.to(m1, {
        scale: 1,
        duration: ENTRANCE_FIT_SECONDS,
        ease: 'power2.out',
        delay: 0.15,
        overwrite: 'auto',
      });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          scroller: motionScroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.45,
          invalidateOnRefresh: true,
          onUpdate: self => {
            // User scroll → dừng entrance, timeline shrink tiếp quản từ scale hiện tại.
            if (self.progress > 0.002 && entranceTween.isActive()) {
              entranceTween.kill();
            }
          },
        },
      });

      // Buffer đầu: scroll nhẹ chưa shrink ngay (entrance vẫn chạy hoặc đã fit xong).
      tl.to({}, { duration: HOLD_START }, 0);

      const last = layers.length - 1;
      layers.forEach((layer, i) => {
        // Ảnh CUỐI (m4) giữ nguyên fullscreen làm hero kết → cuộn tiếp sang
        // section khác (sticky release). Không thu nhỏ, không mờ.
        if (i >= last) return;
        // Phase A: fullscreen → khung giữa bo góc (lộ ảnh sau phía sau).
        tl.to(
          layer,
          { scale: shrinkScale, borderRadius: FRAME_RADIUS, duration: 1 },
          i + HOLD_START
        );
        // Phase B: ảnh trước tiếp tục co + mờ đi khi ảnh sau chiếm chỗ (song
        // song với Phase A của ảnh kế) → ảnh sau thành hero chính.
        tl.to(
          layer,
          { scale: shrinkScale * 0.35, autoAlpha: 0, duration: 0.6 },
          i + 1 + HOLD_START
        );
      });

      // Hold m4 fullscreen trước khi sticky release → chuyển section mượt hơn.
      tl.to({}, { duration: HOLD_END });
    },
    [isMobile, shrinkScale, entranceScale, hasRoot, isCanvas, images]
  );

  return (
    <section
      ref={rootRef}
      style={{
        ...(trackHeight ? { height: trackHeight } : undefined),
        ...blockBackgroundStyle(background),
      }}
      className={cn('relative w-full bg-neutral-950', className)}
    >
      {/*
        Stage: Play//p = sticky pin (R5: @container trên inner).
        Canvas = relative 1-frame + lưới 2×2 để chọn/đổi từng ảnh.
      */}
      <div
        className={cn(
          '@container w-full overflow-hidden bg-neutral-950',
          isCanvas
            ? 'relative aspect-16/10 min-h-[420px]'
            : 'sticky top-0 h-dvh'
        )}
      >
        {isCanvas ? (
          <div className='absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2 p-3'>
            {IMAGE_KEYS.map((key, i) => {
              const src = images[i];
              if (!src) return null;
              return (
                <div
                  key={key}
                  data-element-key={key}
                  style={styleOf(key)}
                  className={selectableClass(
                    activeKey === key,
                    'relative min-h-0 overflow-hidden rounded-xl ring-1 ring-white/10'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Ảnh ${i + 1}`}
                    onLoad={handleImgLoad}
                    className='pointer-events-none h-full w-full object-cover'
                    draggable={false}
                  />
                  <span className='pointer-events-none absolute top-2 left-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase'>
                    {i + 1}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          images.map((src, i) => (
            <div
              key={IMAGE_KEYS[i] ?? i}
              className='hero-scroll__layer pointer-events-none absolute inset-0 overflow-hidden will-change-transform'
              style={{ zIndex: images.length - i }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=''
                onLoad={handleImgLoad}
                className='h-full w-full object-cover'
                draggable={false}
              />
            </div>
          ))
        )}

        {/* Caption: giữa stage — canvas: trên lưới; play: mix-blend trên ảnh. */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center gap-1 text-center',
            !isCanvas && 'mix-blend-difference'
          )}
        >
          <h1
            data-element-key='title'
            style={sTitle}
            className={selectableClass(
              activeKey === 'title',
              'pointer-events-auto text-[9cqi] leading-[0.9] font-medium tracking-tight text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]'
            )}
          >
            {content.title || 'John Maxwell'}
          </h1>
          <p
            data-element-key='subtitle'
            style={sSubtitle}
            className={selectableClass(
              activeKey === 'subtitle',
              'pointer-events-auto text-[2cqi] font-medium tracking-[0.5em] text-white uppercase drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]'
            )}
          >
            {content.subtitle || 'GRAPHIC DESIGNER'}
          </p>
        </div>

        {/* 4 ô vuông trang trí ở 4 góc — chỉ Play//p (canvas đã có badge số). */}
        {!isCanvas &&
          BLIP_CORNERS.map((pos, i) => (
            <span
              key={i}
              aria-hidden='true'
              style={{ backgroundColor: BLIP_BASE[i] }}
              className={cn(
                'hero-scroll__blip pointer-events-none absolute z-60 size-4',
                pos
              )}
            />
          ))}
      </div>
    </section>
  );
}
