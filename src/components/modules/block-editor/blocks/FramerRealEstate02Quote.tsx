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
  FramerRealEstate02QuoteContent,
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
  content: FramerRealEstate02QuoteContent;
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
  dark: '#2c2926',
  accent: '#c49f8a',
  muted: '#66634d',
} as const;

const TRAVEL = 24;
const DURATION = 0.65;
const EASE = 'power2.out';
const BLUR_ENTER_START = 6;

const BUILDING_PARALLAX_SLOPE = 0.05;

/**
 * Hai tier layout. `mobile` (<672) giữ nguyên toạ độ Framer gốc 375×567: chân
 * dung 94×129 dính góc dưới-trái, ảnh building chèn giữa khung. Không đổi một
 * pixel nào ở nhánh này.
 *
 * `wide` (≥672): card nở tới 1440 theo aspect 1440/720, tách hai cột —
 * TRÁI là cột chữ (tên/chức danh → pull quote lớn → chân dung neo góc dưới),
 * PHẢI là panel ảnh building. Ảnh nguồn 940×1128 là PORTRAIT nên panel phải
 * giữ khung đứng (`buildingWidth` + inset trên/dưới) thay vì trải full-bleed
 * ngang, và `photoFit` đổi `fill` → `cover` để không kéo méo.
 *
 * `buildingBleed` mobile (-35/-29/-34 trên khung 234×282) chính là -12.4% đều
 * bốn phía, nên tier wide dùng thẳng `-12.4%` để parallax giữ nguyên biên độ
 * tương đối. Clamp `N = maxPx / 1440 * 100`.
 */
const TIER = {
  mobile: {
    // 100% — fill frame mobile 390 (không khóa 375 → hở olive 2 mép).
    cardMaxWidth: '100%',
    cardAspect: '375 / 567',
    cardMinHeight: '0px',
    headerLeft: '5.33%',
    headerTop: '7.05%',
    headerWidth: '62.23%',
    headerRight: 'auto',
    headerMinHeight: '0px',
    headerJustify: 'flex-start',
    metaSize: '10.83px',
    quoteLeft: '5.33%',
    quoteTop: '19.75%',
    quoteWidth: '85.33%',
    quoteSize: '15.9px',
    headshotLeft: '20px',
    headshotTop: 'auto',
    headshotBottom: '69px',
    headshotWidth: '94px',
    headshotHeight: '129px',
    headshotAspect: 'auto',
    buildingLeft: '94px',
    buildingRight: '47px',
    buildingTop: '206px',
    buildingBottom: 'auto',
    buildingWidth: 'auto',
    buildingHeight: '282px',
    buildingBleed: '-35px -29px -34px',
    photoFit: 'fill',
    // Chân dung neo ĐÁY nên trôi lên là trôi vào trong khung — an toàn.
    headshotSlope: -0.1,
  },
  wide: {
    cardMaxWidth: '1440px',
    // 720 để lại ~200px hụt giữa chân dung và quote — đọc như lỗi layout.
    // 640 dồn phần dư xuống đáy, đọc như lề.
    cardAspect: '1440 / 640',
    cardMinHeight: 'clamp(440px, 44.4cqi, 640px)',
    // Cụm credit = chân dung + tên/chức danh NẰM NGANG nhau (byline canh đáy
    // ảnh), pull quote ngay dưới. Ba khối là sibling absolute nên toạ độ phải
    // cộng tay: chân dung cao 17.84cqi (= 13cqi × 129/94), `headerMinHeight`
    // khoá chiều cao byline để canh đáy và để `quoteTop` tính được mà không
    // cần đo DOM. Mọi số hạng đều clamp vì `metaSize` chạm sàn 12px ở dải
    // 672→1000; để cqi thuần thì quote sẽ đè lên chức danh ở tablet.
    headerLeft: 'calc(4% + 13cqi + clamp(16px, 2cqi, 28px))',
    headerTop: 'calc(8% + 17.84cqi - clamp(44px, 3.6cqi, 52px))',
    // Biên phải bám đúng mép panel building (cùng công thức `buildingWidth`)
    // thay vì width cố định — width cố định làm chức danh xuống dòng ở 834.
    headerWidth: 'auto',
    headerRight: 'calc(clamp(300px, 42cqi, 605px) + clamp(16px, 2cqi, 28px))',
    headerMinHeight: 'clamp(44px, 3.6cqi, 52px)',
    headerJustify: 'flex-end',
    metaSize: 'clamp(12px, 0.9cqi, 14px)',
    quoteLeft: '4%',
    quoteTop: 'calc(8% + 17.84cqi + clamp(28px, 3.2cqi, 46px))',
    quoteWidth: '46%',
    quoteSize: 'clamp(20px, 2.4cqi, 34px)',
    headshotLeft: '4%',
    headshotTop: '8%',
    headshotBottom: 'auto',
    headshotWidth: '13%',
    headshotHeight: 'auto',
    headshotAspect: '94 / 129',
    // Panel ảnh ăn sát mép phải + full chiều cao card: 42cqi/100% ≈ 0.84,
    // gần đúng tỉ lệ ảnh nguồn 940/1128 = 0.833 nên `cover` gần như không cắt.
    buildingLeft: 'auto',
    buildingRight: '0px',
    buildingTop: '0px',
    buildingBottom: '0px',
    buildingWidth: 'clamp(300px, 42cqi, 605px)',
    buildingHeight: 'auto',
    buildingBleed: '-12.4%',
    photoFit: 'cover',
    // Ở đây chân dung neo ĐỈNH: giữ slope âm 0.1 là nó trôi thẳng ra khỏi
    // card. Đảo chiều + hạ biên độ để drift xuống nhẹ, không bao giờ chạm đáy.
    // Giữ nhỏ để byline canh đáy ảnh không bị lệch quá rõ khi cuộn.
    headshotSlope: 0.015,
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
  aspectRatio: '375 / 567',
  overflow: 'hidden',
  backgroundColor: COLORS.dark,
  fontFamily: FONT_STACK,
};

const HEADER_WRAP_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '5.33%',
  top: '7.05%',
  width: '62.23%',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 2,
};

const NAME_STYLE: React.CSSProperties = {
  margin: 0,
  fontWeight: 400,
  fontSize: '10.83px',
  lineHeight: 1.48,
  letterSpacing: '0.44px',
  textTransform: 'uppercase',
  color: COLORS.accent,
};

const ROLE_STYLE: React.CSSProperties = {
  margin: 0,
  fontWeight: 400,
  fontSize: '10.83px',
  lineHeight: 1.48,
  letterSpacing: '0.44px',
  textTransform: 'uppercase',
  color: COLORS.muted,
};

const QUOTE_WRAP_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '5.33%',
  top: '19.75%',
  width: '85.33%',
  zIndex: 2,
};

const QUOTE_STYLE: React.CSSProperties = {
  margin: 0,
  fontWeight: 400,
  fontSize: '15.9px',
  lineHeight: 1.33,
  letterSpacing: '0.63px',
  textTransform: 'uppercase',
  color: COLORS.accent,
};

const HEADSHOT_WRAP_STYLE: React.CSSProperties = {
  bottom: '69px',
  height: '129px',
  left: '20px',
  overflow: 'hidden',
  position: 'absolute',
  width: '94px',
  willChange: 'transform',
  opacity: 1,
};

const HEADSHOT_INNER_STYLE: React.CSSProperties = {
  position: 'absolute',
  borderRadius: 'inherit',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const BUILDING_WRAP_STYLE: React.CSSProperties = {
  height: '282px',
  left: '94px',
  overflow: 'hidden',
  position: 'absolute',
  right: '47px',
  top: '206px',
};

const BUILDING_INNER_WRAP_STYLE: React.CSSProperties = {
  willChange: 'transform',
  inset: '-35px -29px -34px',
  overflow: 'hidden',
  position: 'absolute',
  opacity: 1,
};

const ABSOLUTE_FILL_STYLE: React.CSSProperties = {
  position: 'absolute',
  borderRadius: 'inherit',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const PHOTO_IMAGE_STYLE: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
  objectPosition: 'center',
  objectFit: 'fill',
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function FramerRealEstate02Quote({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const quoteRef = React.useRef<HTMLParagraphElement>(null);
  const buildingParallaxRef = React.useRef<HTMLDivElement>(null);
  const headshotInnerRef = React.useRef<HTMLDivElement>(null);

  const isCanvas = useIsCanvasEdit(rootRef);
  const isMobile = useContainerMobile(rootRef);
  const tier = isMobile ? TIER.mobile : TIER.wide;

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      if (isCanvas) return;
      const root = rootRef.current;
      const reduceMotion = prefersReducedMotion();

      const textEls: Array<HTMLElement | null> = [
        headerRef.current,
        quoteRef.current,
      ];
      const els = textEls.filter((el): el is HTMLElement => !!el);
      if (root && els.length) {
        if (reduceMotion) {
          gsap.set(els, { opacity: 1, y: 0, filter: 'blur(0px)' });
        } else {
          gsap.set(els, {
            opacity: 0,
            y: TRAVEL,
            filter: `blur(${BLUR_ENTER_START}px)`,
          });
          gsap.to(els, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: DURATION,
            ease: EASE,
            stagger: 0.08,
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          });
        }
      }

      if (reduceMotion || !root) return;

      const headshotInner = headshotInnerRef.current;
      const buildingParallax = buildingParallaxRef.current;

      if (headshotInner || buildingParallax) {
        ScrollTrigger.create({
          trigger: root,
          scroller,
          start: 0,
          end: 'max',
          onUpdate: self => {
            const scrollValue = self.scroll();
            if (headshotInner) {
              gsap.set(headshotInner, {
                y: tier.headshotSlope * scrollValue,
                force3D: false,
              });
            }
            if (buildingParallax) {
              gsap.set(buildingParallax, {
                y: BUILDING_PARALLAX_SLOPE * scrollValue,
                force3D: false,
              });
            }
          },
        });
      }
    },
    [isCanvas, tier]
  );

  return (
    <section
      ref={rootRef}
      data-block='framer-realestate02-quote'
      style={{ ...ROOT_STYLE, ...blockBackgroundStyle(background) }}
      className={cn('freq-root', className)}
    >
      <div
        style={{
          ...CARD_STYLE,
          maxWidth: tier.cardMaxWidth,
          aspectRatio: tier.cardAspect,
          minHeight: tier.cardMinHeight,
        }}
        className='freq-card @container'
      >
        <div
          style={{
            ...BUILDING_WRAP_STYLE,
            left: tier.buildingLeft,
            right: tier.buildingRight,
            top: tier.buildingTop,
            bottom: tier.buildingBottom,
            width: tier.buildingWidth,
            height: tier.buildingHeight,
          }}
        >
          <div
            style={{ ...BUILDING_INNER_WRAP_STYLE, inset: tier.buildingBleed }}
            ref={buildingParallaxRef}
          >
            <div style={ABSOLUTE_FILL_STYLE}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.buildingImageUrl}
                alt=''
                data-element-key='buildingImageUrl'
                style={composeStyle(
                  PHOTO_IMAGE_STYLE,
                  { objectFit: tier.photoFit },
                  styleOf('buildingImageUrl')
                )}
                className={selectableClass(activeKey === 'buildingImageUrl')}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            ...HEADSHOT_WRAP_STYLE,
            left: tier.headshotLeft,
            top: tier.headshotTop,
            bottom: tier.headshotBottom,
            width: tier.headshotWidth,
            height: tier.headshotHeight,
            aspectRatio: tier.headshotAspect,
          }}
          ref={headshotInnerRef}
        >
          <div style={HEADSHOT_INNER_STYLE}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.headshotImageUrl}
              alt=''
              data-element-key='headshotImageUrl'
              style={composeStyle(
                PHOTO_IMAGE_STYLE,
                { objectFit: tier.photoFit },
                styleOf('headshotImageUrl')
              )}
              className={selectableClass(activeKey === 'headshotImageUrl')}
            />
          </div>
        </div>

        <div
          ref={headerRef}
          style={{
            ...HEADER_WRAP_STYLE,
            left: tier.headerLeft,
            top: tier.headerTop,
            width: tier.headerWidth,
            right: tier.headerRight,
            minHeight: tier.headerMinHeight,
            justifyContent: tier.headerJustify,
          }}
        >
          <p
            data-element-key='name'
            style={composeStyle(
              NAME_STYLE,
              { fontSize: tier.metaSize },
              styleOf('name')
            )}
            className={selectableClass(activeKey === 'name')}
          >
            {content.name}
          </p>
          <p
            data-element-key='role'
            style={composeStyle(
              ROLE_STYLE,
              { fontSize: tier.metaSize },
              styleOf('role')
            )}
            className={selectableClass(activeKey === 'role')}
          >
            {content.role}
          </p>
        </div>

        <div
          style={{
            ...QUOTE_WRAP_STYLE,
            left: tier.quoteLeft,
            top: tier.quoteTop,
            width: tier.quoteWidth,
          }}
        >
          <p
            ref={quoteRef}
            data-element-key='quote'
            style={composeStyle(
              QUOTE_STYLE,
              { fontSize: tier.quoteSize },
              styleOf('quote')
            )}
            className={selectableClass(activeKey === 'quote', 'freq-quote')}
          >
            {content.quote}
          </p>
        </div>
      </div>
    </section>
  );
}
