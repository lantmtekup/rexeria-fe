'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  RolexCollectionHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { FONT_HEADING, FONT_BODY, FONT_CSS } from './rolexFonts';
import { useMotionAttributes } from '../motion/useMotionAttributes';
import { TransformedImage } from './TransformedImage';
import { useIsCanvasEdit } from './useIsCanvasEdit';

interface Props {
  content: RolexCollectionHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const ROOT_STYLE: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flex: '0 0 auto',
  flexFlow: 'column',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
};

const IMAGE_BG_STYLE: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
};

const CONTENT_STYLE: React.CSSProperties = {
  alignItems: 'center',
  justifyContent: 'space-between',
  backdropFilter: 'blur(16px)',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  display: 'flex',
  flex: '1 0 0',
  flexFlow: 'column',
  height: '100%',
  maxHeight: '800px',
  minHeight: '300px',
  maxWidth: '1440px',
  width: '100%',
  position: 'relative',
};

const CARD_BORDER_AFTER =
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border after:border-white/[0.29] after:content-['']";

const IMAGE_CONTAINER_STYLE: React.CSSProperties = {
  aspectRatio: '1.20822',
  position: 'absolute',
  zIndex: 1,
  display: 'flex',
  flexFlow: 'row',
  flex: 'none',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
  padding: 0,
  overflow: 'visible',
};

const ABSOLUTE_FILL_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  borderRadius: 'inherit',
};

const ABOUT_STACK_STYLE: React.CSSProperties = {
  zIndex: 9,
  flexFlow: 'row',
  flex: 'none',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '1092px',
  height: '144px',
  padding: '0 64px',
  position: 'relative',
  overflow: 'hidden',
};

const ABOUT_STACK_INNER_STYLE: React.CSSProperties = {
  height: '120px',
  overflow: 'clip',
  zIndex: 1,
  flex: 'none',
  position: 'absolute',
  top: 'calc(50% - 60px)',
  left: 0,
  right: 0,
  backdropFilter: 'blur(100px)',
  borderRadius: '34px',
};

const ABOUT_RICHTEXT_CONTAINER_STYLE: React.CSSProperties = {
  opacity: 1,
  transform: 'none',
  willChange: 'transform',
  display: 'flex',
  flexFlow: 'column',
  flex: 'none',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 0,
  width: '482px',
  padding: 0,
  position: 'absolute',
  top: 0,
  right: '66px',
  bottom: 0,
  overflow: 'hidden',
};

const MAIN_CONTENT_CONTAINER_STYLE: React.CSSProperties = {
  display: 'flex',
  flexFlow: 'column',
  flex: 'none',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  gap: '24px',
  width: '482px',
  height: 'min-content',
  padding: 0,
  position: 'absolute',
  top: '50%',
  left: '73px',
  overflow: 'hidden',
  transform: 'translateY(-50%)',
};

const MAIN_CONTENT_INNER_TEXT_STYLE: React.CSSProperties = {
  flex: 'none',
  width: '420px',
  height: 'auto',
  position: 'relative',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
};

interface RolexCollectionHeroAboutProps {
  content: RolexCollectionHeroContent;
  styles?: ElementStylesMap;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  isCanvas?: boolean;
}

/**
 * Mobile + tablet (<@4xl) — "About" renders as its own card below the
 * hero-image card, matching the source's separate "About Section" DOM
 * (only merges into one card at @4xl desktop).
 */
function RolexCollectionHeroAboutCompact({
  content,
  styles,
  order,
  positions,
  activeKey,
  isCanvas,
}: RolexCollectionHeroAboutProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  return (
    <div
      className={cn(
        'relative flex w-full flex-col items-center gap-10.5 rounded-lg bg-white/5 px-4 py-6 will-change-transform @3xl:flex-row @3xl:items-center @3xl:justify-start @3xl:gap-20 @3xl:px-8 @3xl:py-11',
        !isCanvas && '@4xl:hidden',
        CARD_BORDER_AFTER
      )}
      style={{ transform: 'translateZ(0)' }}
    >
      <p
        data-element-key='mainDescription'
        data-motion='word-blur-up-reveal'
        data-motion-trigger='load'
        data-motion-delay='0.7'
        data-motion-stagger='0.05'
        data-motion-duration='0.8'
        style={composeStyle(
          {
            fontFamily: FONT_BODY,
            fontWeight: 400,
            color: '#ffffff',
            margin: 0,
            lineHeight: 'normal',
          },
          styleOf('mainDescription')
        )}
        className={selectableClass(
          activeKey === 'mainDescription',
          '@4xl-text-2xl text-center text-base @3xl:basis-1/2 @3xl:text-left @3xl:text-[22px]'
        )}
      >
        {content.mainDescription}
      </p>
      <div className='flex flex-col items-center gap-3 @3xl:basis-1/2'>
        <p
          data-element-key='mainTitle'
          data-motion='word-blur-up-reveal'
          data-motion-trigger='load'
          data-motion-delay='0.7'
          data-motion-duration='0.8'
          style={composeStyle(
            {
              fontFamily: FONT_HEADING,
              fontWeight: 400,
              color: '#ffffff',
              margin: 0,
              textTransform: 'uppercase',
              lineHeight: 'normal',
            },
            styleOf('mainTitle')
          )}
          className={selectableClass(
            activeKey === 'mainTitle',
            'text-center text-[28px] @3xl:text-[42px] @4xl:text-[48px]'
          )}
        >
          {content.mainTitle}
        </p>
      </div>
    </div>
  );
}

/**
 * Desktop (@4xl) — "About" nests inside the same card as the hero image,
 * overlapping its bottom edge (absolute-positioned, matches source 1:1).
 */
function RolexCollectionHeroAboutNested({
  content,
  styles,
  order,
  positions,
  activeKey,
  isCanvas,
}: RolexCollectionHeroAboutProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  return (
    <div
      style={ABOUT_STACK_STYLE}
      className={isCanvas ? 'hidden' : 'hidden @4xl:flex'}
      data-motion='fade-in'
      data-motion-trigger='load'
      data-motion-duration='0.7'
      data-motion-ease='none'
    >
      <div style={ABOUT_STACK_INNER_STYLE}>
        <div style={ABOUT_RICHTEXT_CONTAINER_STYLE}>
          <p
            data-element-key='mainTitle'
            style={composeStyle(
              {
                fontFamily: FONT_HEADING,
                fontSize: 48,
                fontWeight: 400,
                color: '#ffffff',
                textAlign: 'center',
                margin: 0,
                textTransform: 'uppercase',
                lineHeight: 'normal',
              },
              styleOf('mainTitle')
            )}
            className={selectableClass(activeKey === 'mainTitle')}
          >
            {(content.mainTitle || 'COSMOGRAPH DAYTONA')
              .split(' ')
              .map((word, i) => (
                <span
                  key={i}
                  data-motion='word-blur-up-reveal'
                  data-motion-trigger='load'
                  data-motion-delay='0.65'
                  data-motion-duration='0.8'
                  style={{ display: 'block', willChange: 'transform' }}
                >
                  {word}
                </span>
              ))}
          </p>
        </div>

        <div style={MAIN_CONTENT_CONTAINER_STYLE}>
          <div style={MAIN_CONTENT_INNER_TEXT_STYLE}>
            <p
              data-element-key='mainDescription'
              data-motion='word-blur-up-reveal'
              data-motion-trigger='load'
              data-motion-delay='0.5'
              data-motion-stagger='0.05'
              data-motion-duration='0.8'
              style={composeStyle(
                {
                  fontFamily: FONT_BODY,
                  fontSize: 25,
                  fontWeight: 400,
                  color: '#ffffff',
                  lineHeight: 'normal',
                  margin: 0,
                },
                styleOf('mainDescription')
              )}
              className={selectableClass(activeKey === 'mainDescription')}
            >
              {content.mainDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────

export function RolexCollectionHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const rootRef = React.useRef<HTMLElement>(null);
  useMotionAttributes(rootRef);
  const isCanvas = useIsCanvasEdit(rootRef);

  return (
    <section
      ref={rootRef}
      className='@container relative flex h-screen w-full overflow-hidden'
    >
      <style>{FONT_CSS}</style>
      <div
        style={composeStyle(ROOT_STYLE, blockBackgroundStyle(background))}
        className='gap-2 px-4 pt-4 pb-31 @3xl:gap-3 @3xl:px-11 @3xl:pt-11 @3xl:pb-39 @4xl:gap-4 @4xl:px-40 @4xl:pt-20 @4xl:pb-39'
      >
        <div
          data-element-key='backgroundUrl'
          className={selectableClass(
            activeKey === 'backgroundUrl',
            'absolute inset-0 overflow-hidden'
          )}
        >
          <TransformedImage
            src={content.backgroundUrl}
            transform={content.backgroundTransform}
            alt='background-hero'
          />
        </div>
        <div
          style={CONTENT_STYLE}
          className={cn(
            'overflow-hidden pt-6 pr-3.5 pb-16 pl-3.5 @3xl:pt-11 @3xl:pr-11 @3xl:pl-11 @4xl:pr-3.5 @4xl:pl-3.5',
            CARD_BORDER_AFTER
          )}
        >
          <div className='flex w-full flex-col items-center justify-center'>
            {/* ROLEX brand — 67 / 150 / 248px, Cravelo */}
            <p
              data-element-key='mainLetter'
              data-motion='char-blur-up-reveal'
              data-motion-trigger='load'
              data-motion-delay='0.3'
              data-motion-duration='0.7'
              className={selectableClass(
                activeKey === 'mainLetter',
                'text-[67px] @3xl:text-[150px] @3xl:leading-none @4xl:text-[248px] @4xl:leading-74.25'
              )}
              style={composeStyle(
                {
                  fontFamily: FONT_HEADING,
                  fontWeight: 400,
                  color: '#ffffff',
                  textAlign: 'center',
                  margin: 0,
                  textTransform: 'uppercase',
                },
                styleOf('mainLetter')
              )}
            >
              {content.mainLetter || 'ROLEX'}
            </p>
          </div>
          <div
            style={IMAGE_CONTAINER_STYLE}
            data-element-key='heroImageUrl'
            data-motion='zoom-in'
            data-motion-trigger='load'
            data-motion-distance='0.85'
            data-motion-duration='1.1'
            className={selectableClass(
              activeKey === 'heroImageUrl',
              'relative top-31 h-83.5 w-100.75 @3xl:absolute @3xl:top-54 @3xl:left-1/2 @3xl:h-auto @3xl:w-169.25 @3xl:-translate-x-1/2 @4xl:top-45'
            )}
          >
            <div style={ABSOLUTE_FILL_STYLE}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.heroImageUrl}
                alt='clock'
                style={IMAGE_BG_STYLE}
              />
            </div>
          </div>
          <RolexCollectionHeroAboutNested
            content={content}
            styles={styles}
            order={order}
            positions={positions}
            activeKey={activeKey}
            isCanvas={isCanvas}
          />
        </div>
        <RolexCollectionHeroAboutCompact
          content={content}
          styles={styles}
          order={order}
          positions={positions}
          activeKey={activeKey}
          isCanvas={isCanvas}
        />
      </div>
    </section>
  );
}
