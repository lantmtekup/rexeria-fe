'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import { isVideoUrl } from '../mediaUrl';
import type { BelgoHeroContent } from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { resolvePnjHeroTitleLines } from './pnjHeroTitleLines';
import { useContainerMobile } from './useContainerMobile';
import { BELGO_CREAM, BELGO_FONT_CSS, BELGO_FONT_DISPLAY } from './belgoTheme';

const DEFAULT_VIDEO = '/belgo/videos/hero.mp4';

const TITLE_LINE_BASE: React.CSSProperties = {
  display: 'block',
  margin: 0,
  fontFamily: BELGO_FONT_DISPLAY,
  color: BELGO_CREAM,
  lineHeight: 0.92,
  textAlign: 'center',
};

export function BelgoHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<BelgoHeroContent>) {
  const rootRef = React.useRef<HTMLElement>(null);
  const isMobile = useContainerMobile(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const titleLines = React.useMemo(
    () => resolvePnjHeroTitleLines(content),
    [content]
  );
  const videoUrl = content.videoUrl?.trim() || DEFAULT_VIDEO;
  const titleFontSize = isMobile
    ? 'clamp(2.5rem, 18cqi, 9rem)'
    : 'clamp(3rem, 12cqi, 11rem)';

  return (
    <section
      ref={rootRef}
      id='hero'
      style={composeStyle(
        { minHeight: '80dvh', position: 'relative' },
        blockBackgroundStyle(background)
      )}
      className={cn('@container relative w-full overflow-hidden', className)}
    >
      <style>{BELGO_FONT_CSS}</style>

      <div
        data-element-key='videoUrl'
        className={selectableClass(
          activeKey === 'videoUrl',
          'absolute inset-0 h-full w-full'
        )}
        style={composeStyle(
          { position: 'absolute', inset: 0 },
          styleOf('videoUrl')
        )}
      >
        {videoUrl ? (
          isVideoUrl(videoUrl) ? (
            <video
              key={videoUrl}
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
              preload='auto'
              className='h-full w-full object-cover'
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={videoUrl} alt='' className='h-full w-full object-cover' />
          )
        ) : null}
      </div>

      <div
        aria-hidden
        className='pointer-events-none absolute inset-0'
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
      />

      <div className='relative z-10 flex min-h-[80dvh] items-center justify-center px-6'>
        <h1 style={{ margin: 0 }}>
          {titleLines.map((line, i) => {
            const key = `titleLines[${i}]`;
            return (
              <span
                key={key}
                data-element-key={key}
                className={selectableClass(activeKey === key, 'block')}
                style={composeStyle(
                  TITLE_LINE_BASE,
                  { fontSize: titleFontSize },
                  styleOf(key)
                )}
              >
                {line}
              </span>
            );
          })}
        </h1>
      </div>
    </section>
  );
}
