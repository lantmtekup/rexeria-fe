'use client';

import * as React from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerRealEstate02ProductContent,
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
  content: FramerRealEstate02ProductContent;
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
  text: '#2c2926',
} as const;

const PHOTO_PARALLAX_RANGE = 60;
const PHOTO_IMAGE_OVERSCAN = 40;

const TEXT_PARALLAX_RANGE = 24;
const LINE_REVEAL_DURATION = 0.7;
const LINE_REVEAL_EASE = 'power3.out';
const LINE_STAGGER = 0.12;

/**
 * Hai tier layout. `mobile` (<672) giữ nguyên toạ độ Framer gốc 375×443:
 * gutter trái 25.07% để trống, ảnh flush top-right, đoạn text nằm NGAY DƯỚI
 * ảnh và canh cùng mép trái với ảnh. Không đổi một pixel nào ở nhánh này.
 *
 * `wide` (≥672): xoay chồng dọc đó thành SPLIT — text sang cột trái (chính là
 * cái gutter cũ), ảnh giữ flush top-right. Scale thẳng bố cục mobile là hỏng:
 * aspect 375/443 ở 1440 cho card cao 1700px, và đoạn text sẽ rộng 1079px
 * (~120ch) — quá dài để đọc.
 *
 * Clamp `N = maxPx / 1440 * 100`.
 */
const TIER = {
  mobile: {
    // 100% — fill frame mobile 390 (không khóa 375 → hở olive 2 mép).
    cardMaxWidth: '100%',
    cardAspect: '375 / 443',
    cardMinHeight: '0px',
    photoLeft: '25.07%',
    photoRight: 'auto',
    photoWidth: '74.93%',
    photoHeight: '42.21%',
    photoAspect: 'auto',
    textLeft: '25.07%',
    textTop: '49.44%',
    textBottom: 'auto',
    textWidth: '69.60%',
    textDisplay: 'block',
    textAlign: 'flex-start',
    textSize: '11px',
  },
  wide: {
    cardMaxWidth: '1440px',
    cardAspect: '1440 / 620',
    cardMinHeight: 'clamp(420px, 43cqi, 620px)',
    photoLeft: 'auto',
    photoRight: '0px',
    photoWidth: '54%',
    // Full chiều cao card. Giữ `aspectRatio 1124/748` của file nguồn thì ảnh
    // hụt ~100px dưới đáy, để lại dải nền tan chết ở nửa phải. Khung 54%/100%
    // ≈ 1.25 so với nguồn 1.50 nên `objectFit: cover` chỉ cắt bớt hai cạnh.
    photoHeight: '100%',
    photoAspect: 'auto',
    // Cột text canh giữa theo chiều dọc bằng flex chứ KHÔNG bằng
    // `translateY(-50%)`: wrap này đang là target parallax của GSAP (`y`),
    // transform tay sẽ bị tween ghi đè.
    textLeft: 'clamp(24px, 6cqi, 88px)',
    textTop: '0px',
    textBottom: '0px',
    textWidth: 'clamp(240px, 36cqi, 520px)',
    textDisplay: 'flex',
    textAlign: 'center',
    textSize: 'clamp(13px, 1.25cqi, 18px)',
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
  aspectRatio: '375 / 443',
  overflow: 'hidden',
  backgroundColor: COLORS.panel,
  fontFamily: FONT_STACK,
};

const PHOTO_WRAP_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '25.07%',
  top: 0,
  width: '74.93%',
  height: '42.21%',
  overflow: 'hidden',
  zIndex: 1,
};

const PHOTO_IMAGE_STYLE: React.CSSProperties = {
  display: 'block',
  position: 'absolute',
  left: 0,
  top: `-${PHOTO_IMAGE_OVERSCAN}px`,
  width: '100%',
  height: `calc(100% + ${PHOTO_IMAGE_OVERSCAN * 2}px)`,
  objectFit: 'cover',
};

// left 94/375, top 219/443, width 261/375 — text tự flow theo chiều cao.
const TEXT_WRAP_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '25.07%',
  top: '49.44%',
  width: '69.60%',
  zIndex: 2,
};

const TEXT_STYLE: React.CSSProperties = {
  margin: 0,
  fontWeight: 400,
  fontSize: '11px',
  lineHeight: 1.4545,
  letterSpacing: '0.44px',
  textTransform: 'uppercase',
  color: COLORS.text,
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function FramerRealEstate02Product({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const photoImageRef = React.useRef<HTMLImageElement>(null);
  const textWrapRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLParagraphElement>(null);

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
      const photoImage = photoImageRef.current;
      const textWrap = textWrapRef.current;
      const text = textRef.current;
      if (!root) return;

      const reduceMotion = prefersReducedMotion();

      if (reduceMotion) {
        if (photoImage) gsap.set(photoImage, { y: 0 });
        if (textWrap) gsap.set(textWrap, { y: 0 });
        return;
      }

      if (photoImage) {
        gsap.fromTo(
          photoImage,
          { y: -PHOTO_PARALLAX_RANGE / 2 },
          {
            y: PHOTO_PARALLAX_RANGE / 2,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      if (textWrap) {
        gsap.fromTo(
          textWrap,
          { y: TEXT_PARALLAX_RANGE / 2 },
          {
            y: -TEXT_PARALLAX_RANGE / 2,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      if (text) {
        const split = new SplitType(text, { types: 'lines,words' });
        const lines = split.lines ?? [];
        lines.forEach(line => {
          line.style.overflow = 'hidden';
        });
        gsap.set(
          lines.flatMap(line => Array.from(line.querySelectorAll('.word'))),
          { yPercent: 100 }
        );

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        });
        lines.forEach((line, i) => {
          const words = line.querySelectorAll('.word');
          tl.to(
            words,
            {
              yPercent: 0,
              duration: LINE_REVEAL_DURATION,
              ease: LINE_REVEAL_EASE,
            },
            i * LINE_STAGGER
          );
        });
      }
    },
    [isCanvas]
  );

  return (
    <section
      ref={rootRef}
      data-block='framer-realestate02-product'
      style={{ ...ROOT_STYLE, ...blockBackgroundStyle(background) }}
      className={cn('frep-root', className)}
    >
      <div
        style={{
          ...CARD_STYLE,
          maxWidth: tier.cardMaxWidth,
          aspectRatio: tier.cardAspect,
          minHeight: tier.cardMinHeight,
        }}
        className='frep-card @container'
      >
        <div
          style={{
            ...PHOTO_WRAP_STYLE,
            left: tier.photoLeft,
            right: tier.photoRight,
            width: tier.photoWidth,
            height: tier.photoHeight,
            aspectRatio: tier.photoAspect,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={photoImageRef}
            src={content.photoUrl}
            alt=''
            data-element-key='photoUrl'
            style={composeStyle(PHOTO_IMAGE_STYLE, styleOf('photoUrl'))}
            className={selectableClass(activeKey === 'photoUrl')}
          />
        </div>

        <div
          ref={textWrapRef}
          style={{
            ...TEXT_WRAP_STYLE,
            left: tier.textLeft,
            top: tier.textTop,
            bottom: tier.textBottom,
            width: tier.textWidth,
            display: tier.textDisplay,
            alignItems: tier.textAlign,
          }}
        >
          <p
            ref={textRef}
            data-element-key='bodyText'
            style={composeStyle(
              TEXT_STYLE,
              { fontSize: tier.textSize },
              styleOf('bodyText')
            )}
            className={selectableClass(activeKey === 'bodyText', 'frep-body')}
          >
            {content.bodyText}
          </p>
        </div>
      </div>
    </section>
  );
}
