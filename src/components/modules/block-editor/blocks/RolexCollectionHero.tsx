'use client';

import * as React from 'react';
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
  height: 'auto',
  maxHeight: '800px',
  maxWidth: '1440px',
  overflow: 'hidden',
  padding: '44px 14px 64px',
  position: 'relative',
  width: '100%',
  border: '1px solid rgba(255, 255, 255, 0.29)',
};

const IMAGE_CONTAINER_STYLE: React.CSSProperties = {
  aspectRatio: '1.20822',
  height: 'auto',
  width: '677px',
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
  backdropFilter: 'blur(100px)',
  height: '120px',
  overflow: 'clip',
  willChange: 'transform',
  zIndex: 1,
  borderRadius: '34px',
  flex: 'none',
  position: 'absolute',
  top: 'calc(50% - 60px)',
  left: 0,
  right: 0,
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
  className?: string;
}

function RolexCollectionHeroAbout({
  content,
  className,
}: RolexCollectionHeroAboutProps) {
  return (
    <div style={ABOUT_STACK_STYLE} className={className}>
      <div style={ABOUT_STACK_INNER_STYLE}>
        <div style={ABOUT_RICHTEXT_CONTAINER_STYLE}>
          <p
            style={{
              fontFamily: FONT_HEADING,
              fontSize: 48,
              fontWeight: 400,
              color: '#ffffff',
              textAlign: 'center',
              margin: 0,
              textTransform: 'uppercase',
              lineHeight: 'normal',
            }}
          >
            {(content.mainTitle || 'COSMOGRAPH DAYTONA')
              .split(' ')
              .map((word, i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    willChange: 'transform',
                  }}
                >
                  {word}
                </span>
              ))}
          </p>
        </div>

        <div style={MAIN_CONTENT_CONTAINER_STYLE}>
          <div style={MAIN_CONTENT_INNER_TEXT_STYLE}>
            <p
              style={{
                fontFamily: FONT_BODY,
                fontSize: 25,
                fontWeight: 400,
                color: '#ffffff',
                lineHeight: 'normal',
                margin: 0,
              }}
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
  return (
    <section className='@container relative flex h-full w-full overflow-hidden'>
      {' '}
      <style>{FONT_CSS}</style>
      <div
        style={ROOT_STYLE}
        className='@4xl:pb-39] gap-2 px-4 pt-4 pb-31 @3xl:gap-3 @3xl:px-11 @3xl:pt-11 @3xl:pb-39 @4xl:gap-4 @4xl:px-40 @4xl:pt-20'
      >
        <div className='absolute inset-0 overflow-hidden'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.backgroundUrl}
            alt='background-hero'
            style={IMAGE_BG_STYLE}
          />
        </div>
        <div style={CONTENT_STYLE}>
          <div className='flex w-full flex-col items-center justify-center'>
            {/* ROLEX brand — 248px, Cravelo */}
            <p
              className='@3xl:text-[150px] @4xl:text-[248px]'
              style={{
                fontFamily: FONT_HEADING,
                fontWeight: 400,
                color: '#ffffff',
                textAlign: 'center',
                margin: 0,
                textTransform: 'uppercase',
                lineHeight: 'normal',
              }}
            >
              {content.mainLetter || 'ROLEX'}
            </p>
          </div>
          <div
            style={IMAGE_CONTAINER_STYLE}
            className='@3xl:top-[216px] @3xl:left-[7px] @4xl:top-[180px] @4xl:left-[195px]'
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
          <RolexCollectionHeroAbout content={content} className='flex' />
        </div>
      </div>
    </section>
  );
}
