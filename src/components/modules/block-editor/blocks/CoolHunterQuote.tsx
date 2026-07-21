'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  CoolHunterQuoteContent,
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
import { useContainerMobile } from './useContainerMobile';

interface CoolHunterQuoteProps {
  content: CoolHunterQuoteContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Cool Hunter Quote — port từ apps/cool-hunter QuoteSection.tsx.
 *
 * Ảnh cố định (opacity 0→1); dải màu wipe width; chữ giữa viewport fade theo
 * scroll (không nằm trong thanh → không bị cắt). Khác apps: pin → sticky (~190dvh).
 */

const DISPLAY_FONT = "'Fraunces', 'Playfair Display', 'Times New Roman', serif";

const STAGE_BG = '#e8e3d8';
const DEFAULT_IMAGE = '/cool-hunter/section-6.png';
const DEFAULT_IMAGE_ALT =
  'A stone patio with charred-wood chairs, a round table and a built-in bench';
const DEFAULT_LABEL = '04 - Interior Design';
const DEFAULT_QUOTE =
  '“Modern without being cold, rooted without being backward-looking, and entirely alive to the extraordinary setting it inhabits.”';

const STAGE_STYLE: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  height: '100dvh',
  overflow: 'hidden',
  isolation: 'isolate',
  backgroundColor: STAGE_BG,
  containerType: 'size',
};

export function CoolHunterQuote({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: CoolHunterQuoteProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const veilRef = React.useRef<HTMLDivElement>(null);
  const quoteWrapRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useContainerMobile(rootRef);

  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const quote = content.quote?.trim() || DEFAULT_QUOTE;
  const imageUrl = content.imageUrl?.trim() || DEFAULT_IMAGE;
  const imageAlt = content.imageAlt?.trim() || DEFAULT_IMAGE_ALT;
  const label = content.label?.trim() || DEFAULT_LABEL;

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      const frame = frameRef.current;
      const veil = veilRef.current;
      const quoteWrap = quoteWrapRef.current;
      if (!root || !frame || !veil || !quoteWrap || isCanvas) return;

      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      gsap.set(frame, { opacity: 0 });
      gsap.set(veil, { width: '100%' });
      gsap.set(quoteWrap, { opacity: 1 });

      const img = frame.querySelector('img');
      if (img && !img.complete) {
        img.addEventListener('load', requestRefresh, { once: true });
      }

      if (reduce) {
        gsap.set(frame, { opacity: 1 });
        gsap.set(veil, { width: '0%' });
        gsap.set(quoteWrap, { opacity: 0 });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.45,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        },
      });

      tl.to(veil, { width: '0%', duration: 1 }, 0)
        .to(frame, { opacity: 1, duration: 1 }, 0)
        .to(quoteWrap, { opacity: 0, duration: 1 }, 0);
    },
    [isCanvas, imageUrl]
  );

  const quoteBase: React.CSSProperties = {
    maxWidth: isMobile ? '86cqw' : '62cqw',
    margin: 0,
    textAlign: 'center',
    fontFamily: DISPLAY_FONT,
    fontSize: isMobile
      ? 'clamp(1.25rem, 4.5cqi, 1.5rem)'
      : 'clamp(2rem, 5.5cqi, 3.75rem)',
    fontWeight: 500,
    lineHeight: 1.375,
    color: '#171717',
  };

  const labelBase: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    right: 24,
    zIndex: 10,
    transform: 'translateY(-50%)',
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
    fontSize: 11,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#262626',
    writingMode: 'vertical-rl',
  };

  // ── Editor canvas: quote + image + label visible ──
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        className={cn('@container relative w-full', className)}
        style={composeStyle(
          { minHeight: 420, backgroundColor: STAGE_BG },
          blockBackgroundStyle(background)
        )}
      >
        <div className='flex flex-col gap-6 px-[6cqi] py-[6cqi]'>
          <h2
            data-element-key='quote'
            className={selectableClass(activeKey === 'quote')}
            style={composeStyle(
              {
                margin: 0,
                textAlign: 'center',
                fontFamily: DISPLAY_FONT,
                fontSize: 'clamp(1.25rem, 4cqi, 2rem)',
                fontWeight: 500,
                lineHeight: 1.375,
                color: '#171717',
              },
              styleOf('quote')
            )}
          >
            {quote}
          </h2>

          <div
            className='relative w-full overflow-hidden'
            style={{ aspectRatio: '16 / 10' }}
          >
            <img
              src={imageUrl}
              alt={imageAlt}
              data-element-key='imageUrl'
              className={selectableClass(
                activeKey === 'imageUrl',
                'h-full w-full object-cover'
              )}
              style={styleOf('imageUrl')}
            />
          </div>

          <span
            data-element-key='label'
            className={selectableClass(activeKey === 'label', 'self-start')}
            style={composeStyle(
              {
                fontFamily:
                  "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#262626',
              },
              styleOf('label')
            )}
          >
            {label}
          </span>
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p: sticky + color wipe reveal ──
  return (
    <section
      ref={rootRef}
      className={cn('@container relative w-full', className)}
      style={composeStyle(
        {
          height: '190dvh',
          backgroundColor: STAGE_BG,
        },
        blockBackgroundStyle(background)
      )}
    >
      <div ref={stageRef} style={STAGE_STYLE}>
        <div ref={frameRef} className='absolute inset-0' style={{ opacity: 0 }}>
          <img
            src={imageUrl}
            alt={imageAlt}
            data-element-key='imageUrl'
            className={selectableClass(
              activeKey === 'imageUrl',
              'h-full w-full object-cover'
            )}
            style={styleOf('imageUrl')}
          />
        </div>

        <div
          ref={veilRef}
          className='absolute inset-y-0 left-0 w-full'
          style={{ backgroundColor: STAGE_BG }}
        />

        <div
          ref={quoteWrapRef}
          className='absolute inset-0 z-10 flex items-center justify-center'
          style={{ paddingInline: '7%' }}
        >
          <h2
            data-element-key='quote'
            className={selectableClass(activeKey === 'quote')}
            style={composeStyle(quoteBase, styleOf('quote'))}
          >
            {quote}
          </h2>
        </div>

        {!isMobile && (
          <span
            data-element-key='label'
            className={selectableClass(activeKey === 'label')}
            style={composeStyle(labelBase, styleOf('label'))}
          >
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                width: 1,
                height: 40,
                marginBottom: 12,
                backgroundColor: '#262626',
                verticalAlign: 'middle',
              }}
            />
            {label}
          </span>
        )}
      </div>
    </section>
  );
}
