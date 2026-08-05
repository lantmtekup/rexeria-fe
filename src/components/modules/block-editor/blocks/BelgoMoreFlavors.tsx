'use client';

/**
 * Belgo · More Flavors — video cột trái + gallery scrub ngang, item giữa
 * tự mở hover (chai/ly/nền). Port từ apps/belgo MoreFlavors.tsx.
 *
 * Khác apps: KHÔNG dùng ScrollTrigger `pin` — trên element scroller
 * (editor/preview) pin chạy bằng transform sau scroll event nên giật. Thay
 * bằng idiom host (như ScrollMattis): root cao = stage + quãng scrub, stage
 * `position: sticky` (compositor giữ, mượt trên cả window lẫn element
 * scroller), timeline scrub `start 'top top' → end 'bottom bottom'`.
 *
 * Canvas: layout phẳng — hiện đủ mọi hương vị để chọn/sửa; bỏ sticky/scrub.
 * Preview + /p: giữ UX production.
 */

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { BlockMedia } from '../BlockMedia';
import { useBlockMotion } from '../motion/LandingMotion';
import type { BelgoFlavorItem, BelgoMoreFlavorsContent } from '../types';
import type { BlockRenderProps } from './_registry/types';
import { resolveBelgoMoreFlavors } from './belgoMoreFlavorsContent';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { BELGO_CREAM, BELGO_FONT_CSS, BELGO_FONT_DISPLAY } from './belgoTheme';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';

const DEFAULT_VIDEO = '/belgo/videos/section5.mp4';
const SECTION_BG = '#e2dccb';
const BOTTLE_X = -28;
const GLASS_X = 34;

type StyleOf = (key: string) => React.CSSProperties | undefined;

type FlavorItemProps = {
  flavor: BelgoFlavorItem;
  index: number;
  styleOf: StyleOf;
  activeKey?: string | null;
  isCanvas: boolean;
  isMobile: boolean;
  onRegister: (index: number, tl: gsap.core.Timeline | null) => void;
  onActivate: (index: number) => void;
};

function FlavorItem({
  flavor,
  index,
  styleOf,
  activeKey,
  isCanvas,
  isMobile,
  onRegister,
  onActivate,
}: FlavorItemProps) {
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const bgRef = React.useRef<HTMLImageElement>(null);
  const bottleRef = React.useRef<HTMLImageElement>(null);
  const glassRef = React.useRef<HTMLImageElement>(null);

  const nameKey = `flavors[${index}].name`;
  const colorKey = `flavors[${index}].color`;
  const bgKey = `flavors[${index}].bgImageUrl`;
  const bottleKey = `flavors[${index}].bottleImageUrl`;
  const glassKey = `flavors[${index}].glassImageUrl`;

  React.useEffect(() => {
    if (isCanvas) return;

    const title = titleRef.current;
    const bg = bgRef.current;
    const bottle = bottleRef.current;
    const glass = glassRef.current;
    if (!title || !bg || !bottle || !glass) return;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduce ? 0 : 0.55;

    gsap.set(bottle, { xPercent: -50, x: 0 });
    gsap.set(glass, { xPercent: -50, x: 0, autoAlpha: 0 });
    gsap.set(bg, { autoAlpha: 0 });
    gsap.set(title, { y: 24, autoAlpha: 0 });

    const hoverTl = gsap.timeline({
      paused: true,
      defaults: { duration, ease: 'power2.out' },
    });

    hoverTl
      .to(bottle, { x: BOTTLE_X }, 0)
      .to(glass, { x: GLASS_X, autoAlpha: 1 }, 0)
      .to(bg, { autoAlpha: 1 }, 0)
      .to(title, { y: 0, autoAlpha: 1 }, 0.05);

    onRegister(index, hoverTl);

    return () => {
      onRegister(index, null);
      hoverTl.kill();
    };
  }, [index, isCanvas, onRegister]);

  const handleActivate = () => {
    onActivate(index);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onActivate(index);
    }
  };

  const titleStyle = composeStyle(
    {
      margin: 0,
      position: 'relative',
      zIndex: 20,
      marginBottom: 'clamp(4px, 1cqi, 8px)',
      padding: '0 8px',
      textAlign: 'center',
      fontFamily: BELGO_FONT_DISPLAY,
      fontSize: 'clamp(1.75rem, 6cqi, 3rem)',
      fontWeight: 400,
      lineHeight: 1,
      letterSpacing: '0.02em',
      color: flavor.color,
    },
    styleOf(colorKey),
    styleOf(nameKey)
  );

  const itemWidth = isCanvas
    ? 'min(100%, 220px)'
    : isMobile
      ? 'clamp(220px, 80cqi, 420px)'
      : 'clamp(260px, 33.333cqi, 420px)';

  return (
    <div
      data-flavor-item
      role='button'
      tabIndex={0}
      aria-label={flavor.name}
      onMouseEnter={isCanvas ? undefined : handleActivate}
      onFocus={isCanvas ? undefined : handleActivate}
      onKeyDown={isCanvas ? undefined : handleKeyDown}
      className='relative flex h-full shrink-0 flex-col items-center justify-center outline-none'
      style={{
        width: itemWidth,
        minWidth: itemWidth,
      }}
    >
      <h3
        ref={titleRef}
        data-element-key={nameKey}
        className={selectableClass(activeKey === nameKey, 'block shrink-0')}
        style={titleStyle}
      >
        {flavor.name}
      </h3>

      <div className='relative aspect-square w-[min(88%,48cqi)] @4xl:w-[min(92%,58cqi)]'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={bgRef}
          data-element-key={bgKey}
          src={flavor.bgImageUrl}
          alt=''
          aria-hidden='true'
          decoding='async'
          loading='lazy'
          className={selectableClass(
            activeKey === bgKey,
            'pointer-events-none absolute top-1/2 left-1/2 z-0 h-[78%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 object-contain'
          )}
          style={composeStyle(
            { opacity: isCanvas ? 1 : undefined },
            styleOf(bgKey)
          )}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={bottleRef}
          data-element-key={bottleKey}
          src={flavor.bottleImageUrl}
          alt={flavor.name}
          decoding='async'
          loading='lazy'
          className={selectableClass(
            activeKey === bottleKey,
            'absolute bottom-[2%] left-1/2 z-10 h-[92%] w-auto object-contain'
          )}
          style={styleOf(bottleKey)}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={glassRef}
          data-element-key={glassKey}
          src={flavor.glassImageUrl}
          alt=''
          aria-hidden='true'
          decoding='async'
          loading='lazy'
          className={selectableClass(
            activeKey === glassKey,
            'absolute bottom-[2%] left-1/2 z-10 h-[68%] w-auto max-w-none object-contain'
          )}
          style={composeStyle(
            { opacity: isCanvas ? 1 : undefined },
            styleOf(glassKey)
          )}
        />
      </div>
    </div>
  );
}

export function BelgoMoreFlavors({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<BelgoMoreFlavorsContent>) {
  const rootRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const videoColRef = React.useRef<HTMLDivElement>(null);
  const galleryColRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const hoverTlsRef = React.useRef<(gsap.core.Timeline | null)[]>([]);
  const activeIndexRef = React.useRef<number | null>(null);
  const activateRef = React.useRef<(index: number) => void>(() => {});
  const findCenterIndexRef = React.useRef<() => number>(() => 0);

  const isCanvas = useIsCanvasEdit(rootRef);
  const isMobile = useContainerMobile(rootRef);
  const flavors = React.useMemo(
    () => resolveBelgoMoreFlavors(content),
    [content]
  );

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const videoUrl = content.videoUrl?.trim() || DEFAULT_VIDEO;
  const eyebrow = content.eyebrow?.trim() || 'OUR PRODUCTS';
  const title =
    content.title?.trim() ||
    "DON'T STOP NOW – THERE'S MORE FLAVOR TO DISCOVER!";

  const handleActivate = React.useCallback((index: number) => {
    if (activeIndexRef.current === index) {
      const current = hoverTlsRef.current[index];
      if (current && current.progress() < 1) current.play();
      return;
    }

    if (activeIndexRef.current !== null) {
      hoverTlsRef.current[activeIndexRef.current]?.reverse();
    }
    hoverTlsRef.current[index]?.play();
    activeIndexRef.current = index;
  }, []);

  activateRef.current = handleActivate;

  const findCenterIndex = React.useCallback(() => {
    const gallery = galleryColRef.current;
    const track = trackRef.current;
    if (!gallery || !track) return 0;

    const items = track.querySelectorAll<HTMLElement>('[data-flavor-item]');
    if (items.length === 0) return 0;

    const galleryRect = gallery.getBoundingClientRect();
    const centerX = galleryRect.left + galleryRect.width / 2;

    let best = 0;
    let bestDist = Infinity;

    items.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      const dist = Math.abs(mid - centerX);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });

    return best;
  }, []);

  findCenterIndexRef.current = findCenterIndex;

  const handleRegister = React.useCallback(
    (index: number, tl: gsap.core.Timeline | null) => {
      hoverTlsRef.current[index] = tl;
      if (!tl) return;
      requestAnimationFrame(() => {
        activateRef.current(findCenterIndexRef.current());
      });
    },
    []
  );

  const syncCenterItem = React.useCallback(() => {
    activateRef.current(findCenterIndex());
  }, [findCenterIndex]);

  useBlockMotion(
    rootRef,
    ({ scroller, isMobile: motionMobile, requestRefresh }) => {
      if (isCanvas) return;

      const root = rootRef.current;
      const stage = stageRef.current;
      const videoCol = videoColRef.current;
      const galleryCol = galleryColRef.current;
      const track = trackRef.current;
      if (!root || !stage || !videoCol || !galleryCol || !track) return;

      if (motionMobile) {
        gsap.set(videoCol, {
          width: '100%',
          height: `${Math.round(stage.offsetHeight * 0.38)}px`,
          xPercent: 0,
          autoAlpha: 1,
          clearProps: 'width,xPercent',
        });
        gsap.set(galleryCol, { width: '100%', clearProps: 'width' });
      } else {
        gsap.set(videoCol, {
          width: '50%',
          height: '100%',
          xPercent: 0,
          autoAlpha: 1,
        });
        gsap.set(galleryCol, { width: '50%' });
      }
      gsap.set(track, { x: 0 });

      const getCollapseDistance = () =>
        motionMobile ? stage.offsetHeight * 0.35 : stage.offsetWidth * 0.5;
      const getTrackDistance = () =>
        Math.max(
          0,
          track.scrollWidth -
            (motionMobile ? galleryCol.offsetWidth : stage.offsetWidth)
        );

      // Root cao = stage + quãng scrub → sticky stage "pin" đúng bấy nhiêu px.
      const setTrackHeight = () => {
        gsap.set(root, {
          height: Math.round(
            stage.offsetHeight + getCollapseDistance() + getTrackDistance()
          ),
        });
      };
      setTrackHeight();

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          scroller,
          scrub: 1,
          start: 'top top',
          end: 'bottom bottom',
          fastScrollEnd: true,
          invalidateOnRefresh: true,
          onRefreshInit: setTrackHeight,
          onUpdate: syncCenterItem,
          onRefresh: syncCenterItem,
        },
      });

      if (motionMobile) {
        tl.to(videoCol, { height: 0, autoAlpha: 0, duration: 0.35 }, 0);
        tl.to(track, { x: () => -getTrackDistance(), duration: 1 }, 0);
      } else {
        tl.to(
          videoCol,
          { width: 0, xPercent: -20, autoAlpha: 0, duration: 1 },
          0
        );
        tl.to(galleryCol, { width: '100%', duration: 1 }, 0);
        tl.to(track, { x: () => -getTrackDistance(), duration: 1 });
      }

      const raf = requestAnimationFrame(syncCenterItem);
      requestRefresh();

      return () => {
        cancelAnimationFrame(raf);
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    [isCanvas, syncCenterItem]
  );

  const renderVideo = () =>
    videoUrl ? (
      <BlockMedia
        key={videoUrl}
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        preload='auto'
        className='absolute inset-0 h-full w-full object-cover'
      />
    ) : null;

  const copyBlock = (
    <div className='relative z-10 flex h-full items-center px-6 @4xl:px-16'>
      <div>
        <p
          data-element-key='eyebrow'
          className={selectableClass(activeKey === 'eyebrow', 'block')}
          style={composeStyle(
            {
              margin: 0,
              fontFamily: BELGO_FONT_DISPLAY,
              fontSize: 'clamp(12px, 1.4cqi, 14px)',
              fontWeight: 400,
              letterSpacing: '0.12em',
              color: BELGO_CREAM,
            },
            styleOf('eyebrow')
          )}
        >
          {eyebrow}
        </p>
        <h2
          data-element-key='title'
          className={selectableClass(
            activeKey === 'title',
            'mt-6 block max-w-xl'
          )}
          style={composeStyle(
            {
              margin: 'clamp(16px, 3cqi, 24px) 0 0',
              fontFamily: BELGO_FONT_DISPLAY,
              fontSize: 'clamp(2.5rem, 8cqi, 3.75rem)',
              fontWeight: 400,
              lineHeight: 0.95,
              color: BELGO_CREAM,
            },
            styleOf('title')
          )}
        >
          {title}
        </h2>
      </div>
    </div>
  );

  const flavorTrack = (
    <div ref={trackRef} className='flex h-full w-max @4xl:h-full'>
      {flavors.map((flavor, index) => (
        <FlavorItem
          key={flavor.key || index}
          flavor={flavor}
          index={index}
          styleOf={styleOf}
          activeKey={activeKey}
          isCanvas={isCanvas}
          isMobile={isMobile}
          onRegister={handleRegister}
          onActivate={handleActivate}
        />
      ))}
    </div>
  );

  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        id='more-flavors'
        data-canvas-edit='true'
        style={composeStyle(
          {
            position: 'relative',
            backgroundColor: SECTION_BG,
            minHeight: 'clamp(560px, 120cqi, 900px)',
          },
          blockBackgroundStyle(background)
        )}
        className={cn('@container relative w-full overflow-hidden', className)}
      >
        <style>{BELGO_FONT_CSS}</style>

        <div className='grid min-h-[inherit] grid-cols-1 gap-6 p-4 @4xl:grid-cols-2 @4xl:gap-8 @4xl:p-8'>
          <div className='relative min-h-[220px] overflow-hidden rounded-lg @4xl:min-h-[320px]'>
            <div
              data-element-key='videoUrl'
              className={selectableClass(
                activeKey === 'videoUrl',
                'absolute inset-0'
              )}
              style={composeStyle(
                { position: 'absolute', inset: 0 },
                styleOf('videoUrl')
              )}
            >
              {renderVideo()}
            </div>
            <div
              aria-hidden
              className='pointer-events-none absolute inset-0'
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            />
            {copyBlock}
          </div>

          <div className='min-w-0'>
            <p className='mb-3 text-[10px] font-semibold tracking-[0.14em] text-neutral-500 uppercase'>
              Hương vị · {flavors.length}
            </p>
            <div className='flex flex-wrap gap-4 overflow-x-auto pb-2'>
              {flavors.map((flavor, index) => (
                <FlavorItem
                  key={flavor.key || index}
                  flavor={flavor}
                  index={index}
                  styleOf={styleOf}
                  activeKey={activeKey}
                  isCanvas
                  isMobile={isMobile}
                  onRegister={handleRegister}
                  onActivate={handleActivate}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      id='more-flavors'
      style={{ backgroundColor: SECTION_BG }}
      className={cn('relative w-full', className)}
    >
      <style>{BELGO_FONT_CSS}</style>

      <div
        ref={stageRef}
        style={composeStyle(
          {
            position: 'sticky',
            top: 0,
            height: isMobile ? '100svh' : '100dvh',
            backgroundColor: SECTION_BG,
          },
          blockBackgroundStyle(background)
        )}
        className='@container relative w-full overflow-hidden'
      >
        <div className='flex h-full min-w-0 flex-col @4xl:h-full @4xl:flex-row @4xl:overflow-hidden'>
          <div
            ref={videoColRef}
            className='relative w-full shrink-0 overflow-hidden @4xl:h-full @4xl:w-1/2 @4xl:min-w-0'
            style={{
              height: isMobile ? '38svh' : '100%',
            }}
          >
            <div
              data-element-key='videoUrl'
              className={selectableClass(
                activeKey === 'videoUrl',
                'absolute inset-0'
              )}
              style={composeStyle(
                { position: 'absolute', inset: 0 },
                styleOf('videoUrl')
              )}
            >
              {renderVideo()}
            </div>
            <div
              aria-hidden
              className='pointer-events-none absolute inset-0'
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            />
            {copyBlock}
          </div>

          <div
            ref={galleryColRef}
            className='group/track relative min-h-0 min-w-0 flex-1 overflow-hidden @4xl:h-full @4xl:w-1/2 @4xl:flex-none'
            onMouseLeave={syncCenterItem}
          >
            {flavorTrack}
          </div>
        </div>
      </div>
    </section>
  );
}
