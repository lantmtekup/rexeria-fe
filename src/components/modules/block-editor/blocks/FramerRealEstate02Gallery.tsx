'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerRealEstate02GalleryContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';

interface Props {
  content: FramerRealEstate02GalleryContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const FONT_STACK =
  '"Inter", "Inter Placeholder", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

const COLORS = {
  accent: '#c49f8a',
  cream: '#e9e4dc',
} as const;

const TRAVEL = 24;
const DURATION = 0.65;
const EASE = 'power2.out';
const SLIDE_DURATION = 0.6;
const SLIDE_EASE = 'power2.out';

const IMAGE_KEYS = [
  'image1Url',
  'image2Url',
  'image3Url',
  'image4Url',
] as const;
const REAL_COUNT = IMAGE_KEYS.length;
const PAD = 2;

/**
 * Hai tier layout. `mobile` (<672) giữ nguyên toạ độ Framer gốc 375×704:
 * heading 2 dòng top-left, slider ảnh 307×307 (gap 12, hé lộ ảnh kế), nav
 * tròn + counter đáy. Không đổi một pixel nào ở nhánh này.
 *
 * `wide` (≥672): card nở 1440 theo aspect 1440/780 (giữ 375/704 ở 1440 → cao
 * ~2700px). Giữ ngữ pháp gốc — heading neo trên-trái, dải slider ngang hé
 * ảnh kế, nav dưới-trái, counter dưới-phải — chỉ scale bằng cqi/clamp.
 *
 * Clamp `N = maxPx / 1440 * 100`. Slide step đo thật qua ResizeObserver vì
 * `imageSize` wide là clamp (không hardcode px cho GSAP).
 */
const TIER = {
  mobile: {
    // 100% — fill frame mobile 390 (không khóa 375 → hở olive 2 mép).
    cardMaxWidth: '100%',
    cardAspect: '375 / 704',
    cardMinHeight: '0px',
    headingLeft: '20px',
    headingTop: '80px',
    headingBottom: 'auto',
    headingWidth: '220px',
    headingSize: '40.53px',
    headingLineHeight: '51.11px',
    headingTracking: '0.81px',
    sliderTop: '221px',
    sliderBottom: 'auto',
    sliderHeight: '307px',
    imageSize: '307px',
    imageGap: '12px',
    leftMargin: 24,
    navLeft: '20px',
    navTop: '569px',
    navBottom: 'auto',
    navSize: '35px',
    navGap: '8px',
    navIcon: 24,
    counterLeft: '293.5px',
    counterRight: 'auto',
    counterTop: '588px',
    counterBottom: 'auto',
    counterSize: '9.1px',
  },
  wide: {
    cardMaxWidth: '1440px',
    // Cao hơn 780: chừa dải riêng cho heading → slider → nav (không đè chữ lên ảnh).
    cardAspect: '1440 / 900',
    cardMinHeight: 'clamp(580px, 62.5cqi, 900px)',
    headingLeft: 'clamp(24px, 4cqi, 72px)',
    headingTop: 'clamp(40px, 4cqi, 64px)',
    headingBottom: 'auto',
    headingWidth: 'clamp(260px, 36cqi, 520px)',
    // ~4.8cqi (không 6.8cqi): 2 dòng hết ~160px, còn khoảng thở trước slider.
    headingSize: 'clamp(40px, 4.8cqi, 68px)',
    headingLineHeight: '1.2',
    headingTracking: '0.02em',
    // top = headingTop + 2.4×font (2 dòng × 1.2 lh) + gap — luôn dưới chữ.
    sliderTop:
      'calc(clamp(40px, 4cqi, 64px) + 2.4 * clamp(40px, 4.8cqi, 68px) + clamp(28px, 2.5cqi, 40px))',
    sliderBottom: 'auto',
    sliderHeight: 'clamp(280px, 32cqi, 460px)',
    imageSize: 'clamp(280px, 32cqi, 460px)',
    imageGap: '16px',
    // Fallback trước khi RO đo; wide thật lấy từ 4cqi card.
    leftMargin: 48,
    navLeft: 'clamp(24px, 4cqi, 72px)',
    navTop: 'auto',
    // Nav nằm trên dải nền dưới slider, không đè lên ảnh.
    navBottom: 'clamp(40px, 4.5cqi, 64px)',
    // Touch target ≥44px — canvas-block-responsive-spec §R8.
    navSize: '44px',
    navGap: '12px',
    navIcon: 22,
    counterLeft: 'auto',
    counterRight: 'clamp(24px, 4cqi, 72px)',
    counterTop: 'auto',
    counterBottom: 'clamp(52px, 5.2cqi, 76px)',
    counterSize: 'clamp(11px, 0.95cqi, 13px)',
  },
} as const;

const ROOT_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: '#565440',
};

const CARD_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: '375px',
  aspectRatio: '375 / 704',
  overflow: 'hidden',
  fontFamily: FONT_STACK,
};

const HEADING_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '20px',
  top: '80px',
  width: '220px',
  margin: 0,
  fontWeight: 300,
  fontSize: '40.53px',
  lineHeight: '51.11px',
  letterSpacing: '0.81px',
  textTransform: 'uppercase',
  color: COLORS.accent,
  zIndex: 2,
};

const SLIDER_VIEWPORT_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: '221px',
  height: '307px',
  overflow: 'hidden',
  zIndex: 1,
};

const TRACK_STYLE: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  height: '100%',
  willChange: 'transform',
};

const SLIDE_STYLE: React.CSSProperties = {
  position: 'relative',
  flex: 'none',
  width: '307px',
  height: '307px',
  overflow: 'hidden',
};

const SLIDE_IMAGE_STYLE: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const CANVAS_IMAGE_STYLE: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  pointerEvents: 'none',
};

const NAV_ROW_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '20px',
  top: '569px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  zIndex: 2,
};

const NAV_BUTTON_BASE_STYLE: React.CSSProperties = {
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  padding: 0,
  cursor: 'pointer',
  border: `1px solid ${COLORS.accent}`,
  transition: 'background-color 150ms ease, color 150ms ease',
};

const COUNTER_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '293.5px',
  top: '588px',
  margin: 0,
  fontWeight: 600,
  fontSize: '9.1px',
  lineHeight: 1.76,
  letterSpacing: '0.54px',
  textTransform: 'uppercase',
  color: COLORS.cream,
  zIndex: 2,
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function trackOffset(
  trackIndex: number,
  slideStep: number,
  leftMargin: number
): number {
  return leftMargin - trackIndex * slideStep;
}

export function FramerRealEstate02Gallery({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const lineRefs = React.useRef<Array<HTMLElement | null>>([]);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const trackIndexRef = React.useRef(PAD);
  const animatingRef = React.useRef(false);
  const slideStepRef = React.useRef(307 + 12);
  const leftMarginRef = React.useRef(24);

  const [index, setIndex] = React.useState(0);
  const [hoveredNav, setHoveredNav] = React.useState<'prev' | 'next' | null>(
    null
  );

  const isCanvas = useIsCanvasEdit(rootRef);
  const isMobile = useContainerMobile(rootRef);
  const tier = isMobile ? TIER.mobile : TIER.wide;

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const syncTrackMetrics = React.useCallback(() => {
    const track = trackRef.current;
    const card = cardRef.current;
    if (!track) return;

    const firstSlide = track.firstElementChild as HTMLElement | null;
    if (!firstSlide) return;

    const styles = window.getComputedStyle(track);
    const gapRaw = styles.columnGap || styles.gap || '0';
    const gap = Number.parseFloat(gapRaw) || 0;
    const slideW = firstSlide.offsetWidth;
    if (slideW <= 0) return;

    slideStepRef.current = slideW + gap;

    if (isMobile) {
      leftMarginRef.current = TIER.mobile.leftMargin;
    } else if (card) {
      const w = card.clientWidth;
      leftMarginRef.current = Math.min(72, Math.max(24, w * 0.04));
    } else {
      leftMarginRef.current = TIER.wide.leftMargin;
    }

    if (!animatingRef.current) {
      gsap.set(track, {
        x: trackOffset(
          trackIndexRef.current,
          slideStepRef.current,
          leftMarginRef.current
        ),
      });
    }
  }, [isMobile]);

  React.useLayoutEffect(() => {
    if (isCanvas) return;
    const track = trackRef.current;
    const card = cardRef.current;
    if (!track) return;

    syncTrackMetrics();

    const ro = new ResizeObserver(() => {
      syncTrackMetrics();
    });
    ro.observe(track);
    if (card) ro.observe(card);
    const first = track.firstElementChild;
    if (first instanceof HTMLElement) ro.observe(first);

    return () => ro.disconnect();
  }, [isCanvas, isMobile, syncTrackMetrics, content.image1Url]);

  const goTo = React.useCallback(
    (dir: 1 | -1) => {
      if (isCanvas || animatingRef.current) return;
      animatingRef.current = true;

      const track = trackRef.current;
      const nextTrackIndex = trackIndexRef.current + dir;
      const step = slideStepRef.current;
      const margin = leftMarginRef.current;
      const x = trackOffset(nextTrackIndex, step, margin);

      const settle = () => {
        let settled = nextTrackIndex;
        if (nextTrackIndex < PAD) {
          settled = PAD + REAL_COUNT - 1;
          gsap.set(track, { x: trackOffset(settled, step, margin) });
        } else if (nextTrackIndex >= PAD + REAL_COUNT) {
          settled = PAD;
          gsap.set(track, { x: trackOffset(settled, step, margin) });
        }
        trackIndexRef.current = settled;
        setIndex(settled - PAD);
        animatingRef.current = false;
      };

      if (!track) {
        settle();
        return;
      }
      if (prefersReducedMotion()) {
        gsap.set(track, { x });
        settle();
      } else {
        gsap.to(track, {
          x,
          duration: SLIDE_DURATION,
          ease: SLIDE_EASE,
          onComplete: settle,
        });
      }
    },
    [isCanvas]
  );

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      if (isCanvas) return;
      const root = rootRef.current;
      if (!root) return;

      const lines = lineRefs.current.filter((el): el is HTMLElement => !!el);
      if (!lines.length) return;

      if (prefersReducedMotion()) {
        gsap.set(lines, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(lines, { opacity: 0, y: TRAVEL });
      gsap.to(lines, {
        opacity: 1,
        y: 0,
        duration: DURATION,
        ease: EASE,
        stagger: 0.08,
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
        },
      });
    },
    [isCanvas]
  );

  const headingLines = content.heading.split('\n');

  const slides: Array<{
    renderKey: string;
    fieldKey: (typeof IMAGE_KEYS)[number] | null;
    url: string;
  }> = [
    ...IMAGE_KEYS.slice(REAL_COUNT - PAD).map((key, i) => ({
      renderKey: `clone-start-${i}`,
      fieldKey: null,
      url: content[key],
    })),
    ...IMAGE_KEYS.map(key => ({
      renderKey: key,
      fieldKey: key,
      url: content[key],
    })),
    ...IMAGE_KEYS.slice(0, PAD).map((key, i) => ({
      renderKey: `clone-end-${i}`,
      fieldKey: null,
      url: content[key],
    })),
  ];

  const navButtonStyle = (hovered: boolean): React.CSSProperties => ({
    ...NAV_BUTTON_BASE_STYLE,
    width: tier.navSize,
    height: tier.navSize,
    backgroundColor: hovered ? COLORS.accent : 'transparent',
    color: hovered ? '#ffffff' : COLORS.accent,
  });

  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-block='framer-realestate02-gallery'
        data-canvas-edit='true'
        className={cn('freg-root freg-root--canvas @container', className)}
        style={{
          position: 'relative',
          width: '100%',
          height: 'auto',
          // Nền olive giống production — canvas trắng khó nhìn block boundary.
          backgroundColor: ROOT_STYLE.backgroundColor,
          ...blockBackgroundStyle(background),
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: 16,
          }}
        >
          <div
            data-element-key='heading'
            style={composeStyle(
              { ...HEADING_STYLE, position: 'static', width: 'auto' },
              styleOf('heading')
            )}
            className={selectableClass(activeKey === 'heading')}
          >
            {headingLines.map((line, i, arr) => (
              <React.Fragment key={i}>
                {line}
                {i < arr.length - 1 ? <br /> : null}
              </React.Fragment>
            ))}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 8,
            }}
          >
            {IMAGE_KEYS.map(key => (
              <div
                key={key}
                data-element-key={key}
                className={selectableClass(activeKey === key)}
                style={composeStyle(
                  {
                    aspectRatio: '1 / 1',
                    overflow: 'hidden',
                    background: '#e8e8ea',
                  },
                  styleOf(key)
                )}
              >
                {content[key] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={content[key]} alt='' style={CANVAS_IMAGE_STYLE} />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      data-block='framer-realestate02-gallery'
      style={{ ...ROOT_STYLE, ...blockBackgroundStyle(background) }}
      className={cn('freg-root', className)}
    >
      <div
        ref={cardRef}
        style={{
          ...CARD_STYLE,
          maxWidth: tier.cardMaxWidth,
          aspectRatio: tier.cardAspect,
          minHeight: tier.cardMinHeight,
        }}
        className='freg-card @container'
      >
        <h1
          ref={headingRef}
          data-element-key='heading'
          style={composeStyle(
            HEADING_STYLE,
            {
              left: tier.headingLeft,
              top: tier.headingTop,
              bottom: tier.headingBottom,
              width: tier.headingWidth,
              fontSize: tier.headingSize,
              lineHeight: tier.headingLineHeight,
              letterSpacing: tier.headingTracking,
            },
            styleOf('heading')
          )}
          className={selectableClass(activeKey === 'heading', 'freg-heading')}
        >
          {headingLines.map((line, i) => (
            <span
              key={i}
              ref={el => {
                lineRefs.current[i] = el;
              }}
              style={{ display: 'block' }}
            >
              {line}
            </span>
          ))}
        </h1>

        <div
          style={{
            ...SLIDER_VIEWPORT_STYLE,
            top: tier.sliderTop,
            bottom: tier.sliderBottom,
            height: tier.sliderHeight,
          }}
        >
          <div
            ref={trackRef}
            style={{
              ...TRACK_STYLE,
              gap: tier.imageGap,
              // Fallback trước RO/gsap — tránh frame đầu x=0 lộ clone bên trái.
              transform: `translate3d(${trackOffset(
                PAD,
                isMobile ? 307 + 12 : 460 + 16,
                isMobile ? TIER.mobile.leftMargin : TIER.wide.leftMargin
              )}px,0,0)`,
            }}
          >
            {slides.map((slide, i) => {
              if (!slide.url) return null;
              return (
                <div
                  key={`${slide.renderKey}-${i}`}
                  style={{
                    ...SLIDE_STYLE,
                    width: tier.imageSize,
                    height: tier.imageSize,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.url}
                    alt=''
                    data-element-key={slide.fieldKey ?? undefined}
                    style={composeStyle(
                      SLIDE_IMAGE_STYLE,
                      slide.fieldKey ? styleOf(slide.fieldKey) : undefined
                    )}
                    className={
                      slide.fieldKey
                        ? selectableClass(activeKey === slide.fieldKey)
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            ...NAV_ROW_STYLE,
            left: tier.navLeft,
            top: tier.navTop,
            bottom: tier.navBottom,
            gap: tier.navGap,
          }}
        >
          <button
            type='button'
            style={navButtonStyle(hoveredNav === 'prev')}
            onClick={() => goTo(-1)}
            onMouseEnter={() => setHoveredNav('prev')}
            onMouseLeave={() => setHoveredNav(null)}
            aria-label='Ảnh trước'
          >
            <ArrowLeft aria-hidden='true' size={tier.navIcon} />
          </button>
          <button
            type='button'
            style={navButtonStyle(hoveredNav === 'next')}
            onClick={() => goTo(1)}
            onMouseEnter={() => setHoveredNav('next')}
            onMouseLeave={() => setHoveredNav(null)}
            aria-label='Ảnh kế tiếp'
          >
            <ArrowRight aria-hidden='true' size={tier.navIcon} />
          </button>
        </div>

        <p
          style={{
            ...COUNTER_STYLE,
            left: tier.counterLeft,
            right: tier.counterRight,
            top: tier.counterTop,
            bottom: tier.counterBottom,
            fontSize: tier.counterSize,
          }}
        >
          {index + 1}/{REAL_COUNT}
        </p>
      </div>
    </section>
  );
}
