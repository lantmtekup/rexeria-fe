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

  const [isCanvas, setIsCanvas] = React.useState(true);

  React.useLayoutEffect(() => {
    setIsCanvas(
      !!rootRef.current?.closest('[data-testid="active-block-preview"]')
    );
  }, []);

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
      <div style={CARD_STYLE} className='frep-card @container'>
        <div style={PHOTO_WRAP_STYLE}>
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

        <div ref={textWrapRef} style={TEXT_WRAP_STYLE}>
          <p
            ref={textRef}
            data-element-key='bodyText'
            style={composeStyle(TEXT_STYLE, styleOf('bodyText'))}
            className={selectableClass(activeKey === 'bodyText', 'frep-body')}
          >
            {content.bodyText}
          </p>
        </div>
      </div>
    </section>
  );
}
