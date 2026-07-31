'use client';

/**
 * Hero - PureVisuals: 2 panel ảnh 50/50 phủ kín, cuộn → tách ra (trái/phải) để
 * lộ heading lớn dưới nền. Port từ `recon-purevisuals-hero/spec.md` §9.
 *
 * "Pin" bằng CSS: outer cao (track) + inner `position: sticky` (iOS-safe, KHÔNG
 * GSAP `pin` — pin trên iOS hay giật). GSAP chỉ scrub xPercent panel + reveal
 * text theo tiến trình cuộn qua outer. Plugin ScrollTrigger do `LandingMotionRoot`
 * đăng ký (không register trong block). Reduced-motion: CSS @media bỏ track +
 * hiện text. @container/cqi thay md:/lg:.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerPurevisualsHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { resolveFramerPurevisualsPanelImages } from './_registry/defs/framerPurevisualsHero';

interface Props {
  content: FramerPurevisualsHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const MONO_STACK =
  '"JetBrains Mono", "JetBrains Mono Placeholder", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

// Outer = track cuộn (sticky inner giữ 1 viewport, dư ra ~120dvh để scrub).
const OUTER_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '220dvh',
  backgroundColor: '#ffffff',
};

// Inner sticky = "pin" bằng CSS (1 viewport, đứng yên khi cuộn qua track).
// containerType ở ĐÂY (không phải outer) — container-type trên outer có thể
// can thiệp position:sticky của con. cqi/@container vẫn = full width.
const STICKY_STYLE: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  height: '100dvh',
  overflow: 'hidden',
  isolation: 'isolate',
  containerType: 'inline-size',
};

const PANEL_BASE_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  height: '100%',
  width: '50%',
  overflow: 'hidden',
  willChange: 'transform',
  zIndex: 2,
};

const PANEL_LEFT_STYLE: React.CSSProperties = {
  ...PANEL_BASE_STYLE,
  left: 0,
};

const PANEL_RIGHT_STYLE: React.CSSProperties = {
  ...PANEL_BASE_STYLE,
  right: 0,
};

/** Nhịp đổi ảnh carousel panel (ms). */
const CAROUSEL_INTERVAL_MS = 1400;
const CAROUSEL_BLUR_PX = 5;
/** Độ mờ tối đa của lớp wash ấm khi chuyển ảnh (0–1). */
const CAROUSEL_BLUR_PEAK = 0.32;
const CAROUSEL_CROSSFADE_S = 0.48;
const CAROUSEL_WASH_OUT_S = 0.42;
/** Tint kem ấm — tránh flash trắng lạnh. */
const CAROUSEL_WASH_COLOR = 'rgba(255, 236, 210, 0.07)';

const PANEL_CAROUSEL_LAYER_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '100%',
  height: '100%',
  minWidth: '100%',
  minHeight: '100%',
  transform: 'translate(-50%, -50%)',
  objectFit: 'cover',
  display: 'block',
  willChange: 'opacity',
};

const PANEL_CAROUSEL_WRAP_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
};

const PANEL_CAROUSEL_BLUR_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 2,
  pointerEvents: 'none',
  opacity: 0,
  backgroundColor: CAROUSEL_WASH_COLOR,
  backdropFilter: `blur(${CAROUSEL_BLUR_PX}px)`,
  WebkitBackdropFilter: `blur(${CAROUSEL_BLUR_PX}px)`,
  willChange: 'opacity',
};

/** Preload + decode trước khi crossfade — tránh flash khi gán src lên layer ẩn. */
const loadImage = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    if (!src) {
      resolve();
      return;
    }
    const img = new Image();
    const finish = () => {
      if (typeof img.decode === 'function') {
        img
          .decode()
          .then(() => resolve())
          .catch(() => resolve());
        return;
      }
      resolve();
    };
    img.onload = finish;
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
    if (img.complete) finish();
  });

interface PanelCarouselProps {
  images: string[];
  inView: boolean;
  isScrolling: boolean;
  scrollActiveRef: React.MutableRefObject<boolean>;
}

/** Hai lớp img + overlay blur crossfade; pause khi đang scroll scrub. */
function PurevisualsPanelCarousel({
  images,
  inView,
  isScrolling,
  scrollActiveRef,
}: PanelCarouselProps) {
  const layerARef = React.useRef<HTMLImageElement>(null);
  const layerBRef = React.useRef<HTMLImageElement>(null);
  const blurRef = React.useRef<HTMLDivElement>(null);
  const indexRef = React.useRef(0);
  const activeLayerRef = React.useRef<0 | 1>(0);
  const transitioningRef = React.useRef(false);
  const tweenRef = React.useRef<gsap.core.Timeline | null>(null);

  React.useEffect(() => {
    if (!isScrolling) return;

    tweenRef.current?.kill();
    tweenRef.current = null;
    transitioningRef.current = false;

    const layerA = layerARef.current;
    const layerB = layerBRef.current;
    const blurEl = blurRef.current;
    if (!layerA || !layerB) return;

    const active = activeLayerRef.current;
    gsap.set(active === 0 ? layerA : layerB, { opacity: 1 });
    gsap.set(active === 0 ? layerB : layerA, { opacity: 0 });
    if (blurEl) gsap.set(blurEl, { opacity: 0 });
  }, [isScrolling]);

  React.useEffect(() => {
    if (images.length === 0) return;

    const layerA = layerARef.current;
    const layerB = layerBRef.current;
    if (!layerA || !layerB) return;

    const resetToFirst = () => {
      indexRef.current = 0;
      activeLayerRef.current = 0;
      transitioningRef.current = false;
      tweenRef.current?.kill();
      tweenRef.current = null;
      const initialSrc = images[0];
      layerA.src = initialSrc;
      layerB.src = initialSrc;
      gsap.set(layerA, { opacity: 1 });
      gsap.set(layerB, { opacity: 0 });
      if (blurRef.current) gsap.set(blurRef.current, { opacity: 0 });
    };

    resetToFirst();

    if (images.length <= 1 || !inView) return;

    const isReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const advance = async () => {
      if (
        transitioningRef.current ||
        images.length <= 1 ||
        scrollActiveRef.current
      ) {
        return;
      }

      const nextIndex = (indexRef.current + 1) % images.length;
      const nextSrc = images[nextIndex];
      const activeLayer = activeLayerRef.current;
      const outgoing = activeLayer === 0 ? layerA : layerB;
      const incoming = activeLayer === 0 ? layerB : layerA;
      const blurEl = blurRef.current;

      transitioningRef.current = true;

      try {
        await loadImage(nextSrc);
      } catch {
        transitioningRef.current = false;
        return;
      }

      if (scrollActiveRef.current) {
        transitioningRef.current = false;
        return;
      }

      incoming.src = nextSrc;
      gsap.set(incoming, { opacity: 0 });

      if (isReduced) {
        gsap.set(outgoing, { opacity: 0 });
        gsap.set(incoming, { opacity: 1 });
        activeLayerRef.current = activeLayer === 0 ? 1 : 0;
        indexRef.current = nextIndex;
        transitioningRef.current = false;
        return;
      }

      tweenRef.current?.kill();

      if (!blurEl) {
        gsap.set(incoming, { opacity: 1 });
        gsap.set(outgoing, { opacity: 0 });
        activeLayerRef.current = activeLayer === 0 ? 1 : 0;
        indexRef.current = nextIndex;
        transitioningRef.current = false;
        return;
      }

      tweenRef.current = gsap
        .timeline({
          onComplete: () => {
            activeLayerRef.current = activeLayer === 0 ? 1 : 0;
            indexRef.current = nextIndex;
            transitioningRef.current = false;
            gsap.set(outgoing, { opacity: 0 });
            gsap.set(incoming, { opacity: 1 });
            if (blurEl) gsap.set(blurEl, { opacity: 0 });
            const preloadIndex = (nextIndex + 1) % images.length;
            loadImage(images[preloadIndex]).catch(() => {});
          },
        })
        .to(
          blurEl,
          {
            opacity: CAROUSEL_BLUR_PEAK,
            duration: CAROUSEL_CROSSFADE_S * 0.5,
            ease: 'sine.inOut',
          },
          0
        )
        .to(
          outgoing,
          {
            opacity: 0,
            duration: CAROUSEL_CROSSFADE_S,
            ease: 'sine.inOut',
          },
          0
        )
        .to(
          incoming,
          {
            opacity: 1,
            duration: CAROUSEL_CROSSFADE_S,
            ease: 'sine.inOut',
          },
          CAROUSEL_CROSSFADE_S * 0.22
        )
        .to(
          blurEl,
          {
            opacity: 0,
            duration: CAROUSEL_WASH_OUT_S,
            ease: 'sine.inOut',
          },
          CAROUSEL_CROSSFADE_S * 0.28
        );
    };

    if (images.length > 1) {
      loadImage(images[1]).catch(() => {});
    }

    const id = window.setInterval(advance, CAROUSEL_INTERVAL_MS);

    return () => {
      window.clearInterval(id);
      tweenRef.current?.kill();
      transitioningRef.current = false;
    };
  }, [images, inView, isScrolling, scrollActiveRef]);

  if (images.length === 0) return null;

  const initialSrc = images[0];

  return (
    <div style={PANEL_CAROUSEL_WRAP_STYLE}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={layerARef}
        src={initialSrc}
        alt=''
        loading='eager'
        decoding='async'
        style={PANEL_CAROUSEL_LAYER_STYLE}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={layerBRef}
        src={initialSrc}
        alt=''
        loading='eager'
        decoding='async'
        style={PANEL_CAROUSEL_LAYER_STYLE}
      />
      <div ref={blurRef} aria-hidden='true' style={PANEL_CAROUSEL_BLUR_STYLE} />
    </div>
  );
}

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: MONO_STACK,
  fontSize: 'clamp(40px, 13cqi, 180px)',
  fontWeight: 700,
  lineHeight: 1.1,
  letterSpacing: '-0.04em',
  textTransform: 'uppercase',
  margin: 0,
};

const SUBHEADING_STYLE: React.CSSProperties = {
  fontFamily: MONO_STACK,
  fontSize: 'clamp(14px, 1.5cqi, 18px)',
  fontWeight: 400,
  lineHeight: 1.2,
  letterSpacing: '-0.02em',
  margin: 0,
  marginTop: 'clamp(12px, 1.6cqi, 20px)',
  maxWidth: 'min(36ch, 100%)',
};

const TEXT_LAYER_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'grid',
  placeContent: 'center',
  textAlign: 'center',
  padding: 'clamp(24px, 4cqi, 64px)',
  zIndex: 1,
  pointerEvents: 'none',
  willChange: 'transform, opacity, filter',
};

export function FramerPurevisualsHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const textRef = React.useRef<HTMLDivElement>(null);
  const leftRef = React.useRef<HTMLDivElement>(null);
  const rightRef = React.useRef<HTMLDivElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const bgColor = content.bgColor || '#ffffff';
  const textColor = content.textColor || '#0a0a0a';
  const eyebrow = content.eyebrow || 'PureVisuals';
  const heading = content.heading || 'PureVisuals';
  const subheading = content.subheading || 'Blending creativity & strategy';

  // Resolver dùng chung với ElementToolbar / LayersPanel (def) — mảng carousel,
  // content cũ dạng 1 string vẫn chạy.
  // Memo theo đúng field (không phải cả `content`) — carousel effect phụ thuộc
  // identity của mảng, đổi mỗi render sẽ reset interval.
  const leftImages = React.useMemo<string[]>(
    () =>
      resolveFramerPurevisualsPanelImages(
        { leftImageUrl: content.leftImageUrl },
        'leftImageUrl'
      ).filter(Boolean),
    [content.leftImageUrl]
  );
  const rightImages = React.useMemo<string[]>(
    () =>
      resolveFramerPurevisualsPanelImages(
        { rightImageUrl: content.rightImageUrl },
        'rightImageUrl'
      ).filter(Boolean),
    [content.rightImageUrl]
  );

  const scrollActiveRef = React.useRef(false);
  const [isScrolling, setIsScrolling] = React.useState(false);
  const scrollIdleTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  React.useEffect(
    () => () => {
      if (scrollIdleTimerRef.current) clearTimeout(scrollIdleTimerRef.current);
    },
    []
  );

  // Carousel chỉ chạy khi block trong viewport (IntersectionObserver) — tránh
  // interval/tween khi block đã cuộn khỏi màn hình.
  const [inView, setInView] = React.useState(true);
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useBlockMotion(rootRef, ({ scroller }) => {
    const root = rootRef.current;
    const text = textRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    if (!root || !text || !left || !right) return;

    // Reduced-motion: layout do CSS @media lo (track gập, panel ẩn, text hiện).
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.set([left, right], { xPercent: 0, force3D: true });
    gsap.set(text, { opacity: 0, yPercent: 100, filter: 'blur(8px)' });

    const markScrolling = () => {
      scrollActiveRef.current = true;
      setIsScrolling(true);
      if (scrollIdleTimerRef.current) clearTimeout(scrollIdleTimerRef.current);
      scrollIdleTimerRef.current = setTimeout(() => {
        scrollActiveRef.current = false;
        setIsScrolling(false);
      }, 220);
    };

    // Scrub theo tiến trình cuộn qua OUTER (sticky inner giữ viewport). KHÔNG
    // `pin` — dùng CSS sticky, an toàn iOS.
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root,
        scroller,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
        fastScrollEnd: true,
        onUpdate: markScrolling,
      },
    });

    tl.to(left, { xPercent: -100, duration: 1, force3D: true }, 0)
      .to(right, { xPercent: 100, duration: 1, force3D: true }, 0)
      .to(
        text,
        { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1 },
        0
      );
  });

  return (
    <section
      ref={rootRef}
      data-block='framer-purevisuals-hero'
      style={composeStyle(
        OUTER_STYLE,
        { backgroundColor: bgColor },
        blockBackgroundStyle(background)
      )}
      className='pvh-hero'
    >
      <style>{`
        .pvh-hero :where(h1, h2, h3, h4, p) { margin: 0; }
        .pvh-hero :focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 4px;
        }
        /* Reduced-motion: bỏ track cuộn (outer về 1 viewport), panel ẩn, text
           hiện đầy đủ + tương tác được. */
        @media (prefers-reduced-motion: reduce) {
          .pvh-hero { height: 100dvh !important; }
          .pvh-hero [data-pvh-panel] { opacity: 0 !important; }
          .pvh-hero [data-pvh-text] {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
            pointer-events: auto !important;
          }
        }
        @container (max-width: 479px) {
          .pvh-hero [data-pvh-panel='left'] {
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            height: 50% !important;
          }
          .pvh-hero [data-pvh-panel='right'] {
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            height: 50% !important;
          }
        }
      `}</style>

      {/* Sticky inner = "pin" bằng CSS — giữ 1 viewport khi cuộn qua track.
          `@container` ở đây để cqi + @3xl: của text/panel resolve theo width này. */}
      <div className='@container' style={STICKY_STYLE}>
        {/* LEFT PANEL — 50% width */}
        <div
          ref={leftRef}
          data-pvh-panel='left'
          data-element-key='leftImageUrl'
          aria-hidden='true'
          className={selectableClass(activeKey === 'leftImageUrl')}
          style={composeStyle(
            PANEL_LEFT_STYLE,
            leftImages.length > 0 ? {} : { backgroundColor: '#1a1a1a' },
            styleOf('leftImageUrl')
          )}
        >
          {leftImages.length > 0 ? (
            <PurevisualsPanelCarousel
              images={leftImages}
              inView={inView}
              isScrolling={isScrolling}
              scrollActiveRef={scrollActiveRef}
            />
          ) : null}
        </div>

        {/* RIGHT PANEL — 50% width */}
        <div
          ref={rightRef}
          data-pvh-panel='right'
          data-element-key='rightImageUrl'
          aria-hidden='true'
          className={selectableClass(activeKey === 'rightImageUrl')}
          style={composeStyle(
            PANEL_RIGHT_STYLE,
            rightImages.length > 0 ? {} : { backgroundColor: '#262626' },
            styleOf('rightImageUrl')
          )}
        >
          {rightImages.length > 0 ? (
            <PurevisualsPanelCarousel
              images={rightImages}
              inView={inView}
              isScrolling={isScrolling}
              scrollActiveRef={scrollActiveRef}
            />
          ) : null}
        </div>

        {/* TEXT LAYER — nằm dưới panel, trồi lên khi cuộn */}
        <div
          ref={textRef}
          data-pvh-text
          style={composeStyle(TEXT_LAYER_STYLE, { color: textColor })}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: 'translateY(-5cqi)',
            }}
          >
            <h1
              data-element-key='heading'
              className={selectableClass(activeKey === 'heading')}
              style={composeStyle(HEADING_STYLE, styleOf('heading'))}
            >
              {heading}
            </h1>
            <div className='flex flex-col items-center gap-2 @3xl:flex-row @3xl:items-start @3xl:justify-between'>
              <p
                data-element-key='eyebrow'
                className={selectableClass(
                  activeKey === 'eyebrow',
                  'text-center @3xl:text-left'
                )}
                style={composeStyle(SUBHEADING_STYLE, styleOf('eyebrow'))}
              >
                {eyebrow}
              </p>
              <p
                data-element-key='subheading'
                className={selectableClass(
                  activeKey === 'subheading',
                  'text-center @3xl:text-right'
                )}
                style={composeStyle(SUBHEADING_STYLE, styleOf('subheading'))}
              >
                {subheading}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
