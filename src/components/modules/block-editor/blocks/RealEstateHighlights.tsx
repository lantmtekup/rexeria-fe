'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
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
  RE_SECTION_GAP,
  SAND,
  FONT_CSS,
} from './realEstateFonts';
import { useContainerMobile } from './useContainerMobile';

/**
 * Hai tier layout. Nền trắng full-bleed (không còn dải sand + cột trắng).
 * Production (mọi bề rộng): scrub ngang theo scroll — cùng hiệu ứng mobile.
 * Canvas edit: lưới tĩnh để chọn/sửa card (mobile 2 cột, wide 4 cột).
 *
 * `mobile` (<672) giữ tỉ lệ cqi từ canvas Framer 372px, cột full khung.
 * `wide` (≥672) header/card/gap dùng clamp theo bề rộng BLOCK (834/1440).
 * Nội dung trong card vẫn `@container` + `cqi` theo bề rộng card.
 *
 * Phải nhánh bằng JS + `composeStyle` — không `@container { !important }`
 * để override toolbar vẫn thắng base.
 */
const TIER = {
  mobile: {
    section: {
      paddingTop: RE_SECTION_GAP,
      paddingBottom: RE_SECTION_GAP,
    } as React.CSSProperties,
    headerPadX: '6.45cqi',
    headerGap: '3.23cqi',
    title: '6.18cqi', // 23px @372
    desc: '3.76cqi', // 14px
    descMax: 'none' as const,
    cardGap: '3.23cqi', // 12px
    sectionGap: '12.9cqi',
    cardW: '66.9cqi', // ~249px @372
    scrubPadX: '6.45cqi',
    contentMax: 'none' as const,
  },
  wide: {
    section: {
      paddingTop: 'clamp(40px, 3.5cqi, 56px)',
      paddingBottom: 'clamp(88px, 8.3cqi, 120px)',
    } as React.CSSProperties,
    headerPadX: 'clamp(24px, 5.5cqi, 80px)',
    headerGap: 'clamp(12px, 1.1cqi, 16px)',
    title: 'clamp(28px, 2.9cqi, 42px)',
    desc: 'clamp(15px, 1.2cqi, 17px)',
    // Đồng bộ Location: đừng kẹp description ~720 trên desktop.
    descMax: 960,
    cardGap: 'clamp(16px, 1.8cqi, 28px)',
    sectionGap: 'clamp(32px, 3.5cqi, 48px)',
    // Card đủ lớn để đọc trên desktop, vẫn hẹp hơn viewport → scrub có ý nghĩa.
    cardW: 'clamp(220px, 22cqi, 280px)',
    scrubPadX: 'clamp(24px, 5.5cqi, 80px)',
    contentMax: 1000,
  },
} as const;

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
  const trackRef = React.useRef<HTMLDivElement>(null);

  const isMobile = useContainerMobile(rootRef);
  const tier = isMobile ? TIER.mobile : TIER.wide;

  const items = Array.isArray(content.items) ? content.items : [];

  // Canvas editor (author) vs PreviewMode / `/p` (production).
  const isCanvas = useIsCanvasEdit(rootRef);

  // Chỉ canvas dùng lưới tĩnh; production luôn scrub (kể cả desktop).
  const useStaticGrid = isCanvas;
  const gridCols = isMobile ? 2 : 4;

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

      // Scrub production mọi bề rộng — canvas giữ lưới để edit.
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
        className={cn(
          '@container relative aspect-[249/359]',
          useStaticGrid ? 'w-full min-w-0' : 'flex-none'
        )}
        style={{
          backgroundColor: SAND,
          width: useStaticGrid ? '100%' : tier.cardW,
        }}
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

  const rootStyle = composeStyle(
    { backgroundColor: '#fff' },
    blockBackgroundStyle(background)
  );

  // Full-bleed trắng — layer chọn được vẫn giữ để đổi màu nền trên canvas.
  const contentSurface = (
    <div
      data-element-key='contentSurface'
      aria-hidden
      className={cn(
        selectableClass(activeKey === 'contentSurface'),
        'absolute inset-0'
      )}
      style={composeStyle(
        { backgroundColor: '#fff' },
        styleOf('contentSurface')
      )}
    />
  );

  const header = (
    <div
      className='relative mx-auto flex w-full flex-col items-center text-center'
      style={{
        maxWidth: tier.contentMax === 'none' ? undefined : tier.contentMax,
        gap: tier.headerGap,
        paddingLeft: tier.headerPadX,
        paddingRight: tier.headerPadX,
      }}
    >
      <h2
        data-appear
        data-element-key='title'
        className={cn(selectableClass(activeKey === 'title'), 'w-full')}
        style={composeStyle(
          {
            fontFamily: FONT_HEADING,
            fontSize: tier.title,
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
            fontSize: tier.desc,
            lineHeight: 1.69,
            color: BROWN,
            fontWeight: 400,
            maxWidth: tier.descMax,
            marginInline: 'auto',
          },
          styleOf('description')
        )}
      >
        {content.description}
      </p>
    </div>
  );

  const cardsGrid = (
    <div
      className={cn(
        'relative mx-auto grid w-full',
        gridCols === 4 ? 'grid-cols-4' : 'grid-cols-2'
      )}
      style={{
        maxWidth: isMobile ? '100%' : 1280,
        gap: tier.cardGap,
        paddingLeft: tier.headerPadX,
        paddingRight: tier.headerPadX,
      }}
    >
      {items.map((item, i) => renderCard(item, i))}
    </div>
  );

  const cardsScrub = (
    <div
      className={cn(
        'relative w-full',
        reduce ? 'overflow-x-auto' : 'overflow-hidden'
      )}
    >
      <div
        ref={trackRef}
        className='flex w-max flex-row flex-nowrap'
        style={{
          gap: tier.cardGap,
          paddingLeft: tier.scrubPadX,
          paddingRight: tier.scrubPadX,
        }}
      >
        {items.map((item, i) => renderCard(item, i))}
      </div>
    </div>
  );

  return (
    <div
      ref={rootRef}
      data-canvas-edit={isCanvas ? 'true' : undefined}
      style={rootStyle}
      className={cn(
        '@container relative w-full',
        !useStaticGrid && 'overflow-hidden',
        className
      )}
    >
      <style>{FONT_CSS}</style>
      {contentSurface}
      <div
        className='relative flex flex-col'
        style={{ ...tier.section, gap: tier.sectionGap }}
      >
        {header}
        {useStaticGrid ? cardsGrid : cardsScrub}
      </div>
    </div>
  );
}
