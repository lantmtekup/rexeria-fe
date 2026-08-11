'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerRealEstate02CommuteContent,
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
  content: FramerRealEstate02CommuteContent;
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
  bg: '#e9e4dc',
  text: '#565440',
  accent: '#c49f8a',
  divider: '#cec9c1',
} as const;

const RING_SWEEP_FRACTION = 0.25;
const COUNTER_STEP_MS = 80;
const RING_DURATION = 0.9;
const RING_EASE = 'sine.inOut';
const COUNTER_ENTER_START = 'top 85%';
const RING_ENTER_START = 'top 55%';
const RING_LEAVE_BACK_START = 'top 60%';
const RING_MIN_RESIDUAL_PX = 10;

const RING_VIEWBOX = 285;
const RING_CENTER = RING_VIEWBOX / 2;
const RING_STROKE = 8.5;
const RING_RADIUS = RING_CENTER - RING_STROKE / 2;
const RING_TRACK_STROKE = 2;
const RING_TRACK_RADIUS = RING_CENTER - RING_TRACK_STROKE / 2;
const RING_LINE_STROKE = 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const FADE_DURATION = 0.7;
const FADE_EASE = 'power2.out';
const FADE_Y = 16;

// 108/220 của khung ảnh xe. Dùng `yPercent` thay vì `y: -108` để một hằng số
// chạy đúng cho cả hai tier — tier wide sizing ảnh bằng aspect-ratio nên chiều
// cao không còn là 220px cố định. Ở mobile -49.0909% × 220px = -108px, khớp
// tuyệt đối giá trị cũ.
const CAR_SLIDE_PERCENT = (108 / 220) * 100;
const CAR_SLIDE_DURATION = 1.4;
const CAR_SLIDE_EASE = 'power3.out';

/**
 * Hai tier layout. `mobile` (<672) giữ nguyên toạ độ Framer gốc 375×1038:
 * vòng tròn trên cùng → eyebrow/heading dưới nó → khối "BY CAR" ở nửa dưới.
 * Không đổi một pixel nào ở nhánh này.
 *
 * `wide` (≥672): xoay chồng dọc đó thành BA CỘT trên card 1440×640 —
 * TRÁI vòng tròn + số phút, GIỮA eyebrow/heading, PHẢI khối "BY CAR".
 * Scale thẳng bố cục mobile là hỏng: aspect 375/1038 ở 1440 cho card cao
 * 3986px, và mọi `cqi` đang tính theo card 375 sẽ nở gần 4× (số phút 80px →
 * 307px, "BY CAR" 40.5px → 155px).
 *
 * Ba mốc ngang của tier wide phải khớp nhau bằng tay vì đều là sibling
 * absolute: vòng tròn `4% + 20cqi` → cột chữ mở ở `4% + 20cqi + 3.5cqi`
 * (= 27.5% @1440) rộng 24% → hết ở 51.5%, chừa 4.5% trước khi khối "BY CAR"
 * mở ở 56%. Đổi `ringWidth` là phải tính lại `eyebrowLeft`/`headingLeft`.
 *
 * Toạ độ DỌC bên trong khối "BY CAR" (row tops, divider tops) giữ nguyên %
 * của mobile: khoảng trống đáy ~19% chiều cao khối là như nhau ở cả hai tier
 * nên tỉ lệ đọc y hệt. Chỉ left/font-size/line-height cần tier riêng.
 *
 * Clamp `N = maxPx / 1440 * 100`.
 */
const TIER = {
  mobile: {
    // 100% — fill frame mobile 390 (không khóa 375 → hở olive 2 mép).
    cardMaxWidth: '100%',
    cardAspect: '375 / 1038',
    cardMinHeight: '0px',
    ringLeft: '12%',
    ringTop: '13.87%',
    ringWidth: '76%',
    ringTransform: 'none',
    counterSize: '80px',
    eyebrowLeft: '5.33%',
    eyebrowTop: '31.5%',
    eyebrowSize: 'clamp(9px, 2.9cqi, 11px)',
    eyebrowLineHeight: '14px',
    headingLeft: '5.33%',
    headingTop: '34.4%',
    headingWidth: '51.2%',
    headingSize: 'clamp(13px, 4.16cqi, 15.6px)',
    headingLineHeight: '20.76px',
    carSectionLeft: '6%',
    carSectionTop: '49%',
    carSectionWidth: '88%',
    carSectionHeight: '38.6%',
    carSectionTransform: 'none',
    carHeadingLeft: '23%',
    carHeadingTransform: 'translateX(-50%)',
    carHeadingSize: 'clamp(28px, 10.8cqi, 40.5px)',
    carHeadingLineHeight: '51.11px',
    carPhotoLeft: 'calc(82.12121212121214% - 117px / 2)',
    carPhotoRight: 'auto',
    carPhotoTop: '108px',
    carPhotoWidth: '117px',
    carPhotoHeight: '220px',
    carPhotoAspect: 'auto',
    // `null` = giữ toạ độ trái gốc của từng dòng (7/24, 6/28, 7/22 — Framer
    // canh tâm nên mỗi dòng lệch một chút theo bề rộng chữ).
    rowValueLeft: null,
    rowLabelLeft: null,
    rowTransform: 'translateX(-50%)',
    rowValueSize: 'clamp(26px, 9.7cqi, 36.5px)',
    rowValueLineHeight: '51.19px',
    rowLabelSize: 'clamp(9px, 3cqi, 11px)',
    rowLabelLineHeight: '16px',
    dividerWidth: '68.48%',
  },
  wide: {
    cardMaxWidth: '1440px',
    cardAspect: '1440 / 640',
    cardMinHeight: 'clamp(420px, 44.4cqi, 640px)',
    ringLeft: '4%',
    ringTop: '50%',
    ringWidth: '20cqi',
    ringTransform: 'translateY(-50%)',
    // 0.28 × đường kính, đúng tỉ lệ 80/285 của mobile.
    counterSize: 'clamp(30px, 5.6cqi, 82px)',
    eyebrowLeft: 'calc(4% + 20cqi + 3.5cqi)',
    eyebrowTop: '42.5%',
    eyebrowSize: 'clamp(10px, 0.85cqi, 13px)',
    eyebrowLineHeight: '1.3',
    headingLeft: 'calc(4% + 20cqi + 3.5cqi)',
    headingTop: '47.5%',
    headingWidth: '24%',
    headingSize: 'clamp(14px, 1.5cqi, 22px)',
    headingLineHeight: '1.38',
    carSectionLeft: '56%',
    // KHÔNG canh giữa khối bằng `translateY(-50%)`: ~19% đáy khối là khoảng
    // trống thừa kế từ mobile (ở mobile ảnh xe rơi vào đó, ở đây ảnh nằm bên
    // phải). Canh giữa cái HỘP thì phần NHÌN THẤY bị đẩy lên, chừa ~180px chết
    // dưới đáy card. 22.5% là mốc canh giữa phần nhìn thấy: khối cao 68%,
    // dòng cuối kết thúc ở ~0.6908×68% + line-height ⇒ nội dung ~55% chiều cao
    // card ⇒ lề trên = lề dưới ≈ 22.5%.
    carSectionTop: '22.5%',
    carSectionWidth: '40%',
    carSectionHeight: '68%',
    carSectionTransform: 'none',
    carHeadingLeft: '0%',
    carHeadingTransform: 'none',
    carHeadingSize: 'clamp(28px, 3.1cqi, 45px)',
    carHeadingLineHeight: '1.26',
    // Ảnh xe neo mép phải khối và cao theo aspect nguồn 117/220 — giữ
    // `height: 220px` thì ở 1440 ảnh lùn hẳn so với khối cao 435px.
    carPhotoLeft: 'auto',
    carPhotoRight: '2%',
    // 14% ⇒ tâm ảnh xe trùng tâm cụm 3 dòng bên trái (~±3px ở cả 834 lẫn 1440).
    carPhotoTop: '14%',
    carPhotoWidth: 'clamp(80px, 8.3cqi, 120px)',
    carPhotoHeight: 'auto',
    carPhotoAspect: '117 / 220',
    // Canh trái thay vì canh tâm: ở khối rộng 576px, `translateX(-50%)` +
    // left 7% đẩy số ra sát mép còn nhãn thì trôi xa ~60px — đọc như hai cột
    // rời nhau. Nhãn dùng `cqi` (theo card, không theo khối) nên khoảng cách
    // số↔nhãn giữ ~12px ở 672 và ~31px ở 1440.
    rowValueLeft: '0%',
    rowLabelLeft: 'clamp(38px, 5.2cqi, 76px)',
    rowTransform: 'none',
    rowValueSize: 'clamp(24px, 2.8cqi, 40px)',
    rowValueLineHeight: '1.28',
    rowLabelSize: 'clamp(10px, 0.85cqi, 13px)',
    rowLabelLineHeight: '1.45',
    // 68.48% (= 394px @1440) đâm vào ảnh xe ở dải 672–834; 60% chừa đủ.
    dividerWidth: '60%',
  },
} as const;

type Tier = (typeof TIER)[keyof typeof TIER];

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
  aspectRatio: '375 / 1038',
  overflow: 'hidden',
  backgroundColor: COLORS.bg,
  fontFamily: FONT_STACK,
};

const RING_BOX_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '12%',
  top: '13.87%',
  width: '76%',
  aspectRatio: '1 / 1',
};

const RING_SVG_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  zIndex: 0,
};

const COUNTER_WRAP_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const COUNTER_TEXT_STYLE: React.CSSProperties = {
  margin: 0,
  fontWeight: 300,
  fontSize: '80px',
  color: '#565441',
};

const EYEBROW_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '5.33%',
  top: '31.5%',
  margin: 0,
  fontWeight: 400,
  fontSize: 'clamp(9px, 2.9cqi, 11px)',
  lineHeight: '14px',
  letterSpacing: '0.54px',
  textTransform: 'uppercase',
  color: COLORS.text,
};

const HEADING_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '5.33%',
  top: '34.4%',
  width: '51.2%',
  margin: 0,
  fontWeight: 400,
  fontSize: 'clamp(13px, 4.16cqi, 15.6px)',
  lineHeight: '20.76px',
  letterSpacing: '0.61px',
  textTransform: 'uppercase',
  color: COLORS.text,
};

const CAR_SECTION_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '6%',
  top: '49%',
  width: '88%',
  height: '38.6%',
};

const CAR_HEADING_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '23%',
  top: 0,
  transform: 'translateX(-50%)',
  margin: 0,
  fontWeight: 300,
  fontSize: 'clamp(28px, 10.8cqi, 40.5px)',
  lineHeight: '51.11px',
  letterSpacing: '0.81px',
  textTransform: 'uppercase',
  color: COLORS.accent,
  whiteSpace: 'nowrap',
};

const CAR_PHOTO_WRAP_STYLE: React.CSSProperties = {
  height: '220px',
  left: 'calc(82.12121212121214% - 117px / 2)',
  position: 'absolute',
  top: '108px',
  width: '117px',
};

const CAR_VARIANT_STYLE: React.CSSProperties = {
  height: '100%',
  width: '100%',
  opacity: 1,
  overflow: 'visible',
  position: 'relative',
};

// `bottom: -50%` + `height: 100%` thay cho -110px/220px gốc: cùng con số ở
// mobile (khung 220px) nhưng theo được khung cao-theo-aspect của tier wide.
const CAR_PICTURE_STYLE: React.CSSProperties = {
  transform: 'none',
  transformOrigin: '50% 50% 0px',
  bottom: '-50%',
  flex: 'none',
  gap: '0px',
  height: '100%',
  left: 0,
  overflow: 'visible',
  position: 'absolute',
  right: 0,
};

const CAR_IMAGE_WRAPPER_STYLE: React.CSSProperties = {
  position: 'absolute',
  borderRadius: 'inherit',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const CAR_PHOTO_STYLE: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
  objectPosition: 'center',
  objectFit: 'fill',
};

function rowValueStyle(
  tier: Tier,
  leftPct: number,
  topPct: number
): React.CSSProperties {
  return {
    position: 'absolute',
    left: tier.rowValueLeft ?? `${leftPct}%`,
    top: `${topPct}%`,
    transform: tier.rowTransform,
    margin: 0,
    fontWeight: 300,
    fontSize: tier.rowValueSize,
    lineHeight: tier.rowValueLineHeight,
    letterSpacing: '0.81px',
    textTransform: 'uppercase',
    color: COLORS.text,
    whiteSpace: 'nowrap',
  };
}

function rowLabelStyle(
  tier: Tier,
  leftPct: number,
  topPct: number
): React.CSSProperties {
  return {
    position: 'absolute',
    left: tier.rowLabelLeft ?? `${leftPct}%`,
    top: `${topPct}%`,
    transform: tier.rowTransform,
    fontWeight: 400,
    fontSize: tier.rowLabelSize,
    lineHeight: tier.rowLabelLineHeight,
    letterSpacing: '0.44px',
    textTransform: 'uppercase',
    color: COLORS.text,
    whiteSpace: 'nowrap',
  };
}

const DIVIDER_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  height: '1px',
  backgroundColor: COLORS.divider,
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function toInt(value: string, fallback: number): number {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function FramerRealEstate02Commute({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const ringBoxRef = React.useRef<HTMLDivElement>(null);
  const ringProgressRef = React.useRef<SVGCircleElement>(null);
  const ringLineRef = React.useRef<SVGLineElement>(null);
  const counterTextRef = React.useRef<HTMLSpanElement>(null);
  const eyebrowRef = React.useRef<HTMLParagraphElement>(null);
  const headingRef = React.useRef<HTMLParagraphElement>(null);
  const carHeadingRef = React.useRef<HTMLParagraphElement>(null);
  const carPhotoWrapRef = React.useRef<HTMLDivElement>(null);
  const row1ValueRef = React.useRef<HTMLParagraphElement>(null);
  const row1LabelRef = React.useRef<HTMLDivElement>(null);
  const row2ValueRef = React.useRef<HTMLParagraphElement>(null);
  const row2LabelRef = React.useRef<HTMLDivElement>(null);
  const row3ValueRef = React.useRef<HTMLParagraphElement>(null);
  const row3LabelRef = React.useRef<HTMLDivElement>(null);

  const isCanvas = useIsCanvasEdit(rootRef);
  const isMobile = useContainerMobile(rootRef);
  const tier: Tier = isMobile ? TIER.mobile : TIER.wide;

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const walkMinutes = toInt(content.walkMinutes, 0);
  const dashOffsetAtRest = RING_CIRCUMFERENCE * (1 - RING_SWEEP_FRACTION);
  const dashOffsetMin = RING_CIRCUMFERENCE - RING_MIN_RESIDUAL_PX;
  const lineAngleAtRest = RING_SWEEP_FRACTION * 360;
  const lineTrackCircumference = 2 * Math.PI * RING_TRACK_RADIUS;
  const lineAngleMin = (RING_MIN_RESIDUAL_PX / lineTrackCircumference) * 360;

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      if (isCanvas) return;
      const root = rootRef.current;
      if (!root) return;

      const reduceMotion = prefersReducedMotion();
      if (reduceMotion) return;

      const ringBox = ringBoxRef.current;
      const counterText = counterTextRef.current;
      const ringProgress = ringProgressRef.current;
      const ringLine = ringLineRef.current;

      if (counterText && walkMinutes > 0) {
        const counterProxy = { value: 0 };
        const counterTween = gsap.fromTo(
          counterProxy,
          { value: 0 },
          {
            value: walkMinutes,
            duration: (walkMinutes * COUNTER_STEP_MS) / 1000,
            ease: RING_EASE,
            paused: true,
            onUpdate: () => {
              counterText.textContent = String(Math.round(counterProxy.value));
            },
          }
        );

        ScrollTrigger.create({
          trigger: ringBox,
          scroller,
          start: COUNTER_ENTER_START,
          end: 'bottom top',
          invalidateOnRefresh: true,
          onEnter: () => counterTween.play(),
          onEnterBack: () => counterTween.play(),
          onLeave: () => counterTween.reverse(),
          onLeaveBack: () => counterTween.reverse(),
        });
      }

      if (ringProgress && ringLine) {
        const ringTween = gsap.fromTo(
          ringProgress,
          { strokeDashoffset: dashOffsetMin },
          {
            strokeDashoffset: dashOffsetAtRest,
            duration: RING_DURATION,
            ease: RING_EASE,
            paused: true,
          }
        );

        const lineProxy = { angle: lineAngleMin };
        const lineTween = gsap.fromTo(
          lineProxy,
          { angle: lineAngleMin },
          {
            angle: lineAngleAtRest,
            duration: RING_DURATION,
            ease: RING_EASE,
            paused: true,
            onUpdate: () => {
              gsap.set(ringLine, {
                attr: {
                  transform: `rotate(${lineProxy.angle} ${RING_CENTER} ${RING_CENTER})`,
                },
              });
            },
          }
        );

        const ringEnterTrigger = ScrollTrigger.create({
          trigger: ringBox,
          scroller,
          start: RING_ENTER_START,
          end: 'bottom 60%',
          invalidateOnRefresh: true,
          onEnter: () => {
            ringTween.play();
            lineTween.play();
          },
          onEnterBack: () => {
            ringTween.play();
            lineTween.play();
          },
        });

        ScrollTrigger.create({
          trigger: ringBox,
          scroller,
          start: RING_LEAVE_BACK_START,
          invalidateOnRefresh: true,
          onLeaveBack: () => {
            ringTween.reverse();
            lineTween.reverse();
          },
        });

        if (ringEnterTrigger.progress >= 1) {
          ringTween.progress(1);
          lineTween.progress(1);
        } else if (ringEnterTrigger.isActive) {
          ringTween.play();
          lineTween.play();
        }
      }

      const carPhotoWrap = carPhotoWrapRef.current;
      if (carPhotoWrap) {
        gsap.fromTo(
          carPhotoWrap,
          { yPercent: 0 },
          {
            yPercent: -CAR_SLIDE_PERCENT,
            duration: CAR_SLIDE_DURATION,
            ease: CAR_SLIDE_EASE,
            scrollTrigger: {
              trigger: carPhotoWrap,
              scroller,
              start: 'top 40%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      }

      const viewportTop = scroller ? scroller.getBoundingClientRect().top : 0;
      const viewportBottom = scroller
        ? scroller.getBoundingClientRect().bottom
        : window.innerHeight;
      const isInViewportNow = (el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        return rect.bottom > viewportTop && rect.top < viewportBottom;
      };

      const mountFadeTargets: HTMLElement[] = (
        [
          eyebrowRef.current,
          headingRef.current,
          carHeadingRef.current,
          row1ValueRef.current,
          row1LabelRef.current,
          row2ValueRef.current,
          row2LabelRef.current,
          row3ValueRef.current,
          row3LabelRef.current,
        ] as Array<HTMLElement | null>
      )
        .filter((el): el is HTMLElement => !!el)
        .filter(isInViewportNow);

      if (mountFadeTargets.length) {
        gsap.fromTo(
          mountFadeTargets,
          { opacity: 0, y: FADE_Y },
          {
            opacity: 1,
            y: 0,
            duration: FADE_DURATION,
            ease: FADE_EASE,
            stagger: 0.08,
          }
        );
      }
    },
    [isCanvas, tier]
  );

  return (
    <section
      ref={rootRef}
      data-block='framer-realestate02-commute'
      style={{ ...ROOT_STYLE, ...blockBackgroundStyle(background) }}
      className={cn('frec-root', className)}
    >
      <div
        style={{
          ...CARD_STYLE,
          maxWidth: tier.cardMaxWidth,
          aspectRatio: tier.cardAspect,
          minHeight: tier.cardMinHeight,
        }}
        className='frec-card @container'
      >
        <div
          ref={ringBoxRef}
          style={{
            ...RING_BOX_STYLE,
            left: tier.ringLeft,
            top: tier.ringTop,
            width: tier.ringWidth,
            transform: tier.ringTransform,
          }}
        >
          <svg
            viewBox={`0 0 ${RING_VIEWBOX} ${RING_VIEWBOX}`}
            style={RING_SVG_STYLE}
            aria-hidden='true'
          >
            <circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_TRACK_RADIUS}
              fill='none'
              stroke={COLORS.accent}
              strokeOpacity={0.35}
              strokeWidth={RING_TRACK_STROKE}
            />
            <circle
              ref={ringProgressRef}
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              fill='none'
              stroke={COLORS.accent}
              strokeWidth={RING_STROKE}
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffsetAtRest}
              transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}
            />
            <line
              ref={ringLineRef}
              x1={RING_CENTER}
              y1={RING_CENTER}
              x2={RING_CENTER}
              y2={RING_CENTER - RING_TRACK_RADIUS}
              stroke={COLORS.accent}
              strokeWidth={RING_LINE_STROKE}
              transform={`rotate(${lineAngleAtRest} ${RING_CENTER} ${RING_CENTER})`}
            />
          </svg>
          <div style={COUNTER_WRAP_STYLE}>
            <span
              ref={counterTextRef}
              data-element-key='walkMinutes'
              style={composeStyle(
                COUNTER_TEXT_STYLE,
                { fontSize: tier.counterSize },
                styleOf('walkMinutes')
              )}
              className={selectableClass(activeKey === 'walkMinutes')}
            >
              {walkMinutes}
            </span>
          </div>
        </div>

        <p
          ref={eyebrowRef}
          data-element-key='eyebrow'
          style={composeStyle(
            EYEBROW_STYLE,
            {
              left: tier.eyebrowLeft,
              top: tier.eyebrowTop,
              fontSize: tier.eyebrowSize,
              lineHeight: tier.eyebrowLineHeight,
            },
            styleOf('eyebrow')
          )}
          className={selectableClass(activeKey === 'eyebrow', 'frec-eyebrow')}
        >
          {content.eyebrow}
        </p>

        <p
          ref={headingRef}
          data-element-key='heading'
          style={composeStyle(
            HEADING_STYLE,
            {
              left: tier.headingLeft,
              top: tier.headingTop,
              width: tier.headingWidth,
              fontSize: tier.headingSize,
              lineHeight: tier.headingLineHeight,
            },
            styleOf('heading')
          )}
          className={selectableClass(activeKey === 'heading', 'frec-heading')}
        >
          {content.heading}
        </p>

        <div
          style={{
            ...CAR_SECTION_STYLE,
            left: tier.carSectionLeft,
            top: tier.carSectionTop,
            width: tier.carSectionWidth,
            height: tier.carSectionHeight,
            transform: tier.carSectionTransform,
          }}
          className='frec-car-section'
        >
          <p
            ref={carHeadingRef}
            data-element-key='carHeading'
            style={composeStyle(
              CAR_HEADING_STYLE,
              {
                left: tier.carHeadingLeft,
                transform: tier.carHeadingTransform,
                fontSize: tier.carHeadingSize,
                lineHeight: tier.carHeadingLineHeight,
              },
              styleOf('carHeading')
            )}
            className={selectableClass(
              activeKey === 'carHeading',
              'frec-car-heading'
            )}
          >
            {content.carHeading}
          </p>

          <div
            ref={carPhotoWrapRef}
            style={{
              ...CAR_PHOTO_WRAP_STYLE,
              left: tier.carPhotoLeft,
              right: tier.carPhotoRight,
              top: tier.carPhotoTop,
              width: tier.carPhotoWidth,
              height: tier.carPhotoHeight,
              aspectRatio: tier.carPhotoAspect,
            }}
          >
            <div style={CAR_VARIANT_STYLE}>
              <div style={CAR_PICTURE_STYLE}>
                <div style={CAR_IMAGE_WRAPPER_STYLE}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content.carPhotoUrl}
                    alt=''
                    data-element-key='carPhotoUrl'
                    style={composeStyle(
                      CAR_PHOTO_STYLE,
                      styleOf('carPhotoUrl')
                    )}
                    className={selectableClass(activeKey === 'carPhotoUrl')}
                  />
                </div>
              </div>
            </div>
          </div>

          <p
            ref={row1ValueRef}
            data-element-key='row1Value'
            style={composeStyle(
              rowValueStyle(tier, 7, 24.94),
              styleOf('row1Value')
            )}
            className={selectableClass(activeKey === 'row1Value')}
          >
            {content.row1Value}
          </p>
          <div
            ref={row1LabelRef}
            data-element-key='row1Label'
            style={composeStyle(
              rowLabelStyle(tier, 24, 25.19),
              styleOf('row1Label')
            )}
            className={selectableClass(activeKey === 'row1Label')}
          >
            {content.row1Label.split('\\n').map((line, i) => (
              <p key={i} style={{ margin: 0 }}>
                {line}
              </p>
            ))}
          </div>

          <div
            style={{
              ...DIVIDER_STYLE,
              top: '42.64%',
              width: tier.dividerWidth,
            }}
          />

          <p
            ref={row2ValueRef}
            data-element-key='row2Value'
            style={composeStyle(
              rowValueStyle(tier, 6, 46.38),
              styleOf('row2Value')
            )}
            className={selectableClass(activeKey === 'row2Value')}
          >
            {content.row2Value}
          </p>
          <div
            ref={row2LabelRef}
            data-element-key='row2Label'
            style={composeStyle(
              rowLabelStyle(tier, 28, 46.63),
              styleOf('row2Label')
            )}
            className={selectableClass(activeKey === 'row2Label')}
          >
            {content.row2Label.split('\\n').map((line, i) => (
              <p key={i} style={{ margin: 0 }}>
                {line}
              </p>
            ))}
          </div>

          <div
            style={{
              ...DIVIDER_STYLE,
              top: '65.34%',
              width: tier.dividerWidth,
            }}
          />

          <p
            ref={row3ValueRef}
            data-element-key='row3Value'
            style={composeStyle(
              rowValueStyle(tier, 7, 69.08),
              styleOf('row3Value')
            )}
            className={selectableClass(activeKey === 'row3Value')}
          >
            {content.row3Value}
          </p>
          <div
            ref={row3LabelRef}
            data-element-key='row3Label'
            style={composeStyle(
              rowLabelStyle(tier, 22, 69.33),
              styleOf('row3Label')
            )}
            className={selectableClass(activeKey === 'row3Label')}
          >
            {content.row3Label.split('\\n').map((line, i) => (
              <p key={i} style={{ margin: 0 }}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
