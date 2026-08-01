'use client';

/**
 * Block "Product - Hotspots" (section `.product-detail` của delvaux-clone) —
 * bám sát cơ chế + thị giác gốc:
 *
 *  - Section ~100vh, ảnh căn giữa (cao 730px desktop), quầng sáng phía sau.
 *  - Entrance zoom scrub trên `.img` (scale 2 / y -150 → 1). HOTSPOT chỉ hiện
 *    khi `.delvaux-product-done` (progress > 0.99) — ảnh đã về giữa màn.
 *  - Bấm hotspot: snap section giữa scroller → flex ảnh max 50% + panel
 *    width 0 → min(50%, 600px); sau 1s ảnh scale+translate theo preset tab.
 *  - Mobile: panel portal full-frame; ảnh scale nhẹ (~1.15).
 *  - Khi mở: khóa scroll (body + preview scroller) + `delvaux:overlay`.
 *
 * Canvas: force done + flat hotspot cards. Preview/`/p`: production UX.
 *
 * Section id='discover' cho sub-nav anchor.
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useBlockMotion, useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import {
  DELVAUX_BG,
  DELVAUX_FONT_BODY,
  DELVAUX_FONT_CSS,
  DELVAUX_FONT_HEADING,
} from './delvauxTheme';
import { useDrawerScrollLock } from './PnjHeroHotspots';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  DelvauxProductContent,
  DelvauxProductHotspot,
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

gsap.registerPlugin(ScrollTrigger);

interface Props {
  content: DelvauxProductContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

/** Open transforms từ style-ryo product-1 `.content.active.tabN .img img`. */
const OPEN_FOCUS = [
  { scale: 2.5, tx: 50, ty: 100 },
  { scale: 2.5, tx: -20, ty: 0 },
  { scale: 2, tx: 100, ty: -90 },
] as const;

const PRODUCT_CSS = `
@keyframes delvaux-scalebutton {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.9); opacity: 0; }
  51% { transform: scale(1); opacity: 0; }
  70% { opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.delvaux-product .delvaux-product-spot {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.delvaux-product.delvaux-product-done .delvaux-product-spot {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
.delvaux-product .delvaux-product-spot-pulse {
  animation: delvaux-scalebutton 4s infinite;
}
/* Gốc style-ryo: .wrapper-image không overflow:hidden — ảnh scale tràn tới drawer */
.delvaux-product .delvaux-product-image-col,
.delvaux-product .delvaux-product-zoom {
  overflow: visible !important;
}
body.delvaux-product-scroll-lock,
html.delvaux-product-scroll-lock {
  overflow: hidden !important;
  touch-action: none;
}
[data-landing-preview-scroller].delvaux-product-scroll-lock {
  overflow: hidden !important;
  overscroll-behavior: none;
  touch-action: none;
}
`;

const titleBase = {
  margin: 0,
  fontFamily: DELVAUX_FONT_HEADING,
  fontWeight: 400,
  fontSize: 'clamp(24px, 2.9cqi, 36px)',
  lineHeight: 1.2,
  color: '#000000',
} as const;

const descBase = {
  marginTop: 'clamp(16px, 2cqi, 24px)',
  marginBottom: 0,
  fontFamily: DELVAUX_FONT_BODY,
  fontSize: 'clamp(13px, 1.4cqi, 14px)',
  lineHeight: 1.55,
  color: '#111111',
} as const;

export function DelvauxProduct({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const { scroller } = useLandingMotion();
  const isMobile = useContainerMobile(rootRef);
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);
  /** Giữ width panel trong lúc slide-out — tránh chữ bóp khi width → 0 (như gốc closeTab). */
  const [shellExpanded, setShellExpanded] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);
  const snappingRef = React.useRef(false);
  const isCanvas = useIsCanvasEdit(rootRef);

  React.useEffect(() => setMounted(true), []);

  React.useLayoutEffect(() => {
    if (!mounted || isCanvas || !isMobile) return;
    setPortalHost(resolveDrawerPortalHost(rootRef.current));
  }, [mounted, openIdx, isCanvas, isMobile]);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const hotspots = content.hotspots ?? [];
  const isOpen = openIdx !== null;
  const openSpot = openIdx !== null ? (hotspots[openIdx] ?? null) : null;
  const glow = content.glowColor || '#a77c63';

  const resolveScrollRoot = React.useCallback((): HTMLElement | null => {
    return (
      scroller ??
      (rootRef.current?.closest(
        '[data-landing-preview-scroller]'
      ) as HTMLElement | null) ??
      null
    );
  }, [scroller]);

  const isProductDone = React.useCallback(
    () => !!rootRef.current?.classList.contains('delvaux-product-done'),
    []
  );

  /** Tọa độ scroll để section căn đáy viewport (vị trí snap/khóa khi mở hotspot). */
  const alignedSectionY = React.useCallback((): number | null => {
    const root = rootRef.current;
    if (!root) return null;
    const scrollRoot = resolveScrollRoot();
    if (scrollRoot) {
      const rootRect = root.getBoundingClientRect();
      const scrollerRect = scrollRoot.getBoundingClientRect();
      const sectionTop =
        scrollRoot.scrollTop + (rootRect.top - scrollerRect.top);
      return Math.max(
        0,
        sectionTop - (scrollRoot.clientHeight - root.offsetHeight)
      );
    }
    const sectionTop = root.getBoundingClientRect().top + window.scrollY;
    return Math.max(0, sectionTop - (window.innerHeight - root.offsetHeight));
  }, [resolveScrollRoot]);

  /** Gốc: scrollTo căn section vào viewport trước khi mở hotspot. */
  const snapSectionToCenter = React.useCallback((): Promise<void> => {
    return new Promise(resolve => {
      const targetY = alignedSectionY();
      if (targetY === null) {
        resolve();
        return;
      }
      const scrollRoot = resolveScrollRoot();
      if (scrollRoot) {
        scrollRoot.scrollTo({ top: targetY, behavior: 'smooth' });
        window.setTimeout(resolve, 450);
        return;
      }
      // /p: Lenis sở hữu window scroll — scrollTo native 'smooth' sẽ bị Lenis
      // ghi đè giữa chừng → section lệch, hở section kế tiếp. Phải snap qua Lenis.
      const lenis = (
        window as unknown as {
          __lenis?: {
            scrollTo: (
              y: number,
              opts?: { duration?: number; onComplete?: () => void }
            ) => void;
          };
        }
      ).__lenis;
      if (lenis) {
        lenis.scrollTo(targetY, {
          duration: 0.45,
          onComplete: () => resolve(),
        });
        window.setTimeout(resolve, 700); // safety — promise chỉ settle 1 lần
        return;
      }
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      window.setTimeout(resolve, 450);
    });
  }, [alignedSectionY, resolveScrollRoot]);

  const handleClose = React.useCallback(() => setOpenIdx(null), []);

  // Gốc closeTabProductDetail: dịch panel ra (x/translate) trước, width → 0 sau.
  React.useEffect(() => {
    if (openIdx !== null) {
      setShellExpanded(true);
      return;
    }
    const t = window.setTimeout(() => setShellExpanded(false), 900);
    return () => window.clearTimeout(t);
  }, [openIdx]);

  const handleSpotClick = React.useCallback(
    async (i: number) => {
      if (isCanvas || snappingRef.current) return;
      if (openIdx === i) {
        setOpenIdx(null);
        return;
      }
      // Gốc: chỉ tương tác khi .done (ảnh đã về giữa).
      if (!isProductDone()) return;

      snappingRef.current = true;
      try {
        await snapSectionToCenter();
        if (!isProductDone()) return;
        setOpenIdx(i);
      } finally {
        snappingRef.current = false;
      }
    },
    [isCanvas, openIdx, isProductDone, snapSectionToCenter]
  );

  // Gốc: $("body").addClass("overflow-hidden"). Preview cuộn trong
  // [data-landing-preview-scroller] — khóa scroller + đóng băng ST scrub.
  useDrawerScrollLock(!isCanvas && isOpen ? 'delvaux-product' : null, isMobile);
  React.useEffect(() => {
    if (isCanvas || !isOpen) return;

    const html = document.documentElement;
    const body = document.body;
    const scrollRoot = resolveScrollRoot();
    const lenis = (
      window as unknown as { __lenis?: { stop: () => void; start: () => void } }
    ).__lenis;

    // Khóa tại đúng tọa độ section căn đáy viewport — nếu chốt scrollTop hiện tại
    // trong lúc snap smooth chưa kết thúc thì section đứng lệch, hở section kế.
    const lockedY =
      alignedSectionY() ?? (scrollRoot ? scrollRoot.scrollTop : window.scrollY);
    html.classList.add('delvaux-product-scroll-lock');
    body.classList.add('delvaux-product-scroll-lock');
    scrollRoot?.classList.add('delvaux-product-scroll-lock');
    lenis?.stop();
    if (scrollRoot) scrollRoot.scrollTop = lockedY;
    else window.scrollTo(0, lockedY);

    const root = rootRef.current;
    const triggers = ScrollTrigger.getAll().filter(t => t.trigger === root);
    triggers.forEach(t => t.disable(false));

    // Bỏ transform GSAP trên .zoom; chỉ img scale như gốc.
    const zoom = root?.querySelector<HTMLElement>('.delvaux-product-zoom');
    if (zoom) gsap.set(zoom, { scale: 1, x: 0, y: 0, clearProps: 'transform' });

    const freezeScroll = () => {
      if (scrollRoot) {
        if (scrollRoot.scrollTop !== lockedY) scrollRoot.scrollTop = lockedY;
        return;
      }
      if (window.scrollY !== lockedY) window.scrollTo(0, lockedY);
    };
    const blockWheel = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-delvaux-product-panel]')) return;
      e.preventDefault();
    };

    scrollRoot?.addEventListener('scroll', freezeScroll, { passive: true });
    window.addEventListener('scroll', freezeScroll, { passive: true });
    scrollRoot?.addEventListener('wheel', blockWheel, {
      passive: false,
      capture: true,
    });
    scrollRoot?.addEventListener('touchmove', blockWheel, {
      passive: false,
      capture: true,
    });
    window.addEventListener('wheel', blockWheel, {
      passive: false,
      capture: true,
    });

    return () => {
      html.classList.remove('delvaux-product-scroll-lock');
      body.classList.remove('delvaux-product-scroll-lock');
      scrollRoot?.classList.remove('delvaux-product-scroll-lock');
      scrollRoot?.removeEventListener('scroll', freezeScroll);
      window.removeEventListener('scroll', freezeScroll);
      scrollRoot?.removeEventListener('wheel', blockWheel, true);
      scrollRoot?.removeEventListener('touchmove', blockWheel, true);
      window.removeEventListener('wheel', blockWheel, true);
      triggers.forEach(t => t.enable());
      lenis?.start();
      ScrollTrigger.update();
    };
  }, [isOpen, isCanvas, resolveScrollRoot, alignedSectionY]);

  useBlockMotion(
    rootRef,
    ({ scroller: motionScroller, requestRefresh, isMobile: motionMobile }) => {
      const root = rootRef.current;
      if (!root) return;
      if (isCanvas) {
        root.classList.add('delvaux-product-done');
        return;
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        root.classList.add('delvaux-product-done');
        return;
      }

      const zoom = root.querySelector<HTMLElement>('.delvaux-product-zoom');
      if (!zoom) {
        root.classList.add('delvaux-product-done');
        return;
      }

      // Gốc animateZoomIn: y -150 desktop / -70 mobile; end +=100% / +=65%.
      const yFrom = motionMobile ? -70 : -150;
      const endPct = motionMobile ? 65 : 100;

      // Chỉ đụng DOM/state khi trạng thái đổi — onUpdate bắn mỗi frame scrub.
      let lastDone = root.classList.contains('delvaux-product-done');
      const setDone = (done: boolean) => {
        if (done === lastDone) return;
        lastDone = done;
        root.classList.toggle('delvaux-product-done', done);
        if (!done) setOpenIdx(null);
      };

      gsap.fromTo(
        zoom,
        { scale: 2, transformOrigin: 'top center', y: yFrom, force3D: true },
        {
          scale: 1,
          y: 0,
          force3D: true,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            scroller: motionScroller,
            start: 'top 103%',
            end: `+=${endPct}%`,
            scrub: 0.5,
            invalidateOnRefresh: true,
            onEnterBack: () => setDone(false),
            onLeaveBack: () => setDone(false),
            onUpdate: self => {
              // Gốc: progress > 0.99
              setDone(self.progress > 0.99);
            },
          },
        }
      );

      const img = root.querySelector<HTMLImageElement>('.delvaux-product-img');
      if (img && !img.complete) {
        img.addEventListener('load', requestRefresh, { once: true });
      }
    },
    [isCanvas]
  );

  React.useEffect(() => {
    if (isCanvas) return;
    window.dispatchEvent(
      new CustomEvent('delvaux:overlay', { detail: { open: isOpen } })
    );
    if (!isOpen) return;
    const vid = panelRef.current?.querySelector<HTMLVideoElement>('video');
    vid?.play().catch(() => {});
    return () => {
      window.dispatchEvent(
        new CustomEvent('delvaux:overlay', { detail: { open: false } })
      );
    };
  }, [isOpen, isCanvas, openIdx]);

  React.useEffect(() => {
    if (isCanvas || !isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIdx(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isCanvas]);

  // ── Editor canvas ──
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        id='discover'
        data-canvas-edit='true'
        style={composeStyle(
          { background: DELVAUX_BG, minHeight: 520 },
          blockBackgroundStyle(background)
        )}
        className='delvaux-product delvaux-product-done @container relative w-full overflow-hidden'
      >
        <style suppressHydrationWarning>{DELVAUX_FONT_CSS}</style>
        <style suppressHydrationWarning>{PRODUCT_CSS}</style>
        <div
          className='mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-8'
          style={{ gap: 'clamp(20px, 3cqi, 32px)' }}
        >
          <div
            className='delvaux-product-zoom relative'
            style={{ height: 'min(42vh, 360px)' }}
          >
            <div
              aria-hidden='true'
              className='absolute rounded-full'
              style={{
                bottom: '10%',
                left: '50%',
                transform: 'translateX(-50%) scale(1.45)',
                width: 'clamp(160px, 24cqi, 280px)',
                height: 'clamp(160px, 24cqi, 280px)',
                background: `radial-gradient(circle closest-side, ${glow} 0%, ${glow} 35%, transparent 78%)`,
                opacity: 0.4,
                zIndex: 0,
              }}
            />
            {content.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                data-element-key='imageUrl'
                src={content.imageUrl}
                alt='Product'
                className={selectableClass(
                  activeKey === 'imageUrl',
                  'delvaux-product-img relative block'
                )}
                style={composeStyle(
                  {
                    height: '100%',
                    width: 'auto',
                    objectFit: 'contain',
                    zIndex: 1,
                  },
                  styleOf('imageUrl')
                )}
              />
            ) : (
              <div
                data-element-key='imageUrl'
                className={selectableClass(
                  activeKey === 'imageUrl',
                  'delvaux-product-img relative block h-full w-full bg-black/5'
                )}
                style={composeStyle({ zIndex: 1 }, styleOf('imageUrl'))}
              />
            )}
            {hotspots.map((spot, i) => (
              <span
                key={`spot-edit-${i}`}
                aria-hidden='true'
                className='delvaux-product-spot absolute z-[2] flex items-center justify-center'
                style={{
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '18px',
                  height: '18px',
                  border: '2px solid #ffffff',
                  borderRadius: '9999px',
                  boxShadow: '0 0 6px rgba(0,0,0,0.18)',
                }}
              />
            ))}
          </div>

          <div className='grid w-full grid-cols-1 items-stretch gap-3 @2xl:grid-cols-3'>
            {hotspots.map((spot, i) => {
              const titleKey = `hotspots[${i}].title`;
              const descKey = `hotspots[${i}].desc`;
              const mediaKey = `hotspots[${i}].mediaUrl`;
              return (
                <div
                  key={`hs-card-${i}`}
                  className='flex h-full flex-col overflow-hidden text-left'
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e8e8e8',
                  }}
                >
                  <div
                    className='relative w-full shrink-0'
                    style={{
                      aspectRatio: '4 / 3',
                      background: '#f3f3f3',
                    }}
                  >
                    {spot.mediaType === 'video' && spot.mediaUrl ? (
                      <video
                        data-element-key={mediaKey}
                        muted
                        playsInline
                        preload='metadata'
                        src={spot.mediaUrl}
                        className={selectableClass(
                          activeKey === mediaKey,
                          'h-full w-full'
                        )}
                        style={composeStyle(
                          { objectFit: 'cover' },
                          styleOf(mediaKey)
                        )}
                      />
                    ) : spot.mediaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        data-element-key={mediaKey}
                        src={spot.mediaUrl}
                        alt={spot.title}
                        className={selectableClass(
                          activeKey === mediaKey,
                          'h-full w-full'
                        )}
                        style={composeStyle(
                          { objectFit: 'cover' },
                          styleOf(mediaKey)
                        )}
                      />
                    ) : (
                      <div
                        data-element-key={mediaKey}
                        className={selectableClass(
                          activeKey === mediaKey,
                          'flex h-full w-full items-center justify-center'
                        )}
                        style={composeStyle(
                          {
                            fontFamily: DELVAUX_FONT_BODY,
                            fontSize: '12px',
                            color: 'rgba(17,17,17,0.4)',
                          },
                          styleOf(mediaKey)
                        )}
                      >
                        Chưa có media
                      </div>
                    )}
                    <span
                      aria-hidden='true'
                      className='absolute top-2 left-2 flex size-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-medium text-white'
                    >
                      {i + 1}
                    </span>
                  </div>
                  <div
                    className='flex flex-1 flex-col'
                    style={{
                      padding: 'clamp(12px, 1.8cqi, 16px)',
                      gap: '8px',
                    }}
                  >
                    <h3
                      data-element-key={titleKey}
                      style={composeStyle(
                        {
                          ...titleBase,
                          fontSize: 'clamp(15px, 1.8cqi, 18px)',
                          lineHeight: 1.25,
                        },
                        styleOf(titleKey)
                      )}
                      className={selectableClass(activeKey === titleKey)}
                    >
                      {spot.title || `Hotspot ${i + 1}`}
                    </h3>
                    <p
                      data-element-key={descKey}
                      style={composeStyle(
                        {
                          ...descBase,
                          marginTop: 0,
                          fontSize: 'clamp(11px, 1.2cqi, 12px)',
                          lineHeight: 1.45,
                        },
                        styleOf(descKey)
                      )}
                      className={selectableClass(
                        activeKey === descKey,
                        'line-clamp-4'
                      )}
                    >
                      {spot.desc || 'Mô tả'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // ── Production ──
  // Gốc: scale + translate per tab trên img (delay 1s).
  const focus =
    openIdx !== null ? (OPEN_FOCUS[openIdx] ?? OPEN_FOCUS[0]) : OPEN_FOCUS[0];
  const openScale = isMobile ? 1.15 : focus.scale;
  const openTx = isMobile ? 0 : focus.tx;
  const openTy = isMobile ? 0 : focus.ty;
  // Width chỉ thu sau khi tab đã slide-out — không reflow/bóp chữ lúc đóng.
  const panelWidthPx = shellExpanded
    ? isMobile
      ? '100%'
      : 'min(50%, 600px)'
    : '0px';
  const imgHeight = isMobile ? 'min(65svh, 480px)' : '730px';
  const layoutOpen = shellExpanded && !isMobile;

  const panelBody =
    openSpot && openIdx !== null ? (
      <HotspotPanelBody
        spot={openSpot}
        idx={openIdx}
        activeKey={activeKey}
        styleOf={styleOf}
        onClose={handleClose}
      />
    ) : null;

  const inFrame = isDeviceFrameHost(portalHost);
  const mobilePortal =
    isMobile && isOpen && mounted && portalHost && panelBody
      ? createPortal(
          <div
            ref={panelRef}
            data-delvaux-product-panel=''
            className={
              inFrame
                ? 'absolute inset-y-0 right-0 z-[1950] h-full w-full bg-white'
                : 'fixed inset-y-0 right-0 z-[1950] h-full w-full bg-white'
            }
            role='dialog'
            aria-modal='true'
            data-lenis-prevent
          >
            {panelBody}
          </div>,
          portalHost
        )
      : null;

  return (
    <section
      ref={rootRef}
      id='discover'
      style={composeStyle(
        { background: DELVAUX_BG, height: '100svh' },
        blockBackgroundStyle(background)
      )}
      className='delvaux-product @container relative w-full overflow-hidden'
    >
      <style suppressHydrationWarning>{DELVAUX_FONT_CSS}</style>
      <style suppressHydrationWarning>{PRODUCT_CSS}</style>
      <div
        className={
          layoutOpen
            ? 'delvaux-product-content is-active flex h-full w-full'
            : 'delvaux-product-content flex h-full w-full'
        }
        style={{
          alignItems: 'center',
          // Gốc .content.active: space-between + overflow hidden
          justifyContent: layoutOpen ? 'space-between' : 'center',
          overflow: shellExpanded ? 'hidden' : 'visible',
        }}
      >
        {/*
          Gốc .wrapper-image: width max-content; height 100vh; .active → max-width 50%.
          Không overflow:hidden — scale tràn sang khoảng trống tới drawer.
        */}
        <div
          className='delvaux-product-image-col relative flex h-full items-center justify-center'
          style={{
            width: 'max-content',
            maxWidth: layoutOpen ? '50%' : '100%',
            margin: layoutOpen ? '0' : '0 auto',
            transition: 'max-width 1s ease',
            overflow: 'visible',
            zIndex: 1,
          }}
        >
          <div
            className='delvaux-product-zoom relative'
            style={{
              height: imgHeight,
              overflow: 'visible',
              willChange: 'transform',
            }}
          >
            {/* Radial-gradient thay filter:blur — blur trong phần tử đang scale scrub bắt browser re-rasterize mỗi frame gây giật. scale(1.45) bù độ loang của blur 90px, tâm quầng giữ nguyên. */}
            <div
              aria-hidden='true'
              className='absolute rounded-full'
              style={{
                bottom: '10%',
                left: '50%',
                transform: 'translateX(-50%) scale(1.45)',
                width: 'clamp(220px, 31cqi, 400px)',
                height: 'clamp(220px, 31cqi, 400px)',
                background: `radial-gradient(circle closest-side, ${glow} 0%, ${glow} 35%, transparent 78%)`,
                opacity: 0.4,
                zIndex: 0,
              }}
            />
            {content.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                data-element-key='imageUrl'
                src={content.imageUrl}
                alt='Product'
                decoding='async'
                className={selectableClass(
                  activeKey === 'imageUrl',
                  'delvaux-product-img relative block'
                )}
                style={composeStyle(
                  {
                    height: '100%',
                    width: 'auto',
                    maxWidth: 'none',
                    objectFit: 'contain',
                    transition: 'transform 0.7s ease',
                    transitionDelay: isOpen ? '1s' : '0s',
                    transform: isOpen
                      ? `scale(${openScale}) translate(${openTx}px, ${openTy}px)`
                      : 'scale(1)',
                    zIndex: 1,
                  },
                  styleOf('imageUrl')
                )}
              />
            ) : (
              <div
                data-element-key='imageUrl'
                className={selectableClass(
                  activeKey === 'imageUrl',
                  'delvaux-product-img relative block h-full w-full bg-black/5'
                )}
                style={composeStyle(
                  {
                    transition: 'transform 0.7s ease',
                    transitionDelay: isOpen ? '1s' : '0s',
                    transform: isOpen
                      ? `scale(${openScale}) translate(${openTx}px, ${openTy}px)`
                      : 'scale(1)',
                    zIndex: 1,
                  },
                  styleOf('imageUrl')
                )}
              />
            )}

            {hotspots.map((spot, i) => {
              const opened = openIdx === i;
              if (isOpen && !opened) return null;
              // Khi mở: giữ CLOSE trong khung (gốc reposition button ~30%/58%)
              const spotLeft = opened
                ? Math.min(Math.max(spot.x, 18), 82)
                : spot.x;
              const spotTop = opened
                ? Math.min(Math.max(spot.y, 18), 82)
                : spot.y;
              return (
                <button
                  key={`spot-${i}`}
                  type='button'
                  aria-expanded={opened}
                  aria-label={spot.title}
                  onClick={() => {
                    void handleSpotClick(i);
                  }}
                  className='delvaux-product-spot group absolute z-[2] flex min-h-10 min-w-10 items-center justify-center'
                  style={{
                    left: `${spotLeft}%`,
                    top: `${spotTop}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '40px',
                    height: '40px',
                  }}
                >
                  {opened ? (
                    <span
                      aria-hidden='true'
                      className='relative block'
                      style={{ width: '30px', height: '30px' }}
                    >
                      <svg
                        width='30'
                        height='30'
                        viewBox='0 0 12 13'
                        fill='none'
                      >
                        <line
                          x1='0.48'
                          y1='11.48'
                          x2='11.09'
                          y2='0.88'
                          stroke='white'
                          strokeWidth='0.9'
                        />
                        <line
                          x1='1.02'
                          y1='0.98'
                          x2='11.62'
                          y2='11.59'
                          stroke='white'
                          strokeWidth='0.9'
                        />
                      </svg>
                    </span>
                  ) : (
                    <>
                      <span
                        aria-hidden='true'
                        className='absolute rounded-full'
                        style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid #ffffff',
                          boxShadow: '0 0 6px rgba(0,0,0,0.18)',
                        }}
                      />
                      <span
                        aria-hidden='true'
                        className='delvaux-product-spot-pulse absolute rounded-full'
                        style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid #ffffff',
                        }}
                      />
                    </>
                  )}
                  <span
                    className='pointer-events-none absolute left-full ml-2 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100'
                    style={{
                      fontFamily: DELVAUX_FONT_BODY,
                      fontSize: 'clamp(8px, 0.9cqi, 9px)',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      color: '#ffffff',
                      textShadow: '0 0 4px rgba(0,0,0,0.7)',
                      ...(opened ? { opacity: 1 } : {}),
                    }}
                  >
                    {opened ? 'CLOSE' : spot.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop panel — gốc: slide translate trước, width → 0 sau (tránh bóp chữ) */}
        {!isMobile ? (
          <div
            ref={panelRef}
            data-delvaux-product-panel=''
            className='relative z-[2] h-full shrink-0 overflow-hidden'
            style={{
              width: panelWidthPx,
              // Đóng: chờ tab slide (~0.85s) rồi mới thu width
              transition: shellExpanded
                ? 'width 1s ease'
                : 'width 0.5s ease 0.2s',
            }}
            role={isOpen ? 'dialog' : undefined}
            aria-modal={isOpen ? true : undefined}
          >
            {hotspots.map((spot, i) => {
              const opened = openIdx === i;
              return (
                <div
                  key={`tab-${i}`}
                  data-tab={i}
                  className='absolute inset-y-0 right-0 h-full'
                  style={{
                    // Width cố định theo shell mở — không co theo parent lúc đóng
                    width: 'min(50cqw, 600px)',
                    maxWidth: '100%',
                    background: '#ffffff',
                    transform: opened ? 'translateX(0)' : 'translateX(100%)',
                    // Mở: delay 0.7s; đóng: slide ngay (gốc closeTab)
                    transition: opened
                      ? 'transform 1s ease 0.7s'
                      : 'transform 0.85s ease 0s',
                    zIndex: opened ? 2 : 1,
                  }}
                >
                  <HotspotPanelBody
                    spot={spot}
                    idx={i}
                    activeKey={activeKey}
                    styleOf={styleOf}
                    onClose={handleClose}
                  />
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {mobilePortal}
    </section>
  );
}

function HotspotPanelBody({
  spot,
  idx,
  activeKey,
  styleOf,
  onClose,
}: {
  spot: DelvauxProductHotspot;
  idx: number;
  activeKey?: string | null;
  styleOf: (key: string) => React.CSSProperties | undefined;
  onClose: () => void;
}) {
  const titleKey = `hotspots[${idx}].title`;
  const descKey = `hotspots[${idx}].desc`;
  const mediaKey = `hotspots[${idx}].mediaUrl`;

  return (
    <div
      className='relative flex h-full w-full flex-col justify-end overflow-y-auto'
      data-lenis-prevent
      style={{ padding: 'clamp(24px, 5cqi, 64px)' }}
    >
      <button
        type='button'
        aria-label='Đóng'
        onClick={onClose}
        className='absolute z-[3] flex items-center justify-center rounded-full'
        style={{
          width: '40px',
          height: '40px',
          right: 'clamp(20px, 4.2cqi, 54px)',
          top: 'clamp(20px, 4.2cqi, 54px)',
          border: '1px solid #e8e8e8',
          background: '#ffffff',
          cursor: 'pointer',
        }}
      >
        <svg width='12' height='13' viewBox='0 0 12 13' fill='none'>
          <line
            x1='0.48'
            y1='11.48'
            x2='11.09'
            y2='0.88'
            stroke='black'
            strokeWidth='0.75'
          />
          <line
            x1='1.02'
            y1='0.98'
            x2='11.62'
            y2='11.59'
            stroke='black'
            strokeWidth='0.75'
          />
        </svg>
      </button>

      <h3
        data-element-key={titleKey}
        style={composeStyle(titleBase, styleOf(titleKey))}
        className={selectableClass(activeKey === titleKey)}
      >
        {spot.title}
      </h3>
      <p
        data-element-key={descKey}
        style={composeStyle(descBase, styleOf(descKey))}
        className={selectableClass(activeKey === descKey)}
      >
        {spot.desc}
      </p>

      <div
        className='w-full'
        style={{
          marginTop: 'clamp(24px, 3.2cqi, 40px)',
          aspectRatio: '465 / 348',
        }}
      >
        {!spot.mediaUrl ? (
          /* Hotspot chưa gán media. Vẫn phải là một node mang `mediaKey` để
             chọn/upload được trên canvas — nhưng KHÔNG phải <img src=''>,
             thứ khiến trình duyệt tải lại cả trang. */
          <div
            data-element-key={mediaKey}
            className={selectableClass(
              activeKey === mediaKey,
              'h-full w-full bg-black/5'
            )}
            style={styleOf(mediaKey)}
          />
        ) : spot.mediaType === 'video' ? (
          <video
            data-element-key={mediaKey}
            loop
            muted
            playsInline
            src={spot.mediaUrl}
            className={selectableClass(activeKey === mediaKey, 'h-full w-full')}
            style={composeStyle({ objectFit: 'cover' }, styleOf(mediaKey))}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            data-element-key={mediaKey}
            src={spot.mediaUrl}
            alt={spot.title}
            className={selectableClass(activeKey === mediaKey, 'h-full w-full')}
            style={composeStyle({ objectFit: 'cover' }, styleOf(mediaKey))}
          />
        )}
      </div>
    </div>
  );
}
