'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion, useLandingMotion } from '../motion/LandingMotion';
import type {
  RealEstateHighlightItem,
  RealEstateHighlightsContent,
} from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import {
  BROWN,
  FONT_BODY,
  FONT_HEADING,
  GREEN,
  RE_CONTENT_W,
  RE_SECTION_GAP,
  SAND,
  FONT_CSS,
} from './realEstateFonts';

const CARD_W = `calc(${RE_CONTENT_W} * 0.669)`;
const GAP_X = `calc(${RE_CONTENT_W} * 0.0323)`;
const PAD_X = `calc(${RE_CONTENT_W} * 0.0645)`;
const SECTION_GAP_X = `calc(${RE_CONTENT_W} * 0.129)`;

export function RealEstateHighlights({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<RealEstateHighlightsContent>) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const { hasRoot } = useLandingMotion();

  const items = Array.isArray(content.items) ? content.items : [];

  // Canvas editor (author) vs PreviewMode / `/p` (production).
  const [isCanvas, setIsCanvas] = React.useState(true);
  React.useLayoutEffect(() => {
    if (!hasRoot) {
      setIsCanvas(false);
      return;
    }
    setIsCanvas(
      !!rootRef.current?.closest('[data-testid="active-block-preview"]')
    );
  }, [hasRoot]);

  const [reduce, setReduce] = React.useState(false);
  React.useLayoutEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.fromTo(
        root.querySelectorAll('[data-appear]'),
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.075,
          delay: 0.1,
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 85%',
            once: true,
          },
        }
      );

      root.querySelectorAll('img').forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });

      if (isCanvas) return;
      const track = trackRef.current;
      if (!track) return;

      gsap.fromTo(
        track,
        { x: () => root.clientWidth },
        {
          x: () => -track.scrollWidth,
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
    },
    [isCanvas, items.length]
  );

  const renderCard = (item: RealEstateHighlightItem, i: number) => {
    const imageKey = `items[${i}].imageUrl`;
    const numberKey = `items[${i}].number`;
    const textKey = `items[${i}].text`;
    return (
      <div
        key={i}
        data-appear
        className='@container relative aspect-[249/359] flex-none'
        style={{ backgroundColor: SAND, width: CARD_W }}
      >
        <div
          data-element-key={imageKey}
          className={cn(
            selectableClass(activeKey === imageKey),
            'absolute top-[9.64cqi] left-[9.64cqi] aspect-square w-[81.1cqi] overflow-hidden rounded-full'
          )}
          style={styleOf(imageKey)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt=''
            className='h-full w-full object-cover'
          />
        </div>

        <p
          data-element-key={numberKey}
          className={cn(
            selectableClass(activeKey === numberKey),
            'absolute top-[54%] left-[9.64cqi] -translate-y-1/2'
          )}
          style={composeStyle(
            {
              fontFamily: FONT_BODY,
              fontSize: '39.8cqi',
              lineHeight: 1,
              color: GREEN,
              fontWeight: 400,
            },
            styleOf(numberKey)
          )}
        >
          {item.number}
        </p>

        <p
          data-element-key={textKey}
          className={cn(
            selectableClass(activeKey === textKey),
            'absolute top-[73.5%] left-[9.64cqi] w-[81.1cqi]'
          )}
          style={composeStyle(
            {
              fontFamily: FONT_HEADING,
              fontSize: '5.62cqi',
              lineHeight: 1.69,
              color: BROWN,
              fontWeight: 400,
            },
            styleOf(textKey)
          )}
        >
          {item.text}
        </p>
      </div>
    );
  };

  const header = (
    <div className='@container mx-auto' style={{ width: RE_CONTENT_W }}>
      <div className='flex flex-col items-center gap-[3.23cqi] px-[6.45cqi] text-center'>
        <h2
          data-appear
          data-element-key='title'
          className={cn(selectableClass(activeKey === 'title'), 'w-full')}
          style={composeStyle(
            {
              fontFamily: FONT_HEADING,
              fontSize: '6.18cqi',
              lineHeight: 1.372,
              color: BROWN,
              fontWeight: 400,
            },
            styleOf('title')
          )}
        >
          {content.title}
        </h2>
        <p
          data-appear
          data-element-key='description'
          className={cn(selectableClass(activeKey === 'description'), 'w-full')}
          style={composeStyle(
            {
              fontFamily: FONT_BODY,
              fontSize: '3.76cqi',
              lineHeight: 1.69,
              color: BROWN,
              fontWeight: 400,
            },
            styleOf('description')
          )}
        >
          {content.description}
        </p>
      </div>
    </div>
  );

  const rootStyle = composeStyle(
    { backgroundColor: SAND },
    blockBackgroundStyle(background)
  );

  const contentSurface = (
    <div
      data-element-key='contentSurface'
      aria-hidden
      className={cn(
        selectableClass(activeKey === 'contentSurface'),
        'absolute inset-y-0 left-1/2 -translate-x-1/2'
      )}
      style={composeStyle(
        { width: RE_CONTENT_W, backgroundColor: '#fff' },
        styleOf('contentSurface')
      )}
    />
  );

  const padY = { paddingTop: RE_SECTION_GAP, paddingBottom: RE_SECTION_GAP };

  if (isCanvas) {
    return (
      <div
        ref={rootRef}
        data-canvas-edit='true'
        style={rootStyle}
        className={cn('@container relative w-full', className)}
      >
        <style>{FONT_CSS}</style>
        {contentSurface}
        <div
          className='relative flex flex-col'
          style={{ ...padY, gap: SECTION_GAP_X }}
        >
          {header}
          <div
            className='mx-auto grid grid-cols-2'
            style={{
              width: `calc(${CARD_W} * 2 + ${GAP_X})`,
              maxWidth: '100%',
              gap: GAP_X,
            }}
          >
            {items.map((item, i) => renderCard(item, i))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      style={rootStyle}
      className={cn('@container relative w-full overflow-hidden', className)}
    >
      <style>{FONT_CSS}</style>
      {contentSurface}
      <div
        className='relative flex flex-col'
        style={{ ...padY, gap: SECTION_GAP_X }}
      >
        {header}

        <div
          ref={viewportRef}
          className={cn(
            'w-full',
            reduce ? 'overflow-x-auto' : 'overflow-hidden'
          )}
        >
          <div
            ref={trackRef}
            className='flex w-max flex-row flex-nowrap'
            style={{ gap: GAP_X, paddingLeft: PAD_X, paddingRight: PAD_X }}
          >
            {items.map((item, i) => renderCard(item, i))}
          </div>
        </div>
      </div>
    </div>
  );
}
