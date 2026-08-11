'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerRealEstate02StoryContent,
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
  content: FramerRealEstate02StoryContent;
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
  panel: '#c49f8a',
  cream: '#e9e4dc',
  dark: '#2c2926',
  navIcon: 'rgb(86, 84, 64)',
  navHoverBg: '#555440',
  navHoverIcon: '#ffffff',
} as const;

const IMAGE_DURATION = 1.9;
const IMAGE_DURATION_PREV = 2.8;
const IMAGE_EASE = 'expo.out';
const IMAGE_ZOOM_FROM_NEXT = 1.15;
const IMAGE_ZOOM_TO_PREV = 1.15;
const CLIP_OPEN = 'inset(0% 0% 0% 0%)';
const CLIP_HIDDEN = 'inset(0% 100% 0% 0%)';
const TEXT_DURATION = 0.5;
const TEXT_FADE_DURATION = 1.2;
const TEXT_EASE = 'power2.out';
const TEXT_TRAVEL = 8;
const TEXT_OVERLAP = 0.22;

/**
 * Hai tier layout. `mobile` (<672) giữ nguyên tỉ lệ Framer gốc 375×781: ảnh
 * cao 70%, tiêu đề treo giữa khung (top 55%), panel caption 281×281 dính sát
 * góc dưới-phải. Không đổi một pixel nào ở nhánh này.
 *
 * `wide` (≥672): card 1440×960 (~3:2), ảnh full-bleed; title + panel nhấc khỏi
 * đáy (`titleBottom` / `panelBottom`) để không dính sát mép preview; title neo
 * góc dưới-trái với `titleRight: 42%` chừa panel.
 *
 * Clamp `N = maxPx / 1440 * 100`. Nhánh JS + composeStyle — không `!important`,
 * không đụng `data-element-key`.
 */
const TIER = {
  mobile: {
    // 100% — fill frame mobile 390 (không khóa 375 → hở olive 2 mép).
    cardMaxWidth: '100%',
    cardAspect: '375 / 781',
    cardMinHeight: '0px',
    imageStackHeight: '70%',
    titleTop: '55%',
    titleBottom: 'auto',
    titleLeft: '5%',
    titleRight: 'auto',
    titleWidth: '85%',
    titleTransform: 'translateY(-50%)',
    titleSize: '52px',
    titleWhiteSpace: 'nowrap',
    panelRight: '0px',
    panelBottom: '0px',
    panelWidth: '281px',
    panelHeight: '281px',
    panelMinHeight: '0px',
    panelPadding: '20px',
    labelSlotMinHeight: '22px',
    labelSize: '14px',
    bodyMarginTop: '15px',
    bodySize: '9.1px',
    bodyMaxWidth: '90%',
    counterSize: '9.1px',
    navSize: '35px',
    navGap: '8px',
    navIcon: 20,
    // Khung dọc 375: wipe ngang cần biên độ lớn mới đọc được.
    parallaxX: 24,
  },
  wide: {
    cardMaxWidth: '1440px',
    // 3:2 (960/1440) — gần ảnh vuông/landscape hơn 1440/780 (~1.85:1).
    cardAspect: '1440 / 960',
    cardMinHeight: 'clamp(560px, 66.7cqi, 960px)',
    imageStackHeight: '100%',
    titleTop: 'auto',
    // Nhấc title + panel khỏi đáy preview — không dính sát bottom edge.
    titleBottom: 'clamp(72px, 9cqi, 140px)',
    titleLeft: 'clamp(24px, 4cqi, 72px)',
    // % thuần — chừa chỗ panel ~28% + inset + gap.
    titleRight: '42%',
    titleWidth: 'auto',
    titleTransform: 'none',
    titleSize: 'clamp(32px, 4.8cqi, 72px)',
    // Tiêu đề dài do user tự nhập được xuống dòng thay vì bị overflow cắt.
    titleWhiteSpace: 'normal',
    panelRight: 'clamp(24px, 4cqi, 72px)',
    panelBottom: 'clamp(64px, 8cqi, 120px)',
    panelWidth: 'clamp(260px, 28cqi, 400px)',
    panelHeight: 'auto',
    panelMinHeight: 'clamp(280px, 26cqi, 360px)',
    panelPadding: 'clamp(24px, 2.4cqi, 36px)',
    labelSlotMinHeight: 'clamp(24px, 1.9cqi, 30px)',
    labelSize: 'clamp(14px, 1.15cqi, 18px)',
    bodyMarginTop: 'clamp(14px, 1.4cqi, 20px)',
    bodySize: 'clamp(11px, 0.95cqi, 13px)',
    bodyMaxWidth: '100%',
    counterSize: 'clamp(11px, 0.95cqi, 13px)',
    // Touch target ≥44px theo canvas-block-responsive-spec §R8.
    navSize: '44px',
    navGap: '12px',
    navIcon: 22,
    // 24% trên khung 1440 là ~345px trượt, quá đà cho ảnh ngang.
    parallaxX: 16,
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
  aspectRatio: '375 / 781',
  overflow: 'hidden',
  fontFamily: FONT_STACK,
};

const IMAGE_STACK_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  height: '70%',
  overflow: 'hidden',
};

const IMAGE_WRAP_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  clipPath: 'inset(0% 0% 0% 0%)',
};

const IMAGE_INNER_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  transformOrigin: 'left center',
};

const IMAGE_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
};

const TITLE_WRAP_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '5%',
  width: '85%',
  top: '55%',
  transform: 'translateY(-50%)',
  overflow: 'hidden',
  zIndex: 5,
};

const TITLE_STYLE: React.CSSProperties = {
  margin: 0,
  fontWeight: 300,
  fontSize: '52px',
  lineHeight: 1.2,
  color: COLORS.panel,
  whiteSpace: 'nowrap',
};

const PANEL_STYLE: React.CSSProperties = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  width: '281px',
  height: '281px',
  backgroundColor: COLORS.panel,
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  overflow: 'visible',
  zIndex: 20,
};

const LABEL_SLOT_STYLE: React.CSSProperties = {
  position: 'relative',
  minHeight: '22px',
  overflow: 'hidden',
};

const LABEL_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: '0 0 auto 0',
  margin: 0,
  fontWeight: 600,
  fontSize: '14px',
  lineHeight: 1.6,
  color: COLORS.cream,
};

const BODY_SLOT_STYLE: React.CSSProperties = {
  position: 'relative',
  flex: 1,
  minHeight: 0,
  marginTop: '15px',
  overflow: 'hidden',
};

const BODY_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: '0 0 auto 0',
  margin: 0,
  fontWeight: 600,
  fontSize: '9.1px',
  lineHeight: 1.76,
  letterSpacing: '0.54px',
  textTransform: 'uppercase',
  color: COLORS.dark,
  maxWidth: '90%',
};

const BOTTOM_ROW_STYLE: React.CSSProperties = {
  marginTop: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
};

const NAV_GROUP_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const NAV_BUTTON_BASE_STYLE: React.CSSProperties = {
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  padding: 0,
  transition: 'background-color 150ms ease, color 150ms ease',
};

function navButtonStyle(
  disabled: boolean,
  hovered: boolean,
  size: string
): React.CSSProperties {
  const active = hovered && !disabled;
  return {
    ...NAV_BUTTON_BASE_STYLE,
    width: size,
    height: size,
    border: `1px solid ${active ? COLORS.navHoverBg : COLORS.navIcon}`,
    backgroundColor: active ? COLORS.navHoverBg : 'transparent',
    color: active ? COLORS.navHoverIcon : COLORS.navIcon,
    opacity: disabled ? 0.4 : 1,
    cursor: disabled ? 'default' : 'pointer',
  };
}

const COUNTER_STYLE: React.CSSProperties = {
  margin: 0,
  fontWeight: 600,
  fontSize: '9.1px',
  lineHeight: 1.76,
  letterSpacing: '0.54px',
  textTransform: 'uppercase',
  color: COLORS.cream,
  textAlign: 'right',
};

interface SlideKeys {
  label: keyof FramerRealEstate02StoryContent;
  body: keyof FramerRealEstate02StoryContent;
  image: keyof FramerRealEstate02StoryContent;
}

const SLIDE_KEYS: SlideKeys[] = [
  { label: 'slide1Label', body: 'slide1Body', image: 'slide1ImageUrl' },
  { label: 'slide2Label', body: 'slide2Body', image: 'slide2ImageUrl' },
  { label: 'slide3Label', body: 'slide3Body', image: 'slide3ImageUrl' },
];

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function FramerRealEstate02Story({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const labelRefs = React.useRef<Array<HTMLParagraphElement | null>>([]);
  const bodyRefs = React.useRef<Array<HTMLParagraphElement | null>>([]);
  const imageWrapRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const imageInnerRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const titleRef = React.useRef<HTMLHeadingElement>(null);

  const [index, setIndex] = React.useState(0);
  const [hoveredNav, setHoveredNav] = React.useState<'prev' | 'next' | null>(
    null
  );

  const isCanvas = useIsCanvasEdit(rootRef);
  const isMobile = useContainerMobile(rootRef);
  const tier = isMobile ? TIER.mobile : TIER.wide;

  /**
   * Tiêu đề lớn render từ một node duy nhất (`SLIDE_KEYS[index].label`) nên
   * khi đổi slide nó thay chữ tức thời trong khi ảnh + panel có transition
   * ~1.9s. Ở khung 375 gần như không thấy; ở 1440 với chữ ~104px thì rất lộ.
   * Fade-in bù vào (chỉ có vào, không có ra) — giữ một node để không đẻ thêm
   * `data-element-key` trùng, tránh hỏng selection trong editor.
   */
  const isFirstTitleRender = React.useRef(true);
  React.useEffect(() => {
    if (isCanvas) return;
    if (isFirstTitleRender.current) {
      isFirstTitleRender.current = false;
      return;
    }
    const el = titleRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }
    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: TEXT_TRAVEL },
      {
        opacity: 1,
        y: 0,
        duration: TEXT_FADE_DURATION,
        ease: TEXT_EASE,
      }
    );
    return () => {
      tween.kill();
    };
  }, [index, isCanvas]);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const goTo = React.useCallback(
    (next: number) => {
      if (isCanvas) return;
      const clamped = gsap.utils.clamp(0, 2, next);
      if (clamped === index) return;
      const prevIndex = index;
      const direction = clamped > prevIndex ? 'next' : 'prev';
      setIndex(clamped);

      const reduce = prefersReducedMotion();

      const oldTextCandidates: Array<HTMLElement | null> = [
        labelRefs.current[prevIndex],
        bodyRefs.current[prevIndex],
      ];
      const newTextCandidates: Array<HTMLElement | null> = [
        labelRefs.current[clamped],
        bodyRefs.current[clamped],
      ];
      const oldTextEls = oldTextCandidates.filter(
        (el): el is HTMLElement => !!el
      );
      const newTextEls = newTextCandidates.filter(
        (el): el is HTMLElement => !!el
      );

      if (reduce) {
        gsap.set(oldTextEls, { opacity: 0, y: 0 });
        gsap.set(newTextEls, { opacity: 1, y: 0 });
      } else {
        gsap.set(newTextEls, { opacity: 0, y: TEXT_TRAVEL });
        const textTl = gsap.timeline();
        textTl.to(
          oldTextEls,
          { y: TEXT_TRAVEL, duration: TEXT_DURATION, ease: TEXT_EASE },
          0
        );
        textTl.to(
          oldTextEls,
          { opacity: 0, duration: TEXT_FADE_DURATION, ease: TEXT_EASE },
          0
        );
        textTl.to(
          newTextEls,
          { y: 0, duration: TEXT_DURATION, ease: TEXT_EASE },
          TEXT_OVERLAP
        );
        textTl.to(
          newTextEls,
          { opacity: 1, duration: TEXT_FADE_DURATION, ease: TEXT_EASE },
          TEXT_OVERLAP
        );
      }

      const allWraps = imageWrapRefs.current.filter(
        (el): el is HTMLDivElement => !!el
      );
      const allInners = imageInnerRefs.current.filter(
        (el): el is HTMLDivElement => !!el
      );
      gsap.killTweensOf([...allWraps, ...allInners]);
      SLIDE_KEYS.forEach((_, i) => {
        const wrap = imageWrapRefs.current[i];
        const inner = imageInnerRefs.current[i];
        if (wrap) {
          gsap.set(wrap, {
            clipPath: CLIP_OPEN,
            zIndex: i === prevIndex ? 2 : i === clamped ? 1 : 0,
          });
        }
        if (inner) gsap.set(inner, { scale: 1, xPercent: 0 });
      });

      const outWrap = imageWrapRefs.current[prevIndex];
      const inWrap = imageWrapRefs.current[clamped];
      const outInner = imageInnerRefs.current[prevIndex];
      const inInner = imageInnerRefs.current[clamped];
      const duration =
        direction === 'next' ? IMAGE_DURATION : IMAGE_DURATION_PREV;

      if (reduce) {
        gsap.set(outWrap, {
          clipPath: direction === 'next' ? CLIP_HIDDEN : CLIP_OPEN,
          zIndex: direction === 'next' ? 0 : 2,
        });
        gsap.set(inWrap, {
          clipPath: CLIP_OPEN,
          zIndex: direction === 'next' ? 1 : 3,
        });
        gsap.set([outInner, inInner], { scale: 1, xPercent: 0 });
        return;
      }

      if (direction === 'next') {
        gsap.to(outWrap, {
          clipPath: CLIP_HIDDEN,
          duration,
          ease: IMAGE_EASE,
        });
        gsap.to(outInner, {
          xPercent: -tier.parallaxX,
          duration,
          ease: IMAGE_EASE,
        });
        gsap.set(inInner, { scale: IMAGE_ZOOM_FROM_NEXT });
        gsap.to(inInner, { scale: 1, duration, ease: IMAGE_EASE });
      } else {
        gsap.set(inWrap, { clipPath: CLIP_HIDDEN, zIndex: 3 });
        gsap.to(inWrap, {
          clipPath: CLIP_OPEN,
          duration,
          ease: IMAGE_EASE,
        });
        gsap.set(inInner, { xPercent: -tier.parallaxX });
        gsap.to(inInner, { xPercent: 0, duration, ease: IMAGE_EASE });
        gsap.to(outInner, {
          scale: IMAGE_ZOOM_TO_PREV,
          duration,
          ease: IMAGE_EASE,
        });
      }
    },
    [index, isCanvas, tier]
  );

  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-block='framer-realestate02-story'
        data-canvas-edit='true'
        className={cn('fres-root fres-root--canvas @container', className)}
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
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
            padding: 16,
          }}
        >
          {SLIDE_KEYS.map((keys, slideIndex) => (
            <div
              key={keys.label}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: `1px solid ${COLORS.dark}33`,
                backgroundColor: COLORS.cream,
                fontFamily: FONT_STACK,
              }}
            >
              <span
                aria-hidden='true'
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  zIndex: 2,
                  padding: '2px 8px',
                  borderRadius: 999,
                  backgroundColor: COLORS.dark,
                  color: COLORS.cream,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  lineHeight: 1.4,
                  pointerEvents: 'none',
                }}
              >
                {slideIndex + 1}/3
              </span>
              <div
                data-element-key={keys.image}
                className={selectableClass(activeKey === keys.image)}
                style={composeStyle(
                  {
                    width: '100%',
                    aspectRatio: '375 / 500',
                    overflow: 'hidden',
                    background: '#e8e8ea',
                  },
                  styleOf(keys.image)
                )}
              >
                {content[keys.image] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={content[keys.image]}
                    alt=''
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      pointerEvents: 'none',
                    }}
                  />
                ) : null}
              </div>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  minHeight: 200,
                  padding: 16,
                  backgroundColor: COLORS.panel,
                }}
              >
                <p
                  data-element-key={keys.label}
                  style={composeStyle(
                    LABEL_STYLE,
                    {
                      position: 'static',
                      color: COLORS.dark,
                      fontSize: 16,
                      lineHeight: 1.35,
                      minHeight: 28,
                    },
                    styleOf(keys.label)
                  )}
                  className={selectableClass(activeKey === keys.label)}
                >
                  {content[keys.label]}
                </p>
                <p
                  data-element-key={keys.body}
                  style={composeStyle(
                    BODY_STYLE,
                    {
                      position: 'static',
                      color: COLORS.dark,
                      textTransform: 'none',
                      // Production 9.1px quá nhỏ để đọc/chọn khi đang edit.
                      fontSize: 13,
                      lineHeight: 1.55,
                      letterSpacing: '0.02em',
                      maxWidth: '100%',
                      minHeight: 72,
                    },
                    styleOf(keys.body)
                  )}
                  className={selectableClass(activeKey === keys.body)}
                >
                  {content[keys.body]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      data-block='framer-realestate02-story'
      style={{ ...ROOT_STYLE, ...blockBackgroundStyle(background) }}
      className={cn('fres-root', className)}
    >
      <div
        style={{
          ...CARD_STYLE,
          maxWidth: tier.cardMaxWidth,
          aspectRatio: tier.cardAspect,
          minHeight: tier.cardMinHeight,
        }}
        className='fres-card @container'
      >
        <div style={{ ...IMAGE_STACK_STYLE, height: tier.imageStackHeight }}>
          {SLIDE_KEYS.map((keys, i) => {
            const url = content[keys.image];
            if (!url) return null;
            return (
              <div
                key={keys.image}
                ref={el => {
                  imageWrapRefs.current[i] = el;
                }}
                style={{
                  ...IMAGE_WRAP_STYLE,
                  zIndex: i === 0 ? 2 : 0,
                }}
              >
                <div
                  ref={el => {
                    imageInnerRefs.current[i] = el;
                  }}
                  style={IMAGE_INNER_STYLE}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=''
                    data-element-key={keys.image}
                    style={composeStyle(IMAGE_STYLE, styleOf(keys.image))}
                    className={selectableClass(activeKey === keys.image)}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            ...TITLE_WRAP_STYLE,
            top: tier.titleTop,
            bottom: tier.titleBottom,
            left: tier.titleLeft,
            right: tier.titleRight,
            width: tier.titleWidth,
            transform: tier.titleTransform,
            // Clip chữ dài trước mép panel — không để paint đè z-index panel.
            overflow: 'hidden',
            maxWidth: '100%',
          }}
        >
          <h2
            ref={titleRef}
            data-element-key={SLIDE_KEYS[index].label}
            style={composeStyle(
              TITLE_STYLE,
              styleOf(SLIDE_KEYS[index].label),
              // Tier SAU styleOf — fontSize/whiteSpace layout không bị editor đè.
              {
                fontSize: tier.titleSize,
                whiteSpace: tier.titleWhiteSpace,
                maxWidth: '100%',
                overflow: 'hidden',
              }
            )}
            className={selectableClass(activeKey === SLIDE_KEYS[index].label)}
          >
            {content[SLIDE_KEYS[index].label]}
          </h2>
        </div>

        <div
          style={{
            ...PANEL_STYLE,
            right: tier.panelRight,
            bottom: tier.panelBottom,
            width: tier.panelWidth,
            height: tier.panelHeight,
            minHeight: tier.panelMinHeight,
            padding: tier.panelPadding,
          }}
        >
          <div
            style={{
              ...LABEL_SLOT_STYLE,
              minHeight: tier.labelSlotMinHeight,
            }}
          >
            {SLIDE_KEYS.map((keys, i) => (
              <p
                key={keys.label}
                ref={el => {
                  labelRefs.current[i] = el;
                }}
                data-element-key={keys.label}
                style={composeStyle(
                  LABEL_STYLE,
                  { fontSize: tier.labelSize },
                  styleOf(keys.label),
                  { opacity: i === 0 ? 1 : 0 }
                )}
                className={selectableClass(activeKey === keys.label)}
              >
                {content[keys.label]}
              </p>
            ))}
          </div>

          <div style={{ ...BODY_SLOT_STYLE, marginTop: tier.bodyMarginTop }}>
            {SLIDE_KEYS.map((keys, i) => (
              <p
                key={keys.body}
                ref={el => {
                  bodyRefs.current[i] = el;
                }}
                data-element-key={keys.body}
                style={composeStyle(
                  BODY_STYLE,
                  { fontSize: tier.bodySize, maxWidth: tier.bodyMaxWidth },
                  styleOf(keys.body),
                  { opacity: i === 0 ? 1 : 0 }
                )}
                className={selectableClass(activeKey === keys.body)}
              >
                {content[keys.body]}
              </p>
            ))}
          </div>

          <div style={BOTTOM_ROW_STYLE}>
            <div style={{ ...NAV_GROUP_STYLE, gap: tier.navGap }}>
              {(() => {
                const prevDisabled = index === 0;
                const nextDisabled = index === 2;
                return (
                  <>
                    <button
                      type='button'
                      style={navButtonStyle(
                        prevDisabled,
                        hoveredNav === 'prev',
                        tier.navSize
                      )}
                      disabled={prevDisabled}
                      onClick={() => goTo(index - 1)}
                      onMouseEnter={() => setHoveredNav('prev')}
                      onMouseLeave={() => setHoveredNav(null)}
                      aria-label='Previous slide'
                    >
                      <ArrowLeft aria-hidden='true' size={tier.navIcon} />
                    </button>
                    <button
                      type='button'
                      style={navButtonStyle(
                        nextDisabled,
                        hoveredNav === 'next',
                        tier.navSize
                      )}
                      disabled={nextDisabled}
                      onClick={() => goTo(index + 1)}
                      onMouseEnter={() => setHoveredNav('next')}
                      onMouseLeave={() => setHoveredNav(null)}
                      aria-label='Next slide'
                    >
                      <ArrowRight aria-hidden='true' size={tier.navIcon} />
                    </button>
                  </>
                );
              })()}
            </div>
            <p style={{ ...COUNTER_STYLE, fontSize: tier.counterSize }}>
              {index + 1}/3
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
